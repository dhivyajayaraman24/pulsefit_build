locals {
  planned_resources = {
    waf             = "${var.name_prefix}-waf"
    api_gateway     = "${var.name_prefix}-api"
    cdn             = "${var.name_prefix}-cdn"
    api_route       = var.api_route_prefix
    tls_min_version = var.tls_min_version
    controls        = "rate limits, WAF managed rules, correlation ID propagation, and API routing"
  }
}
