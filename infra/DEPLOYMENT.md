# PulseFit Deployment Assumptions

## Environments

- Staging and production run in the AWS India region `ap-south-1`.
- Deployments use container images built by CI after backend, React, Flutter, Terraform, Docker, and security gates pass.
- GitHub Environments named `staging` and `production` provide deployment approvals, environment secrets, and audit history.
- Production release approvals require evidence that no critical or high security findings remain open unless formally risk-accepted by governance.

## Infrastructure

- Terraform owns AWS networking, managed containers, PostgreSQL 15+, queues, object storage, WAF/API gateway, observability, and secrets.
- Application secrets, provider credentials, database passwords, and signing keys are stored in AWS managed secrets or parameter services, never in source control or container images.
- Object storage retains SBOMs, audit exports, invoices, migration reports, and reconciliation artifacts according to compliance retention rules.
- Observability uses CloudWatch and OpenTelemetry-compatible telemetry, with sensitive payment, KYC, health, OTP, token, and password values excluded from logs and traces.

## Release Operations

- Planned maintenance windows must be outside branch hours, between 11 pm and 5 am, with 48 hours notice.
- Staging deployments validate migrations, API contracts, smoke checks, performance targets, accessibility evidence, and integration readiness before production promotion.
- Production deployments are manual approvals after release readiness and security gates pass.
- Rollback uses the previous known-good container image and Terraform state-backed infrastructure configuration.
