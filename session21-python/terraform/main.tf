data "aws_caller_identity" "current" {}

module "vpc" {
  source                  = "terraform-aws-modules/vpc/aws"
  version                 = "5.8.1"
  name                    = "${var.cluster_name}-vpc"
  cidr                    = "10.21.0.0/16"
  azs                     = ["${var.aws_region}a", "${var.aws_region}b"]
  public_subnets          = ["10.21.101.0/24", "10.21.102.0/24"]
  map_public_ip_on_launch = true
  enable_nat_gateway      = false
  public_subnet_tags      = { "kubernetes.io/role/elb" = "1" }
}

# EKS access entries require an IAM role/user. Account-root trust delegates to
# account IAM identities with sts:AssumeRole permission; root itself cannot assume roles.
resource "aws_iam_role" "operator" {
  name = "${var.cluster_name}-operator"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { AWS = data.aws_caller_identity.current.arn }
      Condition = endswith(data.aws_caller_identity.current.arn, ":root") ? {} : { ArnEquals = { "aws:PrincipalArn" = data.aws_caller_identity.current.arn } }
    }]
  })
}

module "eks" {
  source                                   = "terraform-aws-modules/eks/aws"
  version                                  = "20.37.1"
  cluster_name                             = var.cluster_name
  cluster_version                          = var.kubernetes_version
  vpc_id                                   = module.vpc.vpc_id
  subnet_ids                               = module.vpc.public_subnets
  cluster_endpoint_private_access          = true
  cluster_endpoint_public_access           = true
  cluster_endpoint_public_access_cidrs     = var.allowed_cidrs
  enable_cluster_creator_admin_permissions = false
  enable_irsa                              = true
  cluster_addons = {
    coredns    = {}
    kube-proxy = {}
    vpc-cni    = { before_compute = true }
  }
  access_entries = {
    operator = {
      principal_arn = aws_iam_role.operator.arn
      policy_associations = {
        admin = {
          policy_arn   = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = { type = "cluster" }
        }
      }
    }
  }
  eks_managed_node_groups = {
    lab = {
      instance_types = ["t3.small"]
      ami_type       = "AL2023_x86_64_STANDARD"
      min_size       = 1
      max_size       = 2
      desired_size   = 1
      disk_size      = 20
    }
  }
}

resource "aws_iam_role_policy" "operator" {
  role = aws_iam_role.operator.id
  policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Action = "eks:DescribeCluster", Resource = module.eks.cluster_arn }]
  })
}

resource "aws_iam_role" "ebs" {
  name = "${var.cluster_name}-ebs-csi"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRoleWithWebIdentity"
      Principal = { Federated = module.eks.oidc_provider_arn }
      Condition = {
        StringEquals = {
          "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:sub" = "system:serviceaccount:kube-system:ebs-csi-controller-sa"
          "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })
}
resource "aws_iam_role_policy_attachment" "ebs" {
  role       = aws_iam_role.ebs.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}
resource "aws_eks_addon" "ebs" {
  cluster_name = module.eks.cluster_name
  addon_name   = "aws-ebs-csi-driver"
  configuration_values = jsonencode({
    controller          = { replicaCount = 1 }
    defaultStorageClass = { enabled = true }
  })
  service_account_role_arn = aws_iam_role.ebs.arn
  depends_on               = [aws_iam_role_policy_attachment.ebs]
}
resource "aws_ecr_repository" "application" {
  for_each             = toset(["backend", "frontend"])
  name                 = "${var.cluster_name}-${each.value}"
  image_tag_mutability = "IMMUTABLE"
  force_delete         = true
  encryption_configuration { encryption_type = "AES256" }
}
