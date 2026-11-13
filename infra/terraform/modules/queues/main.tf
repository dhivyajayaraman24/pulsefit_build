locals {
  planned_resources = {
    queue_namespace = "${var.name_prefix}-jobs"
    cache_locks     = "${var.name_prefix}-redis"
    contract        = var.queue_contract
    worker_scope    = "async jobs, locks, notifications, exports, and migration processing"
  }
}
