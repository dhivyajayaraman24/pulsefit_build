# Core Domain Modules

This directory holds modular-monolith domain boundaries that map to the ARD components.

Dependency direction guidelines:

- `src/common` may be used by every domain module for transport-neutral primitives such as correlation IDs and error envelopes.
- Domain modules should not import controllers, services, or persistence internals from sibling domains.
- Cross-domain behavior should be exposed through narrow application services or events defined by the owning domain.
- Infrastructure adapters, workers, database access, and external API clients should depend inward on domain contracts.
- Financial, membership-changing, authorization, consent, export, and admin flows must emit append-only audit events from the owning domain when those flows are implemented.

Current placeholders:

- `identity`
- `membership`
- `billing`
- `booking`
- `check-in`
- `trainer-commission`
- `crm`
- `notifications`
- `reporting`
- `migration`
- `files-exports`
- `audit-compliance`
