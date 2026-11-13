locals {
  planned_resources = {
    cluster                 = "${var.name_prefix}-postgres"
    engine                  = "PostgreSQL ${var.engine_version}+"
    backups                 = "automated backups and point-in-time recovery"
    encryption              = "AES-256 at rest with managed keys"
    retention_years         = var.retention_years
    deletion_protection     = var.deletion_protection
    field_encryption_notes  = var.field_encryption_notes
    migration_dry_run_gate  = "required before production promotion"
  }
}
