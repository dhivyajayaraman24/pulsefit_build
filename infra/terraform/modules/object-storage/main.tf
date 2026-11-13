locals {
  planned_resources = {
    buckets          = [for bucket in var.buckets : "${var.name_prefix}-${bucket}"]
    encryption       = "AES-256 at rest"
    access_pattern   = "private buckets with signed URLs"
    retained_objects = "exports, invoices, migration reports, audit exports, reconciliation reports, and SBOMs"
  }
}
