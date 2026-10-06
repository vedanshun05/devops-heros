# EC2 assumes this role to get temporary AWS credentials.
resource "aws_iam_role" "web" {
  name_prefix = "session19-mini-web-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = {
    Session   = "19"
    ManagedBy = "Terraform"
  }
}

# Least privilege: read just the one page, with no upload or delete access.
resource "aws_iam_role_policy" "read_page" {
  name = "read-mini-project-page"
  role = aws_iam_role.web.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "s3:GetObject"
      Resource = "${aws_s3_bucket.assets.arn}/${aws_s3_object.index.key}"
    }]
  })
}

# An instance profile connects the IAM role to an EC2 instance.
resource "aws_iam_instance_profile" "web" {
  name_prefix = "session19-mini-web-"
  role        = aws_iam_role.web.name
}
