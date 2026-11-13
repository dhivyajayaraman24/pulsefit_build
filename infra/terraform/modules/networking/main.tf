locals {
  planned_resources = {
    vpc             = "${var.name_prefix}-vpc"
    cidr            = var.vpc_cidr
    public_subnets  = "multi-az public subnets for ingress"
    private_subnets = "multi-az private subnets for containers, database, queues, and workers"
    endpoints       = "VPC endpoints for object storage, secrets, logs, and container registry"
  }
}
