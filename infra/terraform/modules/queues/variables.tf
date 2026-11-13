variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "queue_contract" {
  type        = map(string)
  description = "Required async job envelope keys."
}
