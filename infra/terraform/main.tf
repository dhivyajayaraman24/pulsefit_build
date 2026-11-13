locals {
  name_prefix = "${var.app_name}-${var.environment}"
}

module "networking" {
  source      = "./modules/networking"
  name_prefix = local.name_prefix
  vpc_cidr    = var.vpc_cidr
}

module "containers" {
  source      = "./modules/containers"
  name_prefix = local.name_prefix
  services = {
    core_api              = "services/core"
    frontdesk_trainer_pwa = "apps/frontdesk-trainer-pwa"
    management_portal    = "apps/management-portal"
    member_mobile_web    = "apps/member-mobile"
    workers              = "services/core/workers"
  }
}

module "database" {
  source                 = "./modules/database"
  name_prefix            = local.name_prefix
  engine_version         = "15"
  retention_years        = 8
  deletion_protection    = var.environment == "production"
  field_encryption_notes = "KYC and health declaration field encryption is required by application schema and key policy."
}

module "queues" {
  source      = "./modules/queues"
  name_prefix = local.name_prefix
  queue_contract = {
    schema_version_key = "schemaVersion"
    idempotency_key    = "idempotencyKey"
    correlation_id_key = "correlationId"
  }
}

module "object_storage" {
  source      = "./modules/object-storage"
  name_prefix = local.name_prefix
  buckets = [
    "exports",
    "invoices",
    "migration-reports",
    "audit-exports",
    "sboms"
  ]
}

module "edge" {
  source          = "./modules/edge"
  name_prefix     = local.name_prefix
  api_route_prefix = "/v1/*"
  tls_min_version = "TLSv1.2"
}

module "observability" {
  source      = "./modules/observability"
  name_prefix = local.name_prefix
  redaction_policy = [
    "raw payment data",
    "passwords",
    "OTP values",
    "tokens",
    "secrets",
    "KYC field values",
    "health declaration values"
  ]
}

module "secrets" {
  source      = "./modules/secrets"
  name_prefix = local.name_prefix
  secret_names = [
    "database",
    "jwt-signing",
    "payment-provider",
    "notification-provider",
    "object-storage-signing"
  ]
}
