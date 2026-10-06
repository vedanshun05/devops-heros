variable "aws_region" {
  description = "AWS region for the Session 19 mini project."
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "Small x86_64 EC2 instance for the web-server lab."
  type        = string
  default     = "t3.micro"
}
