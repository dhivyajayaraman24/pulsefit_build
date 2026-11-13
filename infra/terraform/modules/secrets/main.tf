locals {
  planned_resources = {
    secrets       = [for secret in var.secret_names : "${var.name_prefix}/${secret}"]
    storage       = "AWS managed secrets or parameter service"
    access_policy = "least privilege task and deployment roles"
    source_policy = "no secrets committed to source, logs, images, or config files"
  }
}
