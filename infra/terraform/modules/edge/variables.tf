variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "api_route_prefix" {
  type        = string
  description = "API route pattern protected by the edge layer."
}

variable "tls_min_version" {
  type        = string
  description = "Minimum accepted TLS version."
}
