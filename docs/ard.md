# Architecture Requirements Document (ARD)

> Replace all `<PLACEHOLDER>` values. Every material architecture decision or constraint should have a stable ID that feature specifications can reference.

## Document Metadata

- **Product/Application:** PulseFit Gym Management Platform
- **Document ID:** ARD-PULSEFIT
- **Version:** Draft v0.1
- **Status:** Draft
- **Architecture Owner:** Engineering
- **Contributors:** PulseFit Product Owner, Client, Engineering, QA, Operations, Finance, Legal/Compliance
- **Last Updated:** 2026-11-13
- **Reference PRD:** `PRD.md`

---

## 1. Architecture Summary

PulseFit will be delivered as a cloud-hosted, modular monolith gym management platform on AWS in an India region. The platform serves three launch applications: a Flutter Member Mobile App, a React TypeScript Front-Desk/Trainer PWA, and a React TypeScript Management Portal. A NestJS backend exposes secured REST APIs behind WAF and API gateway controls, with separated domain modules for identity, memberships, billing, booking, check-in, trainer operations, CRM, notifications, reporting, and migration.

PostgreSQL is the transactional system of record, with branch-scoped access enforced at the API layer and PostgreSQL read replica plus pre-aggregated reporting tables for dashboards and standard reports. Redis supports caching, sessions, distributed locks, and offline check-in eligibility support. AWS managed queue-backed workers handle renewals, payment retries, notifications, waitlist promotion, commission generation, report aggregation, settlement imports, accounting exports, audit exports, and migration jobs.

Key drivers are revenue protection, reliable online payments, multi-branch control, fast QR check-in, booking concurrency integrity, privacy/security compliance, and staged rollout across branch waves.

## 2. Architecture Drivers

- PRD-FR-001 — Centralized membership data must drive billing, booking, check-in, renewals, and reporting.
- PRD-FR-002 — Assisted renewals and opt-in auto-renewal require idempotent jobs, retries, reminders, and exception queues.
- PRD-FR-003 — Payment, invoice, refund, GST split, settlement import, and accounting export workflows require auditable financial processing.
- PRD-FR-004 — Booking must enforce capacity under concurrent load and support waitlist promotion.
- PRD-FR-006 — QR check-in must validate member eligibility in under 2 seconds for 95% of scans and tolerate short branch outages.
- PRD-FR-010 — Centralized multi-branch administration requires RBAC plus branch-scoped data access.
- PRD-FR-011 — Real-time dashboards and 12-month reports must load under 5 seconds.
- PRD-FR-012 — Data migration must support validation, rejected-row reports, dry runs, reconciliation, and signed-off cut-over.
- PRD-NFR-001 — Common read APIs must return within 500 ms at the 95th percentile.
- PRD-NFR-002 — Concurrent booking must prevent overbooking and respond under 1 second.
- PRD-NFR-003 — Launch capacity is 9,000 active members, 1,500 concurrent app users, and 60 check-ins per minute per branch.
- PRD-NFR-004 — Availability must be 99.5% monthly at launch, with RPO 15 minutes or less and RTO 4 hours or less.
- PRD-NFR-005 — Authentication, RBAC, branch scoping, TLS 1.2+, AES-256 at rest, and field-level encryption are mandatory.
- PRD-NFR-006 — Payment data must remain with gateway-hosted checkout or tokenization; PulseFit must not store or log raw card numbers.
- PRD-NFR-007 — Consent, data export/deletion, DPDP support, and GST support must be built into platform workflows.
- PRD-NFR-009 — Structured observability and immutable audit logs are required for financial and membership-changing actions.
- CON-001 — The client is a mid-market company in the Other industry category.
- CON-002 — The MVP must cover Member Mobile App, Front-Desk/Trainer App, and Management Portal.
- CON-003 — Member App must support iOS and Android cross-platform delivery plus responsive web portal access where applicable.
- CON-004 — Front-Desk/Trainer App must be tablet-friendly and support offline-tolerant check-in.
- CON-005 — Management Portal must be a responsive web application.
- CON-006 — Payments must use hosted checkout or tokenization; PulseFit must not store raw card numbers.
- CON-007 — Financial records retention is 8 years; inactive member data anonymization after 3 years is subject to legal review.
- CON-008 — Planned maintenance windows must occur outside branch hours, 11 pm to 5 am, with 48 hours’ notice.
- CON-009 — UAT must pass all Must-have items before launch.
- CON-010 — Exit criteria require no open critical or high defects, NFR targets met in staging, penetration test findings resolved, and data migration reconciled.

## 3. Architecture Principles

1. Centralize member, membership status, payment, booking, and check-in rules in backend domain services rather than duplicating logic in clients.
2. Design every payment, renewal, booking, webhook, queue consumer, and migration operation to be idempotent.
3. Reuse established repository and platform patterns where appropriate.
4. Keep presentation, orchestration, domain, integration, and persistence concerns separated.
5. Enforce role and branch scope at the API layer for all protected data access.
6. Prefer provider-agnostic integration adapters so payment, messaging, and export providers can be changed without rewriting domain logic.
7. Keep sensitive data minimized, encrypted, and excluded from logs, analytics, local caches, and exports unless explicitly required.

## 4. System Context

### 4.1 Actors

- Members — Use the Member Mobile App to view profile and membership status, renew, pay, book, cancel, receive notifications, and check in with QR.
- Front-desk and branch staff — Use the Front-Desk/Trainer PWA for member lookup, check-in, assisted renewal, payments, exception handling, attendance, and branch workflows.
- Trainers — Use the Front-Desk/Trainer PWA for schedules, assigned sessions, attendance, and commission/payout visibility.
- Owners and management team — Use the Management Portal for centralized plans, reports, users, permissions, branch controls, and performance monitoring.
- Finance users — Use the Management Portal for payments, invoices, receipts, refunds, GST tax split, settlements, and accounting exports.
- Marketing/admin users — Use the Management Portal for lead management, notifications, and campaign-adjacent operational workflows.
- Client operations team — Provides legacy spreadsheets and billing tool exports for migration and validates reconciliation reports.
- Legal/Compliance reviewers — Confirm DPDP, GST, financial retention, health consent, and inactive-member anonymization decisions.
- QA and UAT participants — Validate Must-have workflows, migration reconciliation, performance, security, accessibility, and launch readiness.

### 4.2 External Systems

| ID | System | Purpose | Interface | Owner |
|---|---|---|---|---|
| EXT-001 | Payment gateway | UPI, cards, net banking, recurring mandate/tokenized payments, signed webhooks, refunds, and settlement import | REST/Webhook/File | Provider TBD; Finance/Engineering |
| EXT-002 | SMS provider | Transactional SMS, DLT templates, delivery receipts | REST/Webhook | Provider TBD; Operations/Engineering |
| EXT-003 | WhatsApp Business API provider | Template reminders, payment links, confirmations, opt-in-aware messages | REST/Webhook | Provider TBD; Operations/Engineering |
| EXT-004 | Email provider | Transactional email with SPF/DKIM configured | REST/SMTP/Webhook | Provider TBD; Operations/Engineering |
| EXT-005 | FCM and APNs | Push notifications for Android and iOS | REST/Platform API | Google/Apple; Engineering |
| EXT-006 | Accounting software | Export invoices, receipts, refunds, payments, and settlements | File initially; API connector deferred | Finance Owner |
| EXT-007 | Legacy spreadsheets and billing tool | Source data for member, plan, balance, and expiry-date migration | File | Client Operations |
| EXT-008 | App stores | Mobile app distribution and phased rollout | Store release process | Apple/Google; Engineering |
| EXT-009 | Optional access-control hardware | Turnstile or biometric entry validation deferred to Phase 2 | REST/Device API | Device vendor TBD |

## 5. Technology Stack

| Layer | Technology | Version/Constraint | Rationale |
|---|---|---|---|
| Frontend | Flutter Member Mobile App | Android 9+, iOS 15+ | Single mobile codebase with native QR and push support. |
| Frontend | React with TypeScript for Front-Desk/Trainer PWA and Management Portal | Latest two versions of Chrome, Safari, Edge, and Firefox | Shared web stack, responsive portal, tablet-friendly PWA, and reusable components. |
| Backend | Node.js with NestJS | Node.js LTS; NestJS current stable | Structured modular monolith, TypeScript alignment, REST APIs, workers, and testability. |
| Data | PostgreSQL | 15+ | Transactional system of record, relational integrity, branch scoping, financial records, and reporting read replica. |
| Data | Redis | Managed Redis-compatible service | Cache, sessions, distributed locks, queue support where applicable, and short-lived eligibility cache patterns. |
| Data | AWS object storage | Encrypted buckets with signed URLs and retention controls | KYC references, invoices, exports, rejected-row reports, reconciliation artifacts, SBOMs, and immutable audit exports. |
| Integration/Async | AWS managed queue and workers | Idempotent consumers | Renewals, retries, notifications, waitlist promotion, reporting aggregation, commissions, exports, and migration. |
| Edge | AWS WAF, CDN, API gateway | India region | TLS termination, rate limiting, routing, authentication integration, and DDoS/WAF protection. |
| Hosting | AWS India region containers | Dev, staging, production | Data-residency alignment, managed services, container deploys, rollback, and operational maturity. |
| Observability | AWS CloudWatch plus OpenTelemetry tracing | Managed tracing backend | Logs, metrics, alerts, correlation IDs, distributed traces, and operational dashboards. |
| CI/CD | Git-based pipelines with Terraform IaC | Build/lint/type/test/security gates | Repeatable deployments, infrastructure versioning, release gates, and rollback support. |

## 6. Logical Architecture

### 6.1 Components

#### COMP-001 — Member Mobile App

- **Responsibility:** Provides member self-service for profile, membership status, renewals, payments, timetable, bookings, cancellations, notifications, and QR check-in.
- **Inputs:** Member credentials/OTP, member actions, device metadata, push tokens, QR display requests.
- **Outputs:** REST API requests, payment redirect/session actions, push token registration, local UI state.
- **Dependencies:** COMP-004, COMP-005, COMP-006, COMP-007, COMP-008, COMP-011, EXT-008.
- **Repository Area:** `apps/member-mobile` (proposed; confirm under ARC-OQ-008)

#### COMP-002 — Front-Desk/Trainer PWA

- **Responsibility:** Supports branch staff and trainers with check-in, member lookup, assisted renewal, class/session operations, schedules, attendance, exception queues, and offline-tolerant eligibility validation.
- **Inputs:** Staff credentials, QR scans, member search criteria, attendance updates, payment/renewal actions, schedule interactions.
- **Outputs:** REST API requests, encrypted short-lived eligibility cache, synced check-in events, attendance updates.
- **Dependencies:** COMP-004, COMP-005, COMP-006, COMP-007, COMP-008, COMP-009, COMP-010, COMP-011.
- **Repository Area:** `apps/frontdesk-trainer-pwa` (proposed; confirm under ARC-OQ-008)

#### COMP-003 — Management Portal

- **Responsibility:** Provides centralized management for plans, branch overrides, users, permissions, finance, leads, notifications, trainer payouts, dashboards, reports, and exports.
- **Inputs:** Management/staff credentials, configuration changes, report filters, export requests, lead updates, finance actions.
- **Outputs:** REST API requests, dashboards, reports, exports, configuration updates.
- **Dependencies:** COMP-004, COMP-005, COMP-006, COMP-007, COMP-009, COMP-010, COMP-011, COMP-012, COMP-013.
- **Repository Area:** `apps/management-portal` (proposed; confirm under ARC-OQ-008)

#### COMP-004 — Edge, WAF, and API Gateway

- **Responsibility:** Terminates TLS, applies WAF/rate-limit controls, routes REST API calls, propagates correlation IDs, and protects public endpoints.
- **Inputs:** HTTPS requests from clients and external systems.
- **Outputs:** Authenticated/routed requests to backend APIs, rejected requests, access logs, gateway metrics.
- **Dependencies:** COMP-014, COMP-015.
- **Repository Area:** `infra/edge` (proposed; confirm under ARC-OQ-008)

#### COMP-005 — Identity and Access Module

- **Responsibility:** Provides member OTP authentication, staff username/password with optional MFA, sessions, device management, RBAC, and branch-scope authorization enforcement.
- **Inputs:** Login requests, OTP challenges, credentials, MFA factors, role and branch assignments.
- **Outputs:** Sessions/tokens, authorization decisions, audit events, access-denied responses.
- **Dependencies:** COMP-014, COMP-015, COMP-017.
- **Repository Area:** `services/core/modules/identity` (proposed; confirm under ARC-OQ-008)

#### COMP-006 — Membership and Eligibility Module

- **Responsibility:** Manages members, plans, memberships, branch access, freeze/grace/expired/cancelled states, eligibility checks, and centralized status derivation.
- **Inputs:** Member records, plan configuration, membership lifecycle changes, payment outcomes, branch rules.
- **Outputs:** Membership status, eligibility decisions, renewal eligibility, audit events, reporting facts.
- **Dependencies:** COMP-005, COMP-014, COMP-017.
- **Repository Area:** `services/core/modules/membership` (proposed; confirm under ARC-OQ-008)

#### COMP-007 — Billing and Payments Module

- **Responsibility:** Orchestrates payment links, gateway sessions, webhooks, renewals, refunds, invoices/receipts, GST split, settlement import, and financial exports.
- **Inputs:** Payment requests, renewal requests, signed webhooks, refund requests, settlement files, export requests.
- **Outputs:** Payment records, invoice/receipt records, refund records, renewal state changes, settlement reconciliation results, accounting export files.
- **Dependencies:** COMP-006, COMP-014, COMP-015, COMP-016, COMP-017, EXT-001, EXT-006.
- **Repository Area:** `services/core/modules/billing` (proposed; confirm under ARC-OQ-008)

#### COMP-008 — Booking and Scheduling Module

- **Responsibility:** Manages class timetable, bookings, cancellations, capacity locking, waitlist promotion, attendance, no-shows, and trainer/session assignment integration.
- **Inputs:** Timetable configuration, booking/cancellation requests, attendance updates, trainer assignments, waitlist events.
- **Outputs:** Booking records, attendance records, waitlist promotions, eligibility checks, notifications, reporting facts.
- **Dependencies:** COMP-006, COMP-009, COMP-011, COMP-014, COMP-015, COMP-017.
- **Repository Area:** `services/core/modules/booking` (proposed; confirm under ARC-OQ-008)

#### COMP-009 — Check-In Module

- **Responsibility:** Validates QR check-ins against membership status and branch access, records check-in events, and supports encrypted short-lived offline eligibility cache and later sync.
- **Inputs:** QR payloads, branch/device context, cached eligibility data, synced offline check-in events.
- **Outputs:** Accepted/rejected check-in responses, check-in records, rejection reasons, audit events, metrics.
- **Dependencies:** COMP-006, COMP-014, COMP-015, COMP-017.
- **Repository Area:** `services/core/modules/check-in` (proposed; confirm under ARC-OQ-008)

#### COMP-010 — Trainer and Commission Module

- **Responsibility:** Manages trainer profiles, certifications, schedules, assignments, attendance-based commission rules, and monthly payout statements.
- **Inputs:** Trainer records, assignment data, attendance records, commission rules, payout generation requests.
- **Outputs:** Trainer schedules, commission entries, payout statements, reporting facts, audit events.
- **Dependencies:** COMP-008, COMP-014, COMP-015, COMP-017.
- **Repository Area:** `services/core/modules/trainer-commission` (proposed; confirm under ARC-OQ-008)

#### COMP-011 — CRM and Leads Module

- **Responsibility:** Supports lead capture, owner assignment, status pipeline, follow-up reminders, conversion to member, and lead reporting.
- **Inputs:** Lead form data, manual lead entries, follow-up updates, conversion requests.
- **Outputs:** Lead records, reminders, converted member records, conversion reporting facts, notifications.
- **Dependencies:** COMP-006, COMP-012, COMP-014, COMP-015, COMP-017.
- **Repository Area:** `services/core/modules/crm` (proposed; confirm under ARC-OQ-008)

#### COMP-012 — Notification Module

- **Responsibility:** Sends SMS, WhatsApp template messages, email, and push notifications using provider-agnostic adapters with consent and delivery tracking.
- **Inputs:** Notification requests, templates, consent records, channel preferences, provider callbacks.
- **Outputs:** Sent messages, delivery receipts, retry records, failures, audit/log events.
- **Dependencies:** COMP-014, COMP-015, COMP-017, EXT-002, EXT-003, EXT-004, EXT-005.
- **Repository Area:** `services/core/modules/notifications` (proposed; confirm under ARC-OQ-008)

#### COMP-013 — Reporting Module

- **Responsibility:** Builds real-time dashboards and standard reports using read replica and pre-aggregated reporting tables refreshed by async workers.
- **Inputs:** Transactional facts from membership, billing, booking, check-in, CRM, and trainer modules; report filters.
- **Outputs:** Dashboard metrics, standard reports, exports, operational metrics, reconciliation views.
- **Dependencies:** COMP-014, COMP-015, COMP-017.
- **Repository Area:** `services/core/modules/reporting` (proposed; confirm under ARC-OQ-008)

#### COMP-014 — PostgreSQL Data Store

- **Responsibility:** Acts as transactional system of record and reporting read source, with row/tenant/branch-aware schema design and append-only audit records.
- **Inputs:** Domain writes, transactions, migrations, reporting aggregations, audit writes.
- **Outputs:** Domain reads, read replica streams, backup logs, audit data, reporting tables.
- **Dependencies:** AWS managed database services.
- **Repository Area:** `services/core/db` (proposed; confirm under ARC-OQ-008)

#### COMP-015 — Redis, Queue, and Worker Platform

- **Responsibility:** Provides caching, sessions where applicable, distributed locks, queue-backed jobs, idempotent retries, and background processing.
- **Inputs:** Job messages, cache keys, distributed lock requests, retry schedules.
- **Outputs:** Processed jobs, queue metrics, retry results, cache entries/evictions.
- **Dependencies:** AWS managed Redis-compatible service and AWS managed queue.
- **Repository Area:** `services/core/workers` (proposed; confirm under ARC-OQ-008)

#### COMP-016 — Object Storage and Export Service

- **Responsibility:** Stores encrypted documents, invoices, exports, migration reports, rejected-row reports, reconciliation reports, audit exports, SBOMs, and signed URL assets.
- **Inputs:** Files, invoices, KYC references, export artifacts, audit export jobs, SBOM artifacts.
- **Outputs:** Signed URLs, scheduled export files, immutable audit archives, retained artifacts.
- **Dependencies:** AWS object storage, COMP-017.
- **Repository Area:** `services/core/modules/files-exports` (proposed; confirm under ARC-OQ-008)

#### COMP-017 — Audit and Compliance Module

- **Responsibility:** Creates immutable audit records for financial, membership-changing, authorization, consent, export, and admin actions; periodically exports audit archives to immutable object storage.
- **Inputs:** Domain audit events, actor context, entity changes, IP/device metadata, consent events.
- **Outputs:** Append-only audit rows, immutable audit export files, compliance evidence.
- **Dependencies:** COMP-014, COMP-016.
- **Repository Area:** `services/core/modules/audit-compliance` (proposed; confirm under ARC-OQ-008)

#### COMP-018 — Data Migration Module

- **Responsibility:** Imports legacy spreadsheets and billing tool exports with validation, duplicate checks, rejected-row reports, dry-run reconciliation, and final cut-over support.
- **Inputs:** Spreadsheet exports, billing tool files, mapping configuration, migration run requests.
- **Outputs:** Imported member/membership records, rejected-row reports, reconciliation reports, migration audit records.
- **Dependencies:** COMP-006, COMP-007, COMP-014, COMP-016, COMP-017, EXT-007.
- **Repository Area:** `services/core/modules/migration` (proposed; confirm under ARC-OQ-008)

### 6.2 Data Flow

1. Clients send authenticated REST requests through COMP-004 to backend domain modules.
2. COMP-005 authenticates users and enforces RBAC and branch scopes for each protected request.
3. COMP-006 derives centralized membership eligibility for billing, booking, check-in, renewal, and reporting workflows.
4. COMP-007 creates gateway payment sessions and accepts only signature-verified payment webhooks from EXT-001 before changing payment, invoice, or renewal state.
5. COMP-008 uses transactional locking in PostgreSQL to enforce class capacity and publishes waitlist promotion jobs to COMP-015.
6. COMP-009 validates QR payloads against current eligibility or encrypted minimum offline eligibility data, then syncs audited check-in events when online.
7. COMP-012 sends channel-specific notifications through provider-agnostic adapters and records delivery outcomes.
8. COMP-013 refreshes pre-aggregated reporting tables from transactional facts and serves dashboards through read-optimized queries.
9. COMP-018 imports legacy data into staging, emits rejected-row and reconciliation reports, and performs final cut-over only after sign-off.
10. COMP-017 records append-only audit events and periodically exports immutable audit archives to COMP-016.

## 7. Architecture Decisions

### ARD-DEC-001 — Use Modular Monolith for Launch

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-FR-004, PRD-FR-006, PRD-FR-011, PRD-NFR-003

**Decision**

PulseFit will launch as a modular monolith backend in NestJS with separate domain modules and asynchronous workers. Billing, booking, notifications, and reporting may be split later if load or ownership boundaries require it.

**Rationale**

The PRD requires broad MVP scope across three applications. A modular monolith reduces distributed-system complexity while preserving clear boundaries for future extraction.

**Consequences**

- Faster delivery and simpler transactional consistency for membership, booking, and payments.
- Requires disciplined module boundaries to avoid tight coupling.
- Future service extraction remains possible but is not optimized on day one.

**Alternatives Considered**

- Microservices from launch — not selected because the MVP scope is broad and would increase operational, testing, and integration complexity.
- Serverless-first backend — not selected because complex transactional workflows, long-running jobs, and offline sync patterns benefit from cohesive service boundaries.

### ARD-DEC-002 — Standardize on AWS India Region Managed Platform

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-004, PRD-NFR-005, PRD-NFR-009

**Decision**

PulseFit will run on AWS in an India region using containers, managed PostgreSQL, Redis-compatible caching, managed queue, object storage, WAF, API gateway, managed secrets, CloudWatch, OpenTelemetry tracing, and Terraform IaC.

**Rationale**

The source specification identifies India-region hosting as tied to data residency confirmation, and the selected architecture uses managed cloud services to meet availability, backup, observability, and security needs.

**Consequences**

- Reduces operational burden for database, queues, storage, monitoring, and secrets.
- Aligns with possible India data residency needs.
- Requires AWS operational expertise and cost governance.

**Alternatives Considered**

- Azure or GCP India region — viable but not selected after architecture interview.
- Cloud provider TBD — not selected because architecture decisions need concrete deployment and operations patterns.

### ARD-DEC-003 — Use Flutter and React TypeScript Client Stack

- **Status:** Accepted
- **Related Requirements:** PRD-FR-006, PRD-FR-010, PRD-NFR-008, CON-002, CON-003, CON-004, CON-005

**Decision**

The Member Mobile App will use Flutter. The Front-Desk/Trainer App and Management Portal will use React with TypeScript, with the Front-Desk/Trainer experience delivered as a tablet-friendly PWA.

**Rationale**

Flutter supports iOS and Android from a single codebase, while React TypeScript supports responsive web portals, PWA behavior, and shared web UI patterns.

**Consequences**

- Enables mobile-native features for QR and push.
- Enables shared web components across operational and management apps.
- Requires cross-stack design consistency and API contract discipline.

**Alternatives Considered**

- React Native mobile app — viable but not selected after architecture interview.
- Flutter for all clients — not selected because the portal and PWA requirements align better with React TypeScript web patterns.

### ARD-DEC-004 — Use PostgreSQL as System of Record with Read Replica and Aggregates

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-003, PRD-FR-004, PRD-FR-011, PRD-NFR-001, PRD-NFR-002

**Decision**

PostgreSQL 15+ will be the transactional system of record. Reporting will use a PostgreSQL read replica and pre-aggregated reporting tables refreshed by async workers.

**Rationale**

Membership, financial, booking, and audit workflows need relational consistency. Dashboards and 12-month reports need read-optimized access without overloading operational writes.

**Consequences**

- Supports transactional locks for capacity control and financial integrity.
- Allows report performance improvements without introducing a separate warehouse at launch.
- Requires aggregation freshness monitoring and reconciliation.

**Alternatives Considered**

- Separate analytics warehouse from launch — not selected due to additional complexity before reporting scale is proven.
- Transactional database only — not selected due to dashboard and under-5-second report targets.

### ARD-DEC-005 — Use REST APIs with OpenAPI and URI Versioning

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-003, PRD-FR-004, PRD-FR-009, PRD-NFR-009

**Decision**

PulseFit will expose REST APIs documented with OpenAPI, versioned by URI prefix such as `/v1`, with consistent error envelopes, correlation IDs, and idempotency keys for payment, booking, and renewal commands.

**Rationale**

The source specification calls for secured REST APIs and OpenAPI documentation. Idempotency and correlation are essential for retries, webhooks, and support diagnostics.

**Consequences**

- Simplifies integration, testing, and contract validation.
- Requires API compatibility governance for breaking changes.
- Enables clients and external adapters to test against stable contracts.

**Alternatives Considered**

- GraphQL for client apps — not selected because REST is already specified and simpler for provider integrations and operational support.
- Undocumented REST — not selected because API documentation is required.

### ARD-DEC-006 — Use Provider-Agnostic Integration Adapters

- **Status:** Accepted
- **Related Requirements:** PRD-FR-003, PRD-FR-009, PRD-FR-011, PRD-NFR-006, PRD-NFR-007

**Decision**

Payment, SMS, WhatsApp, email, push, and accounting export integrations will use provider-agnostic adapter interfaces. Concrete providers are selected during implementation and captured as configuration.

**Rationale**

Several provider choices remain open in the PRD, and provider approval/success rates are identified risks.

**Consequences**

- Reduces vendor lock-in and isolates provider-specific failure modes.
- Requires adapter contract tests and provider-specific operational dashboards.
- Allows fallback strategies such as SMS/email if WhatsApp templates are delayed.

**Alternatives Considered**

- Direct SDK coupling — not selected because provider decisions are open and could change.
- Feature-team-specific provider choices — not selected because cross-channel consistency is required.

### ARD-DEC-007 — Use Queue-Backed Asynchronous Workers for Background Processing

- **Status:** Accepted
- **Related Requirements:** PRD-FR-002, PRD-FR-003, PRD-FR-004, PRD-FR-007, PRD-FR-009, PRD-FR-011, PRD-NFR-004

**Decision**

User-facing commands will use synchronous REST. Provider callbacks will use signed webhooks. Renewals, retries, notifications, waitlist promotion, commissions, report aggregation, settlement imports, accounting exports, audit exports, and migration jobs will run through queue-backed idempotent workers.

**Rationale**

The PRD requires retry-safe, idempotent operations and background automation while preserving responsive user interactions.

**Consequences**

- Improves resilience and supports retries for provider failures.
- Requires queue-depth monitoring, dead-letter handling, and idempotency keys.
- Some user-visible outcomes become eventually consistent.

**Alternatives Considered**

- Synchronous processing for most operations — not selected because provider delays and retries would degrade user experience.
- Fully event-driven architecture — not selected for launch due to complexity.

### ARD-DEC-008 — Built-In Identity with API-Layer RBAC and Branch Scope

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-005, PRD-FR-010, PRD-NFR-005

**Decision**

PulseFit will use a built-in identity service for member OTP and staff username/password with optional MFA. RBAC and branch-scoped authorization will be enforced at the API layer for all protected operations.

**Rationale**

The PRD specifies authentication modes and branch-scoped authorization. API-layer enforcement ensures consistent access control across all clients.

**Consequences**

- Supports role and branch rules specific to gym operations.
- Requires secure OTP rate limiting, brute-force protection, session timeout, and device management.
- External IdP integration remains optional for future enterprise needs.

**Alternatives Considered**

- Managed external IdP for all users — not selected because member OTP and branch-specific rules can be implemented directly for launch.
- Hybrid external IdP/custom OTP — viable but not selected after architecture interview.

### ARD-DEC-009 — Constrain Offline Check-In to Minimal Encrypted Eligibility Cache

- **Status:** Accepted
- **Related Requirements:** PRD-FR-006, PRD-NFR-005, PRD-NFR-007

**Decision**

The Front-Desk/Trainer PWA will cache only minimum active-member eligibility data locally for up to 30 minutes, encrypt the local cache, deny risky writes while offline, and sync audited check-in events when online.

**Rationale**

The PRD requires offline-tolerant check-in but also mandates privacy, branch scoping, and protection of sensitive member data.

**Consequences**

- Maintains branch entry continuity during short outages.
- Limits privacy exposure from local device compromise.
- Offline actions remain intentionally narrow and may require staff escalation for complex cases.

**Alternatives Considered**

- Cache full member profiles — not selected because it increases privacy and security risk.
- Allow offline renewals/payments — not selected because payment and membership writes are high-risk.

### ARD-DEC-010 — Implement Append-Only Audit with Immutable Object Storage Exports

- **Status:** Accepted
- **Related Requirements:** PRD-FR-001, PRD-FR-003, PRD-FR-005, PRD-NFR-009

**Decision**

Financial, membership-changing, authorization, consent, export, and admin actions will be recorded in an append-only PostgreSQL audit table and periodically exported to restricted immutable object storage.

**Rationale**

The PRD requires immutable audit logs for financial and membership-changing actions, and compliance evidence must be retained independently of mutable application state.

**Consequences**

- Supports audit review, incident investigation, and compliance evidence.
- Requires careful exclusion of sensitive field values and raw payment data from audit payloads.
- Requires retention, export cadence, and restricted access policies.

**Alternatives Considered**

- PostgreSQL audit table only — not selected because immutable object storage adds stronger tamper resistance.
- Dedicated event store from launch — not selected due to additional complexity.

### ARD-DEC-011 — Enforce CI/CD Security and Quality Release Gates

- **Status:** Accepted
- **Related Requirements:** PRD-NFR-005, PRD-NFR-006, PRD-NFR-008, PRD-NFR-009, CON-009, CON-010

**Decision**

CI/CD release gates will include build, lint, type checks, unit tests, integration tests, API contract tests, E2E tests, migration dry-run evidence, performance tests, accessibility tests, SAST, dependency/CVE scanning, container image scanning, secret scanning, SBOM generation, and blocking critical/high findings before release.

**Rationale**

The PRD requires no open critical/high defects, NFR targets met in staging, penetration test findings resolved, and secure handling of financial and personal data.

**Consequences**

- Improves release confidence and compliance evidence.
- Requires test automation investment and environment stability.
- Releases may be blocked when high-severity findings are detected.

**Alternatives Considered**

- Minimal dependency and secret scanning — not selected because the platform handles financial, KYC, health, and membership data.
- Manual-only security testing — not selected because CI/CD supply-chain risks must be controlled continuously.

## 8. API and Integration Architecture

### ARD-API-001 — Client REST API

- **Type:** REST
- **Operation/Topic:** `HTTPS /v1/*`
- **Provider:** COMP-004, COMP-005, and backend domain modules
- **Consumers:** COMP-001, COMP-002, COMP-003
- **Authentication:** Member OTP sessions/tokens; staff/management username/password sessions/tokens with optional MFA
- **Versioning:** URI prefix versioning, starting with `/v1`

**Request/Input Contract**

OpenAPI-defined JSON request schemas per domain. Protected requests must include authentication token/session context. Payment, booking, and renewal commands must include idempotency keys. Requests must propagate or receive a correlation ID.

**Response/Output Contract**

OpenAPI-defined JSON responses. Errors use a consistent envelope with `code`, `message`, `details`, `correlationId`, and field-level validation errors where applicable. Sensitive fields are masked or omitted.

**Error Handling**

Validation errors return 4xx responses. Authorization failures return 403. Retryable server/provider errors return 5xx or accepted async status where appropriate. Idempotent command replay returns the original operation result or safe current state.

### ARD-API-002 — Payment Gateway Integration

- **Type:** REST
- **Operation/Topic:** `POST /provider/payment-session`, `POST /provider/refund`, `POST /v1/webhooks/payments/{provider}`
- **Provider:** EXT-001 through COMP-007 adapter
- **Consumers:** COMP-007
- **Authentication:** Provider credentials in managed secrets; signed webhook verification
- **Versioning:** Adapter version per provider plus internal `/v1` webhook endpoint

**Request/Input Contract**

Payment session, payment link, recurring mandate/tokenization, refund, and settlement import contracts are defined by the configured gateway adapter. Internal payment commands include amount, currency, tax split context, member/membership reference, idempotency key, and correlation ID.

**Response/Output Contract**

Gateway references, payment session/link details, webhook status events, refund status, settlement rows, and reconciliation results are mapped to PulseFit payment, invoice, refund, and settlement records.

**Error Handling**

All webhooks require signature verification before state changes. Duplicate webhooks and retries must be idempotent. Gateway failures create retry or exception records. Raw card numbers must never be stored or logged.

### ARD-API-003 — Notification Provider Integration

- **Type:** REST
- **Operation/Topic:** `POST /provider/messages`, `POST /v1/webhooks/notifications/{provider}`
- **Provider:** EXT-002, EXT-003, EXT-004, EXT-005 through COMP-012 adapters
- **Consumers:** COMP-012 and backend domain modules via queue jobs
- **Authentication:** Provider credentials in managed secrets; provider callback authentication where supported
- **Versioning:** Adapter version per provider

**Request/Input Contract**

Notification jobs include recipient reference, channel, template ID, approved template parameters, consent status, preferred channel, correlation ID, and retry policy.

**Response/Output Contract**

Delivery acceptance, delivery receipt, failure reason, retry status, provider reference, and final delivery state are stored by COMP-012.

**Error Handling**

Missing consent blocks non-eligible messages. Provider failures use retry policies and fallbacks where configured. WhatsApp messages must use approved templates and eligible opt-in records.

### ARD-API-004 — Accounting Export Integration

- **Type:** File
- **Operation/Topic:** `scheduled export to encrypted object storage`
- **Provider:** COMP-007 and COMP-016
- **Consumers:** EXT-006, Finance users
- **Authentication:** Signed URL or controlled storage access; admin RBAC for generation/download
- **Versioning:** Export schema version in file metadata and filename

**Request/Input Contract**

Export requests include date range, branch scope, record types, accounting format configuration, and requesting user context.

**Response/Output Contract**

Configurable CSV/XLSX files for invoices, receipts, refunds, payments, and settlements stored in encrypted object storage with audit records.

**Error Handling**

Export generation failures create job failure records and alerts where applicable. Destination-specific API connector remains deferred until accounting software is confirmed.

### ARD-API-005 — Legacy Data Migration Import

- **Type:** File
- **Operation/Topic:** `staging import jobs for spreadsheets and billing tool exports`
- **Provider:** EXT-007 and COMP-018
- **Consumers:** COMP-018, COMP-006, COMP-007
- **Authentication:** Admin-only upload/generation through RBAC-controlled portal or controlled storage path
- **Versioning:** Migration mapping version per dry run

**Request/Input Contract**

Input files contain existing members, active plans, balances, and expiry dates. Mapping configuration defines required fields, validation rules, duplicate matching, and rejection criteria.

**Response/Output Contract**

Imported records, rejected-row reports with failure reason, reconciliation reports for counts, active members, and outstanding dues, and migration audit records.

**Error Handling**

Invalid rows are rejected without blocking valid rows unless global validation fails. Two staging dry runs are required before final cut-over. Final migration requires client sign-off.

### ARD-API-006 — Internal Queue Jobs

- **Type:** Queue
- **Operation/Topic:** `renewals`, `payment-retries`, `notifications`, `waitlist-promotions`, `commission-generation`, `report-aggregation`, `settlement-import`, `accounting-export`, `audit-export`, `migration`
- **Provider:** COMP-015
- **Consumers:** Backend workers in COMP-007, COMP-008, COMP-010, COMP-012, COMP-013, COMP-016, COMP-017, COMP-018
- **Authentication:** Private cloud IAM/service identity
- **Versioning:** Message schema version field

**Request/Input Contract**

Queue messages include job type, schema version, domain reference IDs, idempotency key, correlation ID, retry count, and requested execution time where applicable.

**Response/Output Contract**

Worker outputs are persisted as domain records, job status, retry/dead-letter records, metrics, and audit events.

**Error Handling**

Workers must be idempotent. Retryable failures use bounded retries and dead-letter queues. Poison messages trigger alerts and operational runbook steps.

## 9. Data Architecture

### DATA-001 — Member

- **Purpose:** Stores member identity, contact, branch, KYC reference, health declaration reference, preferred channel, consent, and lifecycle status.
- **System of Record:** PostgreSQL via COMP-006
- **Classification:** Confidential
- **Retention:** Inactive member data anonymized after 3 years unless earlier deletion is requested, subject to legal review.
- **Key Relationships:** Memberships, payments, bookings, check-ins, leads, notifications, audit records, branch.

### DATA-002 — Plan and Membership

- **Purpose:** Defines plans and active member entitlements, dates, branch access, freeze periods, grace, auto-renew flag, and derived status.
- **System of Record:** PostgreSQL via COMP-006
- **Classification:** Confidential
- **Retention:** Retained while active and according to member/accounting/legal retention rules; anonymization subject to legal review.
- **Key Relationships:** Member, branch, payments, renewals, bookings, check-ins, audit records.

### DATA-003 — Payment and Invoice

- **Purpose:** Stores payment state, gateway references, amount, tax split, mode, invoice/receipt, refund, credit note links, and settlement references.
- **System of Record:** PostgreSQL via COMP-007
- **Classification:** Restricted
- **Retention:** Financial records retained for 8 years.
- **Key Relationships:** Member, membership, invoice, refund, settlement, accounting export, audit records.

### DATA-004 — Class and Session

- **Purpose:** Defines class/session type, branch, room, trainer, time, capacity, recurrence, and waitlist behavior.
- **System of Record:** PostgreSQL via COMP-008
- **Classification:** Internal
- **Retention:** Retained according to operational reporting needs and linked financial/member retention rules.
- **Key Relationships:** Booking, attendance, trainer, branch, room, notifications, reporting facts.

### DATA-005 — Booking and Attendance

- **Purpose:** Tracks member session booking status, waitlist status, cancellation, attendance, no-show, and timestamps.
- **System of Record:** PostgreSQL via COMP-008
- **Classification:** Confidential
- **Retention:** Retained according to member/accounting/legal retention rules; anonymization subject to legal review.
- **Key Relationships:** Member, membership, class/session, trainer, check-in, notifications, reporting facts.

### DATA-006 — Check-In Event

- **Purpose:** Records QR validation outcome, branch, timestamp, operator/device context, membership status, and rejection reason where applicable.
- **System of Record:** PostgreSQL via COMP-009
- **Classification:** Confidential
- **Retention:** Retained according to operational reporting and privacy retention rules; anonymization subject to legal review.
- **Key Relationships:** Member, membership, branch, device/operator, audit records, reporting facts.

### DATA-007 — Trainer and Commission

- **Purpose:** Stores trainer profiles, certifications, branch associations, schedules, commission rules, commission entries, and payout statements.
- **System of Record:** PostgreSQL via COMP-010
- **Classification:** Confidential
- **Retention:** Retained according to operational and financial retention obligations; payout statements follow financial retention where applicable.
- **Key Relationships:** Class/session, attendance, branch, commission rule, payout statement, audit records.

### DATA-008 — Lead and Campaign

- **Purpose:** Stores lead source, owner, status, follow-up dates, branch, and conversion to member.
- **System of Record:** PostgreSQL via COMP-011
- **Classification:** Confidential
- **Retention:** Retention TBD pending legal/privacy decision under ARC-OQ-005.
- **Key Relationships:** Member conversion, branch, owner, notifications, reporting facts.

### DATA-009 — Notification and Consent

- **Purpose:** Stores channel preferences, opt-in/consent status, templates, send attempts, delivery receipts, retries, and failures.
- **System of Record:** PostgreSQL via COMP-012
- **Classification:** Confidential
- **Retention:** Consent and delivery records retained as compliance evidence; exact retention TBD pending legal/privacy decision under ARC-OQ-005.
- **Key Relationships:** Member, lead, notification provider reference, audit records.

### DATA-010 — Audit Log

- **Purpose:** Provides immutable evidence of actor, action, entity, old/new values, timestamp, IP, and relevant context for financial, membership-changing, authorization, consent, export, and admin actions.
- **System of Record:** Append-only PostgreSQL audit table plus immutable object-storage exports via COMP-017
- **Classification:** Restricted
- **Retention:** At least aligned to financial record retention for financial records; exact retention for non-financial audit events TBD under ARC-OQ-005.
- **Key Relationships:** Actor, entity, domain record, branch, export artifact.

### DATA-011 — Reporting Aggregate

- **Purpose:** Stores pre-aggregated dashboard and report facts for revenue, renewals, active members, attendance, bookings, leads, trainer utilization, and branch comparison.
- **System of Record:** PostgreSQL reporting tables/read replica via COMP-013
- **Classification:** Internal or Confidential depending on included dimensions
- **Retention:** Supports 12-month standard reports under PRD-FR-011; longer retention follows source data rules.
- **Key Relationships:** Membership, payment, booking, check-in, lead, trainer, branch.

### DATA-012 — Migration Artifact

- **Purpose:** Stores import files, mapping versions, rejected-row reports, dry-run reconciliation reports, and sign-off artifacts.
- **System of Record:** Encrypted object storage plus PostgreSQL migration metadata via COMP-018
- **Classification:** Restricted
- **Retention:** Retention TBD pending legal/privacy decision under ARC-OQ-005.
- **Key Relationships:** Member, membership, payment balance, migration run, audit records.

### Data Migration

- **Required:** Yes
- **Approach:** Import existing members, active plans, balances, and expiry dates from current spreadsheets and billing tool exports. The migration module validates mobile format, duplicates, and missing mandatory fields; exports rejected rows with failure reasons; runs two dry runs in staging; reconciles counts, active members, and outstanding dues; and requires client sign-off before final cut-over.

## 10. Security Architecture

### ARD-SEC-001 — Identity, RBAC, and Branch Scope

- **Related Requirements:** PRD-NFR-005

The implementation must:

- Authenticate members using OTP.
- Authenticate staff and management using username/password with optional MFA.
- Enforce RBAC and branch-scoped authorization at the API layer for every protected request.
- Apply session timeout, device management, brute-force protection, OTP abuse protection, and rate limits.
- Log authorization-sensitive actions and access denials with correlation IDs and audit context.

The implementation must not:

- Rely on client-side checks as the source of authorization.
- Allow branch-scoped users to read or change records outside permitted roles and branches.
- Log OTP values, passwords, MFA secrets, session tokens, or authorization credentials.

### ARD-SEC-002 — Payment Security and PCI Scope Control

- **Related Requirements:** PRD-NFR-006

The implementation must:

- Use gateway-hosted checkout or tokenization for card and recurring payment data.
- Verify payment webhook signatures before changing payment, invoice, refund, renewal, or settlement state.
- Use idempotency keys for payment, refund, renewal, and webhook processing.
- Keep provider credentials in managed secrets.
- Maintain audit records for financial actions.

The implementation must not:

- Store or log raw card numbers.
- Accept unsigned or invalid payment webhooks.
- Create duplicate charges, bookings, or renewed memberships from retries.

### ARD-SEC-003 — Data Protection, Privacy, and Consent

- **Related Requirements:** PRD-NFR-005, PRD-NFR-007

The implementation must:

- Use TLS 1.2 or higher in transit.
- Use AES-256 encryption at rest for databases, object storage, backups, and local offline eligibility cache.
- Encrypt sensitive KYC and health declaration fields at field level.
- Capture communication consent and health-data consent.
- Support data export and deletion request workflows.
- Show privacy policy and terms in member-facing apps.
- Support DPDP Act and applicable GST compliance subject to legal review.

The implementation must not:

- Include sensitive KYC, health declaration, raw payment, secrets, or authentication values in logs, traces, analytics, or local cache beyond explicitly required encrypted minimum eligibility data.
- Send WhatsApp template notifications without approved templates and eligible opt-in records.
- Retain inactive member data beyond approved retention/anonymization rules once legal review confirms them.

### ARD-SEC-004 — Supply Chain and Release Security

- **Related Requirements:** PRD-NFR-005, PRD-NFR-006, PRD-NFR-009

The implementation must:

- Run SAST, dependency/CVE scanning, container image scanning, secret scanning, and SBOM generation in CI/CD.
- Block releases with critical or high security findings until remediated or formally risk-accepted according to governance.
- Complete third-party penetration testing before go-live and annually.
- Resolve high-rated vulnerabilities before release.

The implementation must not:

- Promote production releases with unresolved critical/high findings or unresolved penetration-test findings covered by PRD exit criteria.
- Deploy container images that have not passed configured scanning gates.
- Commit secrets to source control or store them outside the managed secrets service.

### Security Controls

- **Authentication:** Member OTP; staff/management username/password with optional MFA; session timeout and device management.
- **Authorization:** API-layer RBAC and branch-scoped access with least privilege by default.
- **Secrets Management:** AWS managed secrets; no secrets in code, logs, images, or configuration files committed to source control.
- **Encryption:** TLS 1.2+ in transit; AES-256 at rest; field-level encryption for KYC and health declaration fields; encrypted local offline eligibility cache.
- **Audit Logging:** Append-only PostgreSQL audit table plus periodic immutable object-storage export for financial, membership-changing, authorization, consent, export, and admin actions.
- **Dependency/CVE Scanning:** SAST, dependency/CVE, container image, and secret scanning in CI/CD; critical/high findings block release.
- **SBOM:** Required for production releases and retained as a release artifact.

## 11. Reliability, Performance, and Scalability

### ARD-OPS-001 — Common API Read Latency

- **Target:** Timetable, profile, and membership status APIs return under 500 ms at the 95th percentile at launch capacity.
- **Validation Method:** Staging load test at launch capacity and production CloudWatch/OpenTelemetry latency dashboards.

### ARD-OPS-002 — QR Check-In Latency

- **Target:** QR check-in validation completes under 2 seconds for 95% of scans.
- **Validation Method:** Performance test simulating peak branch check-ins and production check-in latency monitoring.

### ARD-OPS-003 — Booking Concurrency Integrity

- **Target:** Class booking capacity check prevents overbooking and responds under 1 second under concurrent load.
- **Validation Method:** Concurrent booking load test with transactional locking validation and zero-overbooking assertion.

### ARD-OPS-004 — Launch Capacity

- **Target:** Support 9,000 active members, 1,500 concurrent app users, and 60 check-ins per minute per branch at peak.
- **Validation Method:** Staging performance test simulating launch capacity and peak check-in burst before go-live.

### ARD-OPS-005 — Reporting Performance

- **Target:** Standard reports for 12 months of data load under 5 seconds.
- **Validation Method:** Performance test using representative reporting data, read replica, and pre-aggregated reporting tables.

### ARD-OPS-006 — Availability

- **Target:** 99.5% monthly platform availability at launch, excluding approved maintenance windows.
- **Validation Method:** Production uptime monitoring and monthly availability report.

### ARD-OPS-007 — Recovery

- **Target:** RPO 15 minutes or less and RTO 4 hours or less.
- **Validation Method:** Disaster recovery test and restore evidence using automated backups and continuous log backups.

### ARD-OPS-008 — Backup and Restore

- **Target:** Automated daily full backups plus continuous log backups with 30-day retention and monthly restore test.
- **Validation Method:** Scheduled restore test report and backup monitoring alerts.

### ARD-OPS-009 — Offline Check-In Tolerance

- **Target:** Front desk can validate check-ins from encrypted minimum active-member eligibility data for up to 30 minutes and sync audited check-in events afterward.
- **Validation Method:** Offline/online transition test in staging and sync reconciliation report.

### ARD-OPS-010 — Rollback

- **Target:** Rollback procedure completed within 30 minutes.
- **Validation Method:** Release rehearsal using feature flags and container rollback in staging.

## 12. Observability

- **Logging:** Structured JSON logs with correlation IDs, actor context where safe, branch context where relevant, operation name, outcome, latency, and sanitized error details.
- **Metrics:** Dashboards for API latency, error rate, queue depth, payment success rate, payment webhook failures, renewal job failures, check-in failures, database health, report aggregation lag, notification delivery failures, and backup/restore health.
- **Tracing:** OpenTelemetry tracing across API gateway, backend modules, workers, database calls, queues, and external provider adapters; exported to a managed tracing backend.
- **Alerting:** Alerts for elevated error rates, latency breaches, queue/dead-letter growth, payment webhook failures, renewal job failures, database health, backup failures, check-in failure spikes, and report aggregation lag.
- **Sensitive Data Restrictions:** Logs, metrics, traces, audit summaries, and analytics must exclude raw card data, passwords, OTP values, tokens, secrets, KYC field values, health declaration values, and unnecessary personal data.

## 13. Deployment Architecture

- **Environments:** Development, staging, production. Staging must be production-like and use masked data where production-derived data is needed.
- **Deployment Model:** Containerized modular monolith backend, separate worker processes, React web apps/PWA hosted behind CDN, Flutter apps distributed through app stores with phased rollout.
- **CI/CD:** Git-based pipelines with build, lint, type checks, automated tests, security scans, SBOM generation, image build, environment promotion, and deployment approvals as required.
- **Configuration Management:** Environment-specific configuration through managed parameter/secrets services; provider adapter configuration externalized from code.
- **Rollback:** Feature flags for staged rollout and fast disablement; container rollback and previous web asset rollback; rollback procedure must complete within 30 minutes.
- **Infrastructure as Code:** Terraform for AWS infrastructure, networking, IAM, managed databases, queues, object storage, WAF/API gateway, observability, and environment configuration.

## 14. Testing Architecture

Required test levels:

- Unit tests
- Integration tests
- Contract tests
- End-to-end tests
- Security tests
- Performance tests, where applicable

Minimum quality expectations:

- **Coverage Threshold:** Minimum 70% coverage on billing, booking, and membership rules.
- **Blocking Security Severity:** Critical and high findings from SAST, dependency/CVE scanning, container scanning, secret scanning, and penetration testing block release until remediated or formally risk-accepted according to governance.
- **Required Build/Lint Checks:** Backend build, frontend build, Flutter build, TypeScript type checks, lint checks, unit tests, integration tests, API contract tests, E2E tests, migration dry-run validation, performance tests for NFR targets, accessibility tests for member-facing critical flows, dependency/CVE scanning, container scanning, secret scanning, SAST, and SBOM generation.

## 15. Architecture Constraints

- ARC-CON-001 — The client is a mid-market company in the Other industry category.
- ARC-CON-002 — The MVP must cover Member Mobile App, Front-Desk/Trainer App, and Management Portal.
- ARC-CON-003 — Member Mobile App must support iOS and Android cross-platform delivery, with Android 9+ and iOS 15+ support.
- ARC-CON-004 — Front-Desk/Trainer App must be tablet-friendly, web/PWA-based, and offline-tolerant for check-in.
- ARC-CON-005 — Management Portal must be a responsive web application.
- ARC-CON-006 — The backend must be a NestJS modular monolith at launch, with clear domain boundaries and asynchronous workers.
- ARC-CON-007 — Hosting must use AWS in an India region with managed containers, database, queue, object storage, secrets, WAF/API gateway, and observability services.
- ARC-CON-008 — PostgreSQL 15+ must be the transactional system of record.
- ARC-CON-009 — Common read APIs must meet PRD-NFR-001 performance targets.
- ARC-CON-010 — Booking capacity must be enforced transactionally with no overbooking.
- ARC-CON-011 — Payments must use hosted checkout or tokenization; PulseFit must not store or log raw card numbers.
- ARC-CON-012 — Payment webhooks must use signature verification and idempotent state transitions.
- ARC-CON-013 — Financial records must be retained for 8 years.
- ARC-CON-014 — Inactive member data anonymization after 3 years is subject to legal review.
- ARC-CON-015 — The platform must support DPDP Act and applicable GST compliance subject to legal review.
- ARC-CON-016 — TLS 1.2+ is required in transit; AES-256 encryption is required at rest.
- ARC-CON-017 — KYC and health declaration fields require field-level encryption.
- ARC-CON-018 — Communication and health-data consent must be captured and audited.
- ARC-CON-019 — Planned maintenance windows must occur outside branch hours, 11 pm to 5 am, with 48 hours’ notice.
- ARC-CON-020 — UAT must pass all Must-have items before launch.
- ARC-CON-021 — Exit criteria require no open critical or high defects, NFR targets met in staging, penetration test findings resolved, and data migration reconciled.
- ARC-CON-022 — Turnstile or biometric device integration is deferred to Phase 2.
- ARC-CON-023 — UI must be localization-ready for Tamil and Hindi, while non-English launch UI delivery is out of scope.
- ARC-CON-024 — Accounting export must initially be implemented as configurable scheduled CSV/XLSX file export until accounting software is confirmed.
- ARC-CON-025 — Local offline check-in cache must store only minimum eligibility data, be encrypted, and expire within 30 minutes.

## 16. Risks and Trade-offs

| ID | Risk/Trade-off | Impact | Mitigation |
|---|---|---|---|
| ARC-RISK-001 | Modular monolith accelerates launch but can accumulate coupling across domains. | Medium | Enforce module boundaries, contract tests, domain ownership, and extraction-ready interfaces. |
| ARC-RISK-002 | Recurring-payment mandate approval and bank success rates vary. | High | Begin gateway onboarding early, test real mandates, and support assisted renewal fallback. |
| ARC-RISK-003 | WhatsApp template approval delays may block reminders and confirmations. | Medium | Submit templates during discovery and maintain SMS/email fallback. |
| ARC-RISK-004 | Poor branch connectivity can affect real-time check-in. | Medium | Use encrypted minimum eligibility cache for up to 30 minutes and sync audited events after recovery. |
| ARC-RISK-005 | Legacy data quality can delay migration or corrupt launch records. | High | Run validation, rejected-row reporting, two staging dry runs, reconciliation, and client sign-off. |
| ARC-RISK-006 | Accounting destination remains TBD. | Medium | Use configurable CSV/XLSX export adapter first and defer destination-specific API connector. |
| ARC-RISK-007 | Scope breadth across three applications increases delivery and regression risk. | High | Use feature flags, staged rollout, automated test gates, and UAT mapped to PRD requirements. |
| ARC-RISK-008 | Security/privacy gaps can delay go-live. | High | Enforce CI/CD security gates, penetration testing, audit logging, encryption, and high/critical blocking policy. |
| ARC-RISK-009 | Reporting aggregates may become stale or inconsistent. | Medium | Monitor aggregation lag, reconcile reports to transactional records, and alert on worker failures. |
| ARC-RISK-010 | AWS managed-service dependency creates cloud lock-in. | Medium | Keep application-level adapters for integrations and use Terraform to document infrastructure; accept managed-service trade-off for launch reliability. |

## 17. Open Architecture Questions

| ID | Question | Owner | Status | Decision/Due Date |
|---|---|---|---|---|
| ARC-OQ-001 | Which concrete payment gateway, SMS provider, WhatsApp provider, email provider, and push configuration will be selected? | Engineering/Operations/Finance | Open | TBD |
| ARC-OQ-002 | What accounting software and final export format/API connector will be used after the initial configurable CSV/XLSX export? | Finance Owner | Open | TBD |
| ARC-OQ-003 | What is the current billing tool export format and final migration mapping? | Client Operations | Open | TBD |
| ARC-OQ-004 | What post-launch support model and SLA will be contractually agreed beyond build and hypercare? | Client Sponsor | Open | TBD |
| ARC-OQ-005 | What legal decisions apply to DPDP, GST, financial record retention detail, health-data consent, lead retention, audit retention, migration artifact retention, and inactive member anonymization? | Legal/Compliance | Open | TBD |
| ARC-OQ-006 | What target release date applies for pilot and full rollout? | Client Sponsor | Open | TBD |
| ARC-OQ-007 | What exact Node.js, NestJS, Flutter, React, and infrastructure tool versions will be pinned for implementation? | Engineering | Open | TBD |
| ARC-OQ-008 | What final repository structure and repository paths will be used for apps, services, infrastructure, and shared packages? | Engineering | Open | TBD |
| ARC-OQ-009 | What specific governance process applies to formal risk acceptance for critical/high security findings if remediation cannot occur before a planned release? | Security Reviewer | Open | TBD |

## 18. Feature Mapping

| Feature | Relevant Components | Decision IDs | Interface IDs | Security IDs |
|---|---|---|---|---|
| FEAT-001 | COMP-005, COMP-006, COMP-014, COMP-017 | ARD-DEC-001, ARD-DEC-004, ARD-DEC-008, ARD-DEC-010 | ARD-API-001 | ARD-SEC-001, ARD-SEC-003 |
| FEAT-002 | COMP-006, COMP-007, COMP-012, COMP-015, COMP-017 | ARD-DEC-001, ARD-DEC-006, ARD-DEC-007 | ARD-API-001, ARD-API-002, ARD-API-003, ARD-API-006 | ARD-SEC-001, ARD-SEC-002, ARD-SEC-003 |
| FEAT-003 | COMP-007, COMP-014, COMP-016, COMP-017 | ARD-DEC-004, ARD-DEC-006, ARD-DEC-007, ARD-DEC-010 | ARD-API-001, ARD-API-002, ARD-API-004, ARD-API-006 | ARD-SEC-002, ARD-SEC-004 |
| FEAT-004 | COMP-006, COMP-008, COMP-012, COMP-014, COMP-015 | ARD-DEC-001, ARD-DEC-004, ARD-DEC-005, ARD-DEC-007 | ARD-API-001, ARD-API-003, ARD-API-006 | ARD-SEC-001, ARD-SEC-003 |
| FEAT-005 | COMP-002, COMP-006, COMP-009, COMP-014, COMP-017 | ARD-DEC-003, ARD-DEC-008, ARD-DEC-009, ARD-DEC-010 | ARD-API-001 | ARD-SEC-001, ARD-SEC-003 |
| FEAT-006 | COMP-008, COMP-010, COMP-014, COMP-017 | ARD-DEC-001, ARD-DEC-004, ARD-DEC-007 | ARD-API-001, ARD-API-006 | ARD-SEC-001, ARD-SEC-003 |
| FEAT-007 | COMP-006, COMP-011, COMP-012, COMP-013, COMP-014 | ARD-DEC-001, ARD-DEC-004, ARD-DEC-006 | ARD-API-001, ARD-API-003 | ARD-SEC-001, ARD-SEC-003 |
| FEAT-008 | COMP-012, COMP-014, COMP-015, COMP-017 | ARD-DEC-006, ARD-DEC-007, ARD-DEC-010 | ARD-API-003, ARD-API-006 | ARD-SEC-003, ARD-SEC-004 |
| FEAT-009 | COMP-003, COMP-005, COMP-006, COMP-014, COMP-017 | ARD-DEC-001, ARD-DEC-005, ARD-DEC-008, ARD-DEC-010 | ARD-API-001 | ARD-SEC-001, ARD-SEC-003 |
| FEAT-010 | COMP-003, COMP-013, COMP-014, COMP-015 | ARD-DEC-004, ARD-DEC-005, ARD-DEC-007 | ARD-API-001, ARD-API-006 | ARD-SEC-001, ARD-SEC-003 |
| FEAT-011 | COMP-018, COMP-006, COMP-007, COMP-014, COMP-016, COMP-017 | ARD-DEC-004, ARD-DEC-007, ARD-DEC-010 | ARD-API-005, ARD-API-006 | ARD-SEC-001, ARD-SEC-003 |

## 19. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Solution Architect | TBD | Pending | TBD |
| Security Reviewer | TBD | Pending | TBD |
| Engineering Lead | TBD | Pending | TBD |