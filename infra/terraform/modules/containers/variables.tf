variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "services" {
  type        = map(string)
  description = "Containerized application and worker paths."
}
