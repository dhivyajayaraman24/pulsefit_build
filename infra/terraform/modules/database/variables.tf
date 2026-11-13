variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "engine_version" {
  type        = string
  description = "PostgreSQL major version."
}

variable "retention_years" {
  type        = number
  description = "Financial retention period in years."
}

variable "deletion_protection" {
  type        = bool
  description = "Whether destructive database changes are protected."
}

variable "field_encryption_notes" {
  type        = string
  description = "Application-sensitive field encryption requirement note."
}
