# Decision Log

| ID | Decision | Status |
|---|---|---|
| DEC-001 | The product is goal-first and guided. | Accepted |
| DEC-002 | Chrome and Edge are the first supported browsers. | Accepted |
| DEC-003 | Use the browser Side Panel; do not build a custom PDF reader. | Accepted |
| DEC-004 | No AI, backend, accounts, or cloud dependency in MVP. | Accepted |
| DEC-005 | Use IndexedDB plus Chrome Storage Local. | Accepted |
| DEC-006 | The goal-to-protocol rules engine is deterministic and versioned. | Accepted |
| DEC-007 | Each reading plan keeps an immutable Protocol Snapshot. | Accepted |
| DEC-008 | Delivery work uses one unified Work Items database. | Accepted |
| DEC-009 | Use Preact + TypeScript + Vite for the Manifest V3 Side Panel, with Vitest and browser-level checks. | Accepted |

## Open decisions

- Open-source license selection.
- Browser-level end-to-end runner choice after the extension prototype is exercised in both Chrome and Edge.

## DEC-009 context and consequences

Preact keeps component and state ergonomics for the ten-screen workflow while remaining materially smaller than a full React runtime. TypeScript protects state-machine and persistence contracts. Vite provides a direct production build and copies the static Manifest V3 files without a framework-specific extension abstraction. Vitest shares the transform pipeline. Domain logic must remain framework-independent, browser APIs stay behind adapters, and all runtime code is bundled locally to satisfy Manifest V3 CSP and offline requirements.

Add a dated entry with context, options, decision, consequences, and links whenever an open decision is resolved.
