# PulseFit Terraform Skeleton

This Terraform root models the AWS India-region platform for PulseFit. The modules are intentionally skeletal in this task so later infrastructure work can add concrete resources without changing the platform boundaries.

Components:

- `networking`: VPC, private/public subnets, NAT, security groups, and VPC endpoints.
- `containers`: managed container services for the NestJS API, React apps, Flutter web build, and workers.
- `database`: PostgreSQL 15+ transactional store with backups and encryption.
- `queues`: Redis-compatible cache, locks, and async job queues.
- `object-storage`: encrypted buckets for exports, invoices, migration reports, audit exports, and SBOMs.
- `edge`: WAF, rate limiting, API gateway, CDN, and TLS routing for `/v1/*`.
- `observability`: logs, metrics, traces, dashboards, alarms, and OpenTelemetry collector integration.
- `secrets`: managed application and provider secrets.
