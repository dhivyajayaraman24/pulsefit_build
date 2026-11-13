locals {
  planned_resources = {
    cluster        = "${var.name_prefix}-containers"
    runtime        = "managed AWS containers"
    services       = var.services
    deployment     = "rolling deploy with previous-image rollback"
    runtime_policy = "no secrets baked into images; runtime secrets come from managed secrets"
  }
}
