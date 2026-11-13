output "region" {
  description = "AWS region selected for this stack."
  value       = var.aws_region
}

output "component_plan" {
  description = "Skeleton component boundaries for later concrete AWS resources."
  value = {
    networking     = module.networking.planned_resources
    containers     = module.containers.planned_resources
    database       = module.database.planned_resources
    queues         = module.queues.planned_resources
    object_storage = module.object_storage.planned_resources
    edge           = module.edge.planned_resources
    observability  = module.observability.planned_resources
    secrets        = module.secrets.planned_resources
  }
}
