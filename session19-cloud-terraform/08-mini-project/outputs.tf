output "vpc_id" {
  value = aws_vpc.main.id
}

output "vpc_cidr" {
  value = aws_vpc.main.cidr_block
}

output "subnet_id" {
  value = aws_subnet.public.id
}

output "security_group_id" {
  value = aws_security_group.web.id
}

output "aws_region" {
  description = "Use this region for AWS CLI and console verification."
  value       = var.aws_region
}

output "instance_id" {
  description = "EC2 instance running the web server."
  value       = aws_instance.web.id
}

output "public_ip" {
  value = aws_instance.web.public_ip
}

output "website_url" {
  description = "Open this HTTP URL after the startup script finishes."
  value       = "http://${aws_instance.web.public_ip}"
}

output "bucket_name" {
  description = "Private S3 bucket containing the web page."
  value       = aws_s3_bucket.assets.id
}

output "page_s3_uri" {
  value = "s3://${aws_s3_bucket.assets.id}/${aws_s3_object.index.key}"
}
