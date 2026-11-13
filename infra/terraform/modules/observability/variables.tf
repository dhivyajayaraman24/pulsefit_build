variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "redaction_policy" {
  type        = list(string)
  description = "Sensitive values excluded from logs, metrics, and traces."
}
