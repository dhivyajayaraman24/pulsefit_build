variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "buckets" {
  type        = list(string)
  description = "Logical object storage buckets."
}
