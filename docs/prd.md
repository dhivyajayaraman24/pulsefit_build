# Product Requirements Document (PRD)

> Requirement IDs should remain stable after approval so downstream ARD and feature specifications retain traceability.

## Document Metadata

- **Product/Application:** PulseFit Gym Management Platform
- **Document ID:** PRD-PULSEFIT
- **Version:** Draft v0.1
- **Status:** Draft
- **Owner:** PulseFit Product Owner
- **Contributors:** Client, Engineering, QA, Operations
- **Last Updated:** 2026-11-13

---

## 1. Executive Summary

PulseFit is a complete multi-branch gym and fitness studio management platform for a mid-market client. It includes a Member Mobile App, Front-Desk/Trainer App, Management Portal, and cloud-hosted core platform for memberships, renewals, online payments, class bookings, QR check-ins, trainer schedules, commissions, customer notifications, lead management, and real-time reporting.

The primary business value is revenue protection and growth through fewer missed renewals, better lead conversion, and easier payments. The launch strategy is a full MVP across all three applications with Must-have workflows, prioritized around the gym owner and management team’s need for centralized multi-branch control, revenue visibility, and operational automation.

The platform will launch with centralized owner/admin controls, branch-level operations, secure online payments, QR-based access validation, offline-tolerant front-desk check-in, and reporting for revenue, renewals, active members, attendance, bookings, leads, trainer utilization, and branch comparison.

## 2. Problem Statement

The client needs to replace fragmented gym operations across current spreadsheets, a billing tool, and manual workflows with a centralized platform. Today, missed renewals, manual follow-ups, non-centralized lead handling, disconnected branch operations, and slow reporting create revenue leakage and operational overhead for owners, branch staff, trainers, finance users, and members.

The problem is urgent because the business needs a scalable platform that supports multi-branch growth, online payments, automated renewals, real-time reporting, and member self-service while maintaining secure financial, membership, and operational records.

## 3. Product Vision

PulseFit will become the operating system for multi-branch gyms and fitness studios: a single source of truth for members, plans, payments, schedules, attendance, trainer operations, leads, notifications, commissions, and management reporting. Members will be able to book, pay, renew, receive updates, and check in from mobile. Staff and trainers will operate branch workflows from a tablet-friendly app. Owners and managers will centrally configure plans, monitor performance, control permissions, and automate business operations across branches.

## 4. Goals and Success Measures

### 4.1 Goals

- Protect and grow revenue by reducing missed or late renewals and improving renewal follow-up.
- Improve lead conversion through structured lead capture, owner assignment, pipeline status, reminders, and conversion to member.
- Increase payment efficiency by enabling online payments, payment links, invoices, refunds, settlement reconciliation, and GST tax handling.
- Centralize multi-branch management for plans, users, permissions, reporting, and configurable branch-level overrides.
- Improve member experience with mobile booking, renewal, payment, notifications, and QR check-in.
- Improve operational visibility through real-time dashboards for revenue, renewals, members, attendance, bookings, leads, trainer utilization, and branch comparison.

### 4.2 Success Measures

| ID | Measure | Baseline | Target | Measurement Method |
|---|---|---:|---:|---|
| KPI-001 | Missed or late renewals | TBD | TBD | Compare renewal outcomes before and after launch using membership expiry, payment, reminder, and staff follow-up records. |
| KPI-002 | Lead-to-member conversion rate | TBD | TBD | Track leads captured, assigned, followed up, and converted to active paid members. |
| KPI-003 | Online payment adoption rate | TBD | TBD | Measure share of membership, renewal, and booking payments completed through gateway flows. |
| KPI-004 | Time to produce owner-level multi-branch performance reports | TBD | TBD | Compare manual reporting effort against Management Portal dashboard/report generation time. |
| KPI-005 | QR check-in validation performance | Under 2 seconds for 95% of scans target from technical specification | Under 2 seconds for 95% of scans | Performance test and production monitoring of check-in validation latency. |

## 5. Scope

### 5.1 In Scope

- Member Mobile App for profile, membership status, renewals, online payments, class timetable, bookings, cancellations, notifications, and QR check-in.
- Front-Desk/Trainer App as a tablet-friendly PWA for check-ins, member lookup, assisted renewals, class/session operations, trainer schedules, attendance, and exception handling.
- Management Portal for owners, finance, marketing, admins, and branch managers.
- Membership plans, active memberships, freeze/grace/expired/cancelled states, renewals, retries, reminders, and staff exception queues.
- Online payments, payment links, invoices/receipts, refunds, GST tax split, settlement import, and accounting export.
- Class timetable, capacity enforcement, cancellations, attendance, no-show tracking, and waitlist promotion.
- QR check-in with active membership validation and offline-tolerant front-desk cache for up to 30 minutes.
- Trainer schedules, session assignment, attendance-based commission rules, and monthly payout statements.
- Basic CRM for lead source, owner assignment, status pipeline, follow-up reminders, and conversion to member.
- Customer notifications via SMS, WhatsApp templates, email, and push notifications with opt-in/consent tracking.
- Centralized multi-branch configuration, global plans, reporting, users, permissions, and configurable branch-level overrides.
- Real-time reports and dashboards for revenue, renewals, active members, attendance, bookings, leads, trainer utilization, and branch comparison.
- Data migration for existing members, active plans, balances, and expiry dates from current spreadsheets and billing tool.

### 5.2 Out of Scope

- External partners such as corporate wellness clients, third-party studios, and marketplace users.
- Turnstile or biometric device integration for launch; optional access device APIs are deferred to Phase 2.
- Full payroll including salaries, taxes, deductions, statutory filings, and approval workflows.
- Advanced campaign CRM features such as segmentation, bulk nurture journeys, lead scoring, SLA forecasting, and campaign ROI.
- Franchise-style hierarchy with region managers, franchise owners, and external accountants.
- Non-English launch UI delivery; the UI should be localization-ready for Tamil and Hindi.

## 6. Personas and Users

### PERSONA-001 — Owner and Management Team

- **Description:** Owners, senior managers, admins, and decision-makers overseeing one or more gym branches.
- **Primary Need:** Centralized control over revenue, plans, reports, users, permissions, branch performance, and operational automation.
- **Key Pain Point:** Revenue leakage and slow decisions caused by missed renewals, fragmented tools, manual reporting, and inconsistent branch processes.

### PERSONA-002 — Front-Desk and Branch Staff

- **Description:** Staff handling walk-ins, member lookup, renewals, payments, check-ins, class attendance, and member support at branches.
- **Primary Need:** Fast operational workflows on tablet and desktop for member service, check-in validation, payments, and exception queues.
- **Key Pain Point:** Manual admin work and unclear membership/payment status at the point of service.

### PERSONA-003 — Trainers

- **Description:** Trainers assigned to classes, sessions, member attendance, and commission-linked activities.
- **Primary Need:** Visibility into schedules, session assignments, attendance, and commission/payout statements.
- **Key Pain Point:** Lack of transparent schedule and commission tracking.

### PERSONA-004 — Members

- **Description:** Active, renewing, or prospective gym members using mobile self-service.
- **Primary Need:** Easy booking, payment, renewal, notifications, membership visibility, and QR check-in.
- **Key Pain Point:** Friction in class booking, renewals, payments, and entry validation.

### PERSONA-005 — Finance User

- **Description:** Finance or accounting users responsible for invoices, receipts, refunds, GST tax split, settlements, and exports.
- **Primary Need:** Accurate financial records and exportable payment, invoice, refund, and settlement data.
- **Key Pain Point:** Manual reconciliation and inconsistent payment/invoice records.

## 7. Assumptions and Dependencies

### Assumptions

- ASM-001 — A modular monolith with separated domain modules is acceptable for launch, with billing, booking, and notifications split later only if load requires it.
- ASM-002 — The platform will support a full MVP across Member App, Front-Desk/Trainer App, and Management Portal.
- ASM-003 — Assisted renewals and opt-in auto-renewal are both required for launch.
- ASM-004 — Exact baseline and target values for business KPIs are not yet available and will be confirmed before PRD approval.
- ASM-005 — QR check-in is sufficient for launch access control; turnstile and biometric integrations are Phase 2 candidates.
- ASM-006 — Launch rollout follows pilot at 1 branch for 2 weeks, then 5 branches in two waves, with 2 weeks of hypercare support per wave unless changed during planning.

### Dependencies

- DEP-001 — Payment gateway supporting UPI, cards, net banking, UPI AutoPay/e-mandate or tokenized recurring billing, signed webhooks, refunds API, and settlement report import.
- DEP-002 — SMS provider with DLT template registration and delivery receipts.
- DEP-003 — WhatsApp Business API provider with template message approval and opt-in tracking.
- DEP-004 — Email and push infrastructure including SPF/DKIM, FCM, and APNs.
- DEP-005 — Accounting export destination and format, to be confirmed.
- DEP-006 — Current spreadsheets and billing tool exports for member, membership, balance, and expiry-date migration.
- DEP-007 — Cloud hosting in an India region if data residency is confirmed as mandatory.
- DEP-008 — Client approval of UAT scripts, migration reconciliation reports, and launch readiness.

## 8. Functional Requirements

### PRD-FR-001 — Centralized Membership Management

- **Priority:** Must
- **Feature:** FEAT-001
- **Persona:** PERSONA-001

**Requirement**

The system shall centrally manage member profiles, plans, memberships, branch access, start/end dates, freeze periods, auto-renew flags, and membership statuses across branches.

**Business Rationale**

A centralized membership model is required so billing, booking, check-in, renewals, and reporting use the same member and status data.

**Acceptance Criteria**

1. An authorized user can create, view, update, and deactivate a member profile with required contact, home branch, and status fields.
2. The system derives membership status consistently as active, grace, frozen, expired, or cancelled for billing, booking, and check-in.
3. Branch-scoped users can only access member records permitted by their role and branch permissions.
4. Membership changes are written to the audit log with actor, action, timestamp, entity, and old/new values.

---

### PRD-FR-002 — Assisted and Auto-Renewals

- **Priority:** Must
- **Feature:** FEAT-002
- **Persona:** PERSONA-002

**Requirement**

The system shall support both assisted renewals and opt-in auto-renewal with retries, reminders, payment links, and staff exception queues.

**Business Rationale**

Renewals are the primary revenue-protection driver for launch and must reduce missed or late renewals.

**Acceptance Criteria**

1. A member or staff user can initiate a renewal for an eligible membership and complete payment through an online gateway flow.
2. An opt-in auto-renewal membership is included in a daily idempotent renewal job.
3. Failed renewal attempts generate retry tracking, member notification, and a staff exception item.
4. Duplicate retry attempts or webhook retries do not create duplicate charges or duplicate renewed memberships.

---

### PRD-FR-003 — Online Payments and Financial Records

- **Priority:** Must
- **Feature:** FEAT-003
- **Persona:** PERSONA-005

**Requirement**

The system shall support online payments, payment links, invoices/receipts, refunds, settlement import, GST tax split, and accounting export.

**Business Rationale**

Integrated payment and finance workflows reduce manual reconciliation and make revenue reporting reliable.

**Acceptance Criteria**

1. A successful payment creates a payment record and invoice or receipt with gateway reference, amount, tax split, mode, and status.
2. A refund can be initiated for an eligible payment and is linked to the original payment and invoice record.
3. Settlement imports reconcile gateway settlement records against platform payments and flag unmatched items.
4. Finance users can export invoices, receipts, refunds, and payment records for the configured accounting system.

---

### PRD-FR-004 — Class Booking and Attendance

- **Priority:** Must
- **Feature:** FEAT-004
- **Persona:** PERSONA-004

**Requirement**

The system shall provide class timetable, booking, cancellation, capacity enforcement, attendance, no-show tracking, and waitlist promotion.

**Business Rationale**

Members need reliable self-service booking while staff and trainers need accurate occupancy and attendance data.

**Acceptance Criteria**

1. A member with an active eligible membership can book an available class from the timetable.
2. Concurrent booking attempts cannot exceed the configured class capacity.
3. A member can cancel a booking subject to configured rules, and the vacancy can promote the next waitlisted member.
4. Staff or trainer users can mark attendance and no-show status for booked members.

---

### PRD-FR-005 — Membership-Based Booking and Check-In Blocking

- **Priority:** Must
- **Feature:** FEAT-001
- **Persona:** PERSONA-004

**Requirement**

The system shall block booking and QR check-in for expired, frozen, unpaid, cancelled, or otherwise ineligible memberships, show the reason, and provide a renewal/payment path or front-desk escalation.

**Business Rationale**

Access and booking controls protect revenue while giving members and staff a clear resolution path.

**Acceptance Criteria**

1. An ineligible member attempting to book sees a specific eligibility reason and cannot complete the booking.
2. An ineligible member attempting QR check-in is denied entry validation with a specific reason displayed to staff.
3. The member or staff user can navigate from the block state to renewal, payment, or escalation actions.
4. Any staff escalation or override capability requires permission and writes an audit record.

---

### PRD-FR-006 — QR Check-In

- **Priority:** Must
- **Feature:** FEAT-005
- **Persona:** PERSONA-002

**Requirement**

The system shall validate member QR check-ins against centrally derived membership status and branch access permissions.

**Business Rationale**

Fast, reliable check-in reduces front-desk friction and enforces access rules consistently.

**Acceptance Criteria**

1. A valid QR scan returns accepted or rejected status with member identity, branch eligibility, and membership status.
2. The end-to-end QR validation response completes under 2 seconds for 95% of scans in performance testing.
3. Check-in events are stored with member, branch, timestamp, validation result, and operator/device context.
4. Front-desk users can validate check-ins from a cached active-member list for up to 30 minutes during connectivity disruption and sync results afterward.

---

### PRD-FR-007 — Trainer Scheduling and Commissions

- **Priority:** Must
- **Feature:** FEAT-006
- **Persona:** PERSONA-003

**Requirement**

The system shall manage trainer schedules, session assignments, attendance-based commission rules, and monthly payout statements.

**Business Rationale**

Trainer operations and compensation need transparent data tied to sessions and attendance.

**Acceptance Criteria**

1. Authorized staff can assign trainers to classes or sessions by branch, room, and time.
2. Trainer users can view their assigned schedule and session attendance records.
3. The system calculates commission entries based on configured rules and accepted attendance records.
4. Management can generate a monthly payout statement per trainer.

---

### PRD-FR-008 — Basic Lead Management

- **Priority:** Must
- **Feature:** FEAT-007
- **Persona:** PERSONA-001

**Requirement**

The system shall provide basic CRM capabilities to capture lead source, assign owner, manage status pipeline, set follow-up reminders, and convert leads to members.

**Business Rationale**

Structured lead management supports revenue growth through better conversion tracking and follow-up discipline.

**Acceptance Criteria**

1. A user can create or import a lead with source, contact details, owner, status, and follow-up date.
2. The system displays assigned leads and overdue follow-ups to the responsible owner.
3. A lead can be converted into a member without re-entering shared contact information.
4. Lead conversion is reflected in reporting by source, owner, and branch.

---

### PRD-FR-009 — Customer Notifications

- **Priority:** Must
- **Feature:** FEAT-008
- **Persona:** PERSONA-004

**Requirement**

The system shall send transactional and operational notifications through SMS, WhatsApp templates, email, and push notifications with opt-in and consent tracking.

**Business Rationale**

Automated communications are required for renewals, payment links, booking confirmations, reminders, and operational alerts.

**Acceptance Criteria**

1. The system records each member’s preferred channel and consent/opt-in status where required.
2. Renewal reminders, payment links, booking confirmations, and cancellation updates can be sent through configured channels.
3. Failed notification delivery is recorded with channel, provider response, and retry/error status.
4. WhatsApp template notifications are sent only through approved templates and eligible opt-in records.

---

### PRD-FR-010 — Multi-Branch Management

- **Priority:** Must
- **Feature:** FEAT-009
- **Persona:** PERSONA-001

**Requirement**

The system shall allow central owner/admin users to control global plans, reports, users, permissions, and configurable branch-level overrides.

**Business Rationale**

The platform must support centralized business control while allowing operational flexibility at the branch level.

**Acceptance Criteria**

1. Central admins can configure global plans and identify whether branch-level overrides are allowed.
2. Users can be assigned roles and branch scopes that control access in the Member App, Front-Desk/Trainer App, and Management Portal.
3. Management users can view cross-branch data according to their permissions.
4. Branch-level overrides are visible in admin configuration and reporting contexts.

---

### PRD-FR-011 — Real-Time Dashboards and Reports

- **Priority:** Must
- **Feature:** FEAT-010
- **Persona:** PERSONA-001

**Requirement**

The system shall provide real-time dashboards and reports for revenue, renewals, active members, attendance, bookings, leads, trainer utilization, and branch comparison.

**Business Rationale**

Management needs reliable operational and revenue visibility to make decisions without manual report assembly.

**Acceptance Criteria**

1. Authorized management users can view dashboard metrics filtered by branch and date range.
2. Standard reports for 12 months of data load in under 5 seconds in performance testing.
3. Reports reconcile to underlying payment, membership, booking, attendance, lead, and trainer records.
4. Users can export standard report data in a common file format.

---

### PRD-FR-012 — Data Migration

- **Priority:** Must
- **Feature:** FEAT-011
- **Persona:** PERSONA-001

**Requirement**

The system shall import existing members, active plans, balances, and expiry dates from current spreadsheets and billing tool exports with validation, rejected-row reporting, and reconciliation.

**Business Rationale**

Accurate migration is required to launch without disrupting member access, billing, renewals, or reporting.

**Acceptance Criteria**

1. The migration process validates mobile format, duplicates, and missing mandatory fields.
2. Rejected rows are exported in an error report with failure reason.
3. Two dry runs are completed in staging with reconciliation of counts, active members, and outstanding dues.
4. Final cut-over proceeds only after the client signs off the migration reconciliation report.

## 9. Non-Functional Requirements

### PRD-NFR-001 — Common API Performance

- **Category:** Performance
- **Priority:** Must

**Requirement**

The system shall return common read operations, including timetable, profile, and membership status, within 500 ms at the 95th percentile.

**Acceptance Criteria**

1. A performance test at launch capacity shows 95th percentile latency under 500 ms for common read APIs.

### PRD-NFR-002 — Booking Concurrency Integrity

- **Category:** Performance
- **Priority:** Must

**Requirement**

The system shall enforce class capacity under concurrent booking load with no overbooking and response time under 1 second.

**Acceptance Criteria**

1. A concurrent booking performance test produces zero overbooked sessions and booking responses under 1 second for tested capacity scenarios.

### PRD-NFR-003 — Launch Capacity

- **Category:** Scalability
- **Priority:** Must

**Requirement**

The system shall support 9,000 active members, 1,500 concurrent app users, and 60 check-ins per minute per branch at peak at launch.

**Acceptance Criteria**

1. Load testing in staging demonstrates support for 9,000 active members, 1,500 concurrent users, and 60 check-ins per minute per branch without breaching Must-have performance thresholds.

### PRD-NFR-004 — Availability and Recovery

- **Category:** Availability
- **Priority:** Must

**Requirement**

The platform shall provide 99.5% monthly availability at launch, RPO of 15 minutes or less, and RTO of 4 hours or less.

**Acceptance Criteria**

1. Production monitoring reports monthly availability at or above 99.5% excluding approved maintenance windows.
2. Disaster recovery testing demonstrates data recovery within 15-minute RPO and service recovery within 4-hour RTO.

### PRD-NFR-005 — Security and Access Control

- **Category:** Security
- **Priority:** Must

**Requirement**

The system shall enforce OTP authentication for members, username/password with optional MFA for staff and management, role-based branch-scoped authorization, TLS 1.2 or higher in transit, AES-256 encryption at rest, and field-level encryption for sensitive KYC and health declaration fields.

**Acceptance Criteria**

1. Security testing verifies that users cannot access records outside their assigned role and branch scope.
2. Infrastructure and application configuration evidence shows TLS 1.2 or higher in transit and AES-256 encryption at rest.
3. Sensitive KYC and health declaration fields are encrypted at field level and not visible in logs.

### PRD-NFR-006 — Payment Security

- **Category:** Compliance
- **Priority:** Must

**Requirement**

The system shall process card and recurring payment data through gateway-hosted checkout or tokenization and shall not store or log raw card numbers.

**Acceptance Criteria**

1. Code, log, and database review confirms no raw card numbers are stored or logged by PulseFit.
2. Payment webhooks are verified using gateway signatures before payment state changes are accepted.

### PRD-NFR-007 — Privacy and Consent

- **Category:** Privacy
- **Priority:** Must

**Requirement**

The system shall capture consent for communications and health data, support data export and deletion requests, show privacy policy and terms in apps, and support compliance with India’s DPDP Act and applicable GST rules subject to legal review.

**Acceptance Criteria**

1. A user’s communication consent and health-data consent status can be recorded and audited.
2. A data export and deletion request can be logged, processed, and evidenced by an authorized admin.
3. Privacy policy and terms are accessible from member-facing app screens.

### PRD-NFR-008 — Accessibility and Compatibility

- **Category:** Accessibility
- **Priority:** Should

**Requirement**

The system shall target WCAG 2.1 AA for member-facing screens and support Android 9+, iOS 15+, and the latest two versions of Chrome, Safari, Edge, and Firefox.

**Acceptance Criteria**

1. Accessibility testing of member-facing critical flows reports WCAG 2.1 AA conformance or documented exceptions.
2. Compatibility testing passes on Android 9+, iOS 15+, and the latest two versions of Chrome, Safari, Edge, and Firefox.

### PRD-NFR-009 — Observability and Auditability

- **Category:** Observability
- **Priority:** Must

**Requirement**

The system shall provide structured logs with correlation IDs, dashboards for API latency, error rate, queue depth, payment success rate, and check-in failures, and immutable audit logs for financial and membership-changing actions.

**Acceptance Criteria**

1. Production monitoring displays API latency, error rate, queue depth, payment success rate, and check-in failure dashboards.
2. Financial and membership-changing actions produce immutable audit records with actor, action, entity, old/new values, timestamp, and IP where available.

## 10. User Journeys

### JOURNEY-001 — Member Renews Membership

1. Member opens the Member App and views membership status and expiry.
2. Member selects renewal plan and payment method.
3. System processes payment through the gateway and receives a signed webhook.
4. System updates membership status, creates invoice/receipt, and sends confirmation notification.
5. Member sees active renewed membership.

**Related Requirements:** PRD-FR-001, PRD-FR-002, PRD-FR-003, PRD-FR-009, PRD-NFR-006

### JOURNEY-002 — Member Books and Attends a Class

1. Member opens timetable and selects an eligible class.
2. System validates active membership and capacity.
3. Member completes booking and receives confirmation.
4. Member checks in using QR code at the branch.
5. Trainer or staff marks attendance and the booking is reflected in reports.

**Related Requirements:** PRD-FR-004, PRD-FR-005, PRD-FR-006, PRD-FR-011, PRD-NFR-002

### JOURNEY-003 — Front Desk Handles Blocked Check-In

1. Staff scans member QR code at front desk.
2. System rejects check-in because membership is expired, frozen, unpaid, cancelled, or branch-ineligible.
3. Staff sees the rejection reason and opens renewal, payment, or escalation path.
4. Staff completes allowed resolution or records an audited escalation.
5. System updates check-in, payment, membership, or audit records as applicable.

**Related Requirements:** PRD-FR-002, PRD-FR-005, PRD-FR-006, PRD-NFR-009

### JOURNEY-004 — Owner Reviews Branch Performance

1. Owner opens the Management Portal.
2. Owner filters dashboard by branch and date range.
3. System displays revenue, renewals, active members, attendance, bookings, leads, trainer utilization, and branch comparison.
4. Owner exports required report data.
5. Owner uses report insights to direct follow-up or operational changes.

**Related Requirements:** PRD-FR-010, PRD-FR-011, PRD-NFR-001

### JOURNEY-005 — Staff Converts a Lead to Member

1. Staff captures a lead with source, contact details, owner, status, and follow-up date.
2. System reminds the owner about the follow-up.
3. Staff updates lead status after engagement.
4. Staff converts the lead into a member profile and initiates membership purchase.
5. System reflects conversion in CRM and reporting metrics.

**Related Requirements:** PRD-FR-008, PRD-FR-003, PRD-FR-011

## 11. Feature Breakdown

### FEAT-001 — Membership Management

- **Summary:** Central member, plan, membership, eligibility, and status management across branches.
- **Priority:** Must
- **Related Requirements:** PRD-FR-001, PRD-FR-005, PRD-NFR-005, PRD-NFR-009
- **Expected Spec File:** `specs/FEAT-001-membership-management.spec.md`

### FEAT-002 — Renewals and Auto-Renewal

- **Summary:** Assisted renewals, opt-in auto-renewal, retries, reminders, and staff exception queues.
- **Priority:** Must
- **Related Requirements:** PRD-FR-002, PRD-FR-009, PRD-NFR-006
- **Expected Spec File:** `specs/FEAT-002-renewals-and-auto-renewal.spec.md`

### FEAT-003 — Payments and Finance

- **Summary:** Gateway payments, payment links, invoices, refunds, settlements, GST split, and accounting export.
- **Priority:** Must
- **Related Requirements:** PRD-FR-003, PRD-NFR-006, PRD-NFR-009
- **Expected Spec File:** `specs/FEAT-003-payments-and-finance.spec.md`

### FEAT-004 — Booking and Attendance

- **Summary:** Timetable, booking, cancellation, capacity, waitlist, attendance, and no-show workflows.
- **Priority:** Must
- **Related Requirements:** PRD-FR-004, PRD-FR-005, PRD-NFR-002
- **Expected Spec File:** `specs/FEAT-004-booking-and-attendance.spec.md`

### FEAT-005 — QR Check-In

- **Summary:** QR-based member entry validation, branch eligibility checks, check-in records, and offline-tolerant front-desk cache.
- **Priority:** Must
- **Related Requirements:** PRD-FR-006, PRD-NFR-003
- **Expected Spec File:** `specs/FEAT-005-qr-check-in.spec.md`

### FEAT-006 — Trainer Scheduling and Commissions

- **Summary:** Trainer profiles, schedules, session assignment, attendance-based commissions, and payout statements.
- **Priority:** Must
- **Related Requirements:** PRD-FR-007
- **Expected Spec File:** `specs/FEAT-006-trainer-scheduling-and-commissions.spec.md`

### FEAT-007 — Lead Management

- **Summary:** Basic CRM with source capture, owner assignment, pipeline status, reminders, and conversion to member.
- **Priority:** Must
- **Related Requirements:** PRD-FR-008, PRD-FR-011
- **Expected Spec File:** `specs/FEAT-007-lead-management.spec.md`

### FEAT-008 — Notifications

- **Summary:** SMS, WhatsApp, email, and push notifications with templates, delivery tracking, and consent management.
- **Priority:** Must
- **Related Requirements:** PRD-FR-009, PRD-NFR-007
- **Expected Spec File:** `specs/FEAT-008-notifications.spec.md`

### FEAT-009 — Multi-Branch Administration

- **Summary:** Centralized global plans, branch overrides, users, permissions, and cross-branch management controls.
- **Priority:** Must
- **Related Requirements:** PRD-FR-010, PRD-NFR-005
- **Expected Spec File:** `specs/FEAT-009-multi-branch-administration.spec.md`

### FEAT-010 — Reporting and Dashboards

- **Summary:** Real-time operational and financial dashboards with branch comparison and exports.
- **Priority:** Must
- **Related Requirements:** PRD-FR-011, PRD-NFR-001, PRD-NFR-009
- **Expected Spec File:** `specs/FEAT-010-reporting-and-dashboards.spec.md`

### FEAT-011 — Data Migration

- **Summary:** Validated imports, rejected-row reporting, dry runs, reconciliation, and final cut-over.
- **Priority:** Must
- **Related Requirements:** PRD-FR-012
- **Expected Spec File:** `specs/FEAT-011-data-migration.spec.md`

## 12. Constraints

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

## 13. Risks

| ID | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| RISK-001 | Recurring-payment mandate approval and bank success rates vary. | High | Medium | Begin gateway onboarding early, test real mandates, and provide card-on-file or assisted renewal fallback. |
| RISK-002 | WhatsApp template approval delays block notification workflows. | Medium | Medium | Submit templates during discovery and maintain SMS/email fallback. |
| RISK-003 | Poor connectivity at some branches affects check-in. | Medium | Medium | Use offline-tolerant cached active-member list for up to 30 minutes and sync after recovery. |
| RISK-004 | Legacy data quality causes migration errors or launch delays. | High | Medium | Run data audit, validation, two staging dry runs, rejected-row reports, and reconciliation sign-off. |
| RISK-005 | Accounting export cannot be finalized until accounting software and format are confirmed. | Medium | Medium | Confirm accounting software early and define export format before finance UAT. |
| RISK-006 | Scope breadth across three applications increases delivery risk. | High | Medium | Maintain Must/Should/Could prioritization, feature flags, staged rollout, and UAT mapped to requirements. |
| RISK-007 | Security or privacy gaps delay go-live. | High | Low | Complete OWASP controls, dependency scanning, third-party penetration test, and resolve high findings before release. |

## 14. Open Questions

| ID | Question | Owner | Status | Decision/Due Date |
|---|---|---|---|---|
| OQ-001 | What are the confirmed baseline and target values for KPI-001 missed or late renewals, KPI-002 lead-to-member conversion, KPI-003 online payment adoption, and KPI-004 report production time? | PulseFit Product Owner | Open | TBD |
| OQ-002 | What is the target release date for pilot and full rollout? | Client Sponsor | Open | TBD |
| OQ-003 | Which cloud provider, hosting region mandate, and backend stack will be selected? | Engineering | Open | TBD |
| OQ-004 | What accounting software and export format will be used for invoices, receipts, refunds, and settlements? | Finance Owner | Open | TBD |
| OQ-005 | What is the current billing tool export format for migration? | Client Operations | Open | TBD |
| OQ-006 | What post-launch support model and SLA will be contractually agreed? | Client Sponsor | Open | TBD |
| OQ-007 | What legal decisions apply to DPDP, GST, financial record retention, health data consent, and inactive member anonymization? | Legal/Compliance | Open | TBD |
| OQ-008 | What quantified evidence should be attached to the current pain around missed renewals, manual reporting, lead conversion, and payment friction? | PulseFit Product Owner | Open | TBD |

## 15. Release and Rollout Considerations

- **Target Release:** TBD
- **Rollout Approach:** Pilot at 1 branch for 2 weeks, then 5 branches in two waves, with hypercare support for 2 weeks per wave.
- **Migration Considerations:** Import existing members, active plans, balances, and expiry dates from current spreadsheets and billing tool; complete two dry runs in staging; produce rejected-row reports; reconcile counts, active members, and outstanding dues; require client sign-off before final cut-over.
- **Training/Support Considerations:** Provide role-based sessions and quick guides for front desk, trainers, managers, and finance before each rollout wave; post-launch SLA remains open.

## 16. Definition of Product Success

The product is successful when:

- PulseFit reduces missed or late renewals against the confirmed baseline and reaches the approved KPI-001 target.
- Lead conversion, online payment adoption, and multi-branch reporting efficiency meet approved targets.
- Owners and management can centrally control plans, users, permissions, reports, and branch-level overrides.
- Members can renew, pay, book, receive notifications, and complete QR check-in through launch workflows.
- Front-desk staff and trainers can operate check-ins, assisted renewals, schedules, attendance, and commission workflows.
- All Must-priority requirements are accepted.
- Required quality, security, and compliance outcomes are evidenced.

## 17. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Product Owner | TBD | Pending | TBD |
| Business Sponsor | TBD | Pending | TBD |