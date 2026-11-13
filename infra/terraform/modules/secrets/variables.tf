variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "secret_names" {
  type        = list(string)
  description = "Logical managed secrets required by the platform."
}
