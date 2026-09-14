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
| DEC-010 | Arabic is the interface language; users may read books/PDFs in any language, and the product is content-language neutral. | Accepted |
| DEC-011 | Defer user interviews and usability studies; continue building under explicitly unvalidated assumptions. | Accepted |
| DEC-012 | Open the Side Panel from `chrome.action.onClicked` so the explicit toolbar gesture grants transient `activeTab` metadata. | Accepted |
| DEC-013 | Freeze the SPEC-014 core contracts: primary goal selects the protocol; secondary goals are preserved as rationale-only customization; reverse planning uses UTC calendar dates with inclusive days and ceiling daily targets; protocol step templates use the versioned catalog defaults; book fingerprints use normalized title, normalized author, total pages, and fingerprint version with warning-only collision handling. | Accepted |

## Open decisions

- Open-source license selection.
- Browser-level end-to-end runner choice after the extension prototype is exercised in both Chrome and Edge.

## DEC-013 context and consequences

On 2026-09-14, the implementation slice required explicit contracts before the coordinated core tasks could leave Inbox. The selected policy keeps the primary goal deterministic and prevents secondary goals from silently changing the protocol; secondary goals remain in the immutable snapshot and rationale. Reverse planning uses `YYYY-MM-DD` calendar values in UTC, counts both today and the deadline, computes pages-per-minute from remaining pages and available minutes, and rounds daily targets up. Protocol step labels and default durations are the versioned `PROTOCOL_STEP_CATALOG` values. Book fingerprints use version 1 canonical metadata (`title`, `author`, `totalPages`) after normalization; a hash match warns and requires exact-metadata confirmation rather than rejecting the book. These choices match the existing pure modules, preserve deterministic snapshots, and remain revisable only through a new versioned decision.

## DEC-009 context and consequences

Preact keeps component and state ergonomics for the ten-screen workflow while remaining materially smaller than a full React runtime. TypeScript protects state-machine and persistence contracts. Vite provides a direct production build and copies the static Manifest V3 files without a framework-specific extension abstraction. Vitest shares the transform pipeline. Domain logic must remain framework-independent, browser APIs stay behind adapters, and all runtime code is bundled locally to satisfy Manifest V3 CSP and offline requirements.

## DEC-010 context and consequences

The target is an Arabic-interface user who reads, studies, or learns from a book in any language. Arabic is structural in the UI and product copy; it is not a restriction on the book or PDF. The extension remains content-language neutral because it does not read or analyze document content. Research recruitment must include language variety when practical and must never require Arabic-language books.

## DEC-011 context and consequences

The owner chose to defer `WORK-014`, `WORK-015`, and `WORK-016` and continue implementation without recruiting users. These items remain incomplete, their research evidence remains `None`, and no product assumption may be described as user-validated. The build sequence resumes at `WORK-018`; the deferred research can be reopened when an MVP is available or when a decision cannot be resolved without external evidence.

## DEC-012 context and consequences

On 2026-09-14, packaged Chrome and Edge checks showed that automatic `openPanelOnActionClick` opened the Side Panel without making the active tab's sensitive `title` and `url` available. The accepted implementation disables that automatic behavior, handles the explicit `chrome.action.onClicked` event, and calls `chrome.sidePanel.open({ tabId })`. This preserves the single user gesture, grants only the invoked tab's temporary `activeTab` access, and adds no broad host permissions or tab-monitoring listeners. Chromium's guarded CDP action command verified the real invocation path in isolated test profiles. See `SPEC-012` and `docs/delivery/WORK-020-ACTIVE-PDF-CONTEXT-PERMISSIONS-PLAN.md`.

Add a dated entry with context, options, decision, consequences, and links whenever an open decision is resolved.
