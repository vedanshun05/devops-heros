# Private S3 storage for the page that EC2 downloads during startup.
resource "aws_s3_bucket" "assets" {
  bucket_prefix = "session19-mini-assets-"

  tags = {
    Name      = "session19-mini-assets"
    Session   = "19"
    ManagedBy = "Terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Require HTTPS for requests to the bucket and its objects.
resource "aws_s3_bucket_policy" "assets" {
  bucket = aws_s3_bucket.assets.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "DenyInsecureTransport"
      Effect    = "Deny"
      Principal = "*"
      Action    = "s3:*"
      Resource = [
        aws_s3_bucket.assets.arn,
        "${aws_s3_bucket.assets.arn}/*"
      ]
      Condition = {
        Bool = { "aws:SecureTransport" = "false" }
      }
    }]
  })
}

resource "aws_s3_object" "index" {
  bucket                 = aws_s3_bucket.assets.id
  key                    = "index.html"
  source                 = "${path.module}/website/index.html"
  source_hash            = filemd5("${path.module}/website/index.html")
  content_type           = "text/html"
  server_side_encryption = "AES256"

  depends_on = [
    aws_s3_bucket_public_access_block.assets,
    aws_s3_bucket_server_side_encryption_configuration.assets,
    aws_s3_bucket_policy.assets
  ]
}
