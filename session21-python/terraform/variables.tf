variable "aws_region" {
  type    = string
  default = "ap-south-1"
}
variable "cluster_name" {
  type    = string
  default = "session21-labboard"
}
variable "environment" {
  type    = string
  default = "homework"
}
variable "allowed_cidrs" {
  description = "IPv4 CIDRs allowed to reach the public Kubernetes API."
  type        = list(string)
}
variable "kubernetes_version" {
  type    = string
  default = "1.35"
}
