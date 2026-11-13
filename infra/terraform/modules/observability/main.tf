locals {
  planned_resources = {
    logs             = "${var.name_prefix}-logs"
    metrics          = "${var.name_prefix}-metrics"
    traces           = "${var.name_prefix}-traces"
    dashboards       = "${var.name_prefix}-dashboards"
    otel_collector   = "../observability/otel-collector.config.yaml"
    redaction_policy = var.redaction_policy
  }
}
