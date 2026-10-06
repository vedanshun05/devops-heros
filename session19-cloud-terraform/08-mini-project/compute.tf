# AWS publishes the current standard Amazon Linux 2023 x86_64 AMI here.
data "aws_ssm_parameter" "amazon_linux" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_instance" "web" {
  ami                         = data.aws_ssm_parameter.amazon_linux.value
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.web.id]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.web.name
  user_data_replace_on_change = true

  user_data = templatefile("${path.module}/user-data.sh.tftpl", {
    aws_region  = var.aws_region
    bucket_name = aws_s3_bucket.assets.id
    object_key  = aws_s3_object.index.key
    page_hash   = filemd5("${path.module}/website/index.html")
  })

  # Require the token-based instance metadata service for role credentials.
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 8
    encrypted             = true
    delete_on_termination = true
  }

  # Standard mode avoids extra charges for surplus burstable CPU credits.
  credit_specification {
    cpu_credits = "standard"
  }

  tags = {
    Name      = "session19-mini-web"
    Session   = "19"
    ManagedBy = "Terraform"
  }

  # Startup needs a working internet route and the S3 read permission.
  # Direct references above already handle the subnet, SG, and profile.
  depends_on = [
    aws_route_table_association.public,
    aws_iam_role_policy.read_page,
    aws_s3_object.index
  ]
}
