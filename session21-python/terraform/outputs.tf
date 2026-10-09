output "cluster_name" { value = module.eks.cluster_name }
output "cluster_endpoint" { value = module.eks.cluster_endpoint }
output "vpc_id" { value = module.vpc.vpc_id }
output "operator_role_arn" { value = aws_iam_role.operator.arn }
output "repositories" {
  value = { for name, repository in aws_ecr_repository.application : name => repository.repository_url }
}
