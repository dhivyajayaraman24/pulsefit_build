variable "app_name" {
  description = "Application name used for AWS resource naming and tags."
  type        = string
  default     = "pulsefit"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be staging or production."
  }
}

variable "aws_region" {
  description = "AWS India region for PulseFit data residency alignment."
  type        = string
  default     = "ap-south-1"

  validation {
    condition     = var.aws_region == "ap-south-1"
    error_message = "PulseFit launch infrastructure must use AWS India region ap-south-1."
  }
}

variable "vpc_cidr" {
  description = "CIDR block reserved for the PulseFit VPC."
  type        = string
  default     = "10.40.0.0/16"
}
