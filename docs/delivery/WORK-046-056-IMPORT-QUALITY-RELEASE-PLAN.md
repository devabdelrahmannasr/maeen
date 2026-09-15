# SPEC-016 / WORK-046–056 — Import, Quality, and Release Readiness Implementation Plan

Status: Done, completed 2026-09-15

Notion specification: https://app.notion.com/p/3dc805b7d82b8140b9dac5e0f7542bd3

## Outcome

Deliver validated local import and rollback, complete the Arabic-first accessible UI quality pass, and establish repeatable automated and packaged Chrome/Edge release evidence for the Maeen extension.

This plan covers the eleven existing Work Items:

- `WORK-046 → WORK-047 → WORK-048`: import validation, backup/rollback, and round-trip testing.
- `WORK-049 → WORK-050 → WORK-051 → WORK-052`: Arabic-first copy, responsive RTL/themes, keyboard/focus/contrast, and reduced-motion/system states.
- `WORK-053 → WORK-054 → WORK-055 → WORK-056`: unit, integration, E2E, and packaged browser regression evidence.

No new Work Items are created. The one-item `In Progress` WIP limit remains in force.

## Scope boundaries

In scope:

- JSON export v1 import validation entirely in memory.
- Schema/version validation, migration planning, counts, warnings, and a user-readable preview.
- Backup-before-commit, atomic replacement, rollback, cancellation, and recovery after interrupted import.
- Round-trip fidelity for books, plans, protocol snapshots, sessions, steps, learning artifacts, distractions, and metric source metadata.
- Arabic-first product copy for core screens and failure/recovery states.
- Structural RTL, light/dark themes, zoom and narrow side-panel layouts at 320/420/600 px.
- Keyboard traversal, visible focus, contrast, non-color status cues, reduced motion, and system/empty/interrupted/error states.
- Pure engine unit coverage, real IndexedDB integration coverage, core-journey E2E, and packaged Chrome/Edge regression.

Out of scope:

- PDF bytes, text, headers, MIME inspection, OCR, parsing, URL fetching, or document-content transmission.
- Cloud sync, accounts, analytics, telemetry, remote identifiers, or new extension permissions.
- Import of undocumented formats without an explicit version adapter.
- Silent destructive overwrite, permanent deletion, or automatic import on startup.
- New product features unrelated to import, quality, and release readiness.

## Completed prerequisites

- `WORK-045` JSON/Markdown export v1 and readonly repository boundary.
- `WORK-041` IndexedDB schema/repositories and atomic writes.
- `WORK-042` migration/read-only gate.
- `WORK-043` autosave and data-integrity coordinator.
- `WORK-044` interrupted-session recovery.
- Existing Arabic RTL shell, themes/settings, activeTab-only browser boundary, and privacy contract.

## Dependency graph

~~~text
WORK-045 (Done)
   │
   ▼
WORK-046 ──> WORK-047 ──> WORK-048

WORK-049 ──> WORK-050 ──> WORK-051 ──> WORK-052

WORK-053 ──> WORK-054 ──> WORK-055 ──> WORK-056
~~~

Three roots are dependency-clear at the start: `WORK-046`, `WORK-049`, and `WORK-053`. They are logically parallel, but execution remains sequential because the repository WIP limit is one. Recommended queue: `046 → 047 → 048 → 049 → 050 → 051 → 052 → 053 → 054 → 055 → 056`.

## Shared implementation contract

- Validate imported data before opening any write transaction.
- Preview counts, warnings, migration result, and conflicts before commit.
- Create a recoverable backup from the current readonly state before replacement.
- Commit through one atomic IndexedDB transaction; on failure restore the backup and preserve the last valid state.
- Never acknowledge import success before commit and post-commit re-read succeed.
- Keep migration adapters versioned and explicit; unsupported/future versions remain readonly and are never silently downgraded.
- Use allowlisted domain fields. Reject PDF content, fetched responses, headers, settings secrets, and unknown remote identifiers.
- Keep all reducers, validators, migrations, copy maps, and metric calculations deterministic and testable without a browser.
- UI remains Arabic-first, structural RTL, keyboard accessible, reduced-motion aware, and content-language neutral.
- Capture exact browser and driver versions, fixture names, test counts, console errors, network requests, and automation limitations.

## Phase 1 — Import safety and portability

### WORK-046 — Validate import and show Preview (P0)

Implementation:

- Define an import envelope validator for export v1 and supported legacy versions.
- Validate schema version, record shapes, IDs, references, timestamps, enum values, bounded text, and duplicate keys in memory.
- Produce a deterministic preview with record counts, migration steps, warnings, conflicts, rejected fields, and a commit eligibility flag.
- Reject malformed, future, or privacy-violating payloads without opening a write transaction.
- Add an Arabic preview surface with cancel/continue actions and clear safe failure copy.

Acceptance/tests:

- Valid small and large payloads produce stable counts and warnings.
- Corrupt, unsupported, duplicate, and privacy-invalid payloads are rejected without mutation.
- Preview never reads PDF content or performs network requests.
- Unicode, Arabic/RTL, optional fields, and legacy version fixtures are covered.

### WORK-047 — Backup and rollback import (P0)

Implementation:

- Snapshot the current domain stores through the readonly export boundary before commit.
- Commit validated/migrated records in one transaction with a durable import journal or recovery marker.
- Restore the backup on transaction failure, browser interruption, quota error, or post-commit verification failure.
- Clear the journal only after all stores re-read and match the expected import result.
- Keep migration/read-only mode non-destructive and offer export rather than forced writes.

Acceptance/tests:

- Backup is created before any mutation.
- A failed write leaves the previous state byte-equivalent.
- Partial imports are impossible after simulated store and quota failures.
- Restart during import resumes rollback safely or presents a recoverable state.
- No import path transmits data or creates network requests.

### WORK-048 — Export–Import round trip (P0)

Implementation:

- Build fixtures from every exportable store and all optional fields.
- Compare imported records, relations, ordering, schema versions, and user-authored Unicode text against the source.
- Exercise small, large, empty, legacy, migrated, and intentionally corrupted datasets.
- Record deterministic checksums/counts and migration results in test evidence.

Acceptance/tests:

- Export then import preserves all allowlisted fields and relationships.
- Large artifacts do not truncate or alter Arabic/non-Arabic text.
- Legacy fixtures migrate only through declared adapters.
- Corrupt fixtures fail safely with the original database unchanged.

## Phase 2 — Arabic-first quality and accessibility

### WORK-049 — Arabic-first product copy (P1)

Implementation:

- Audit every core screen, save state, migration/import state, empty state, error, recovery action, and destructive-adjacent confirmation.
- Replace ambiguous or shame-oriented text with short Arabic-first copy that explains what was preserved and the next safe action.
- Freeze terminology for book, plan, session, artifact, gap, export, import, backup, rollback, and recovery.
- Keep book titles and user-authored content language-neutral.

Acceptance/tests:

- Every core route has a title, purpose, primary action, empty state, and actionable failure copy.
- Saved/pending/failed/recovery messages distinguish state without relying on color.
- Copy review has no unexplained English UI labels unless they are product names or technical references.

### WORK-050 — RTL, responsive layouts, and themes (P1)

Implementation:

- Verify structural `dir="rtl"`, logical CSS properties, bidi-safe identifiers/timestamps, and Arabic numeral/readability choices.
- Complete light/dark/system theme behavior, zoom resilience, and responsive layouts for 320, 420, and 600 px.
- Ensure import preview, rollback, error, and recovery surfaces fit the narrow panel without clipped actions or horizontal overflow.

Acceptance/tests:

- Core flows remain usable at each target width and 200% zoom.
- Theme changes persist across reload/restart and preserve contrast.
- No layout depends on PDF language or document rendering.

### WORK-051 — Keyboard, focus, and contrast (P1)

Implementation:

- Define deterministic tab order and focus return for dialogs, preview, import commit/cancel, errors, and recovery.
- Add visible focus rings with adequate contrast and non-color status indicators.
- Ensure all actions and text inputs are operable without a pointer.
- Add semantic labels, live regions, and landmark checks.

Acceptance/tests:

- Core journeys complete by keyboard alone.
- Focus is never trapped or lost after validation failure, rollback, or restart.
- Contrast and focus checks meet WCAG AA targets.
- Screen-reader announcements identify status and next action.

### WORK-052 — Reduced motion and system states (P1)

Implementation:

- Respect `prefers-reduced-motion` and avoid required information in animation.
- Design explicit empty, loading, saving, migration-readonly, interrupted, quota/error, and completed states.
- Provide exactly one safe next action for recoverable failures and preserve user data.

Acceptance/tests:

- Reduced-motion emulation disables non-essential transitions.
- Every tested state has readable status text and a keyboard-reachable action.
- Import cancellation, rollback, and restart states do not lose acknowledged data.

## Phase 3 — Verification and release regression

### WORK-053 — Unit tests for engines/calculations (P1)

Implementation:

- Expand pure coverage for rules/conflicts, PPM/reverse planning, state transitions, serialization, validators, migrations, checksums, and import preview.
- Include property-based-style tables for boundary dates, empty/partial data, duplicate IDs, unsupported versions, and Unicode.

Acceptance/tests:

- Deterministic tests cover success, rejection, no-mutation, and failure paths.
- Serialized projections and migration results are stable across repeated runs.
- Test output identifies the source fixture and contract version.

### WORK-054 — Integration tests for data/recovery (P1)

Implementation:

- Use `fake-indexeddb` for schema upgrades, readonly gating, backup/commit/rollback, quota-like failures, autosave, timer persistence, and interrupted recovery.
- Re-read all stores after commit/rollback and assert relation integrity.
- Verify migration journals and crash-safe cleanup.

Acceptance/tests:

- Real adapter behavior matches pure contracts.
- Atomic rollback is proven for each store boundary.
- Restart/recovery preserves the last valid state and user-authored artifacts.

### WORK-055 — E2E core journeys (P1)

Implementation:

- Extend the existing WebDriver harness with onboarding, New Book, plan creation, preview/question, focus/pause/resume, recall/review/apply, export, import preview, cancel, commit, rollback, and recovery journeys.
- Assert visible Arabic copy, route safety, persistence, no stale state, and no accidental content/network access.
- Capture console and request instrumentation per run.

Acceptance/tests:

- A fresh profile completes the core journey.
- Import preview cancellation leaves the original database unchanged.
- Valid commit survives reload; simulated failure shows rollback/recovery.
- Corrupt import is rejected without data loss.

### WORK-056 — Chrome/Edge release regression (P1)

Implementation:

- Package the production extension and run the same fixture matrix in Chrome for Testing and Microsoft Edge.
- Use matching browser/WebDriver binaries and isolated profiles.
- Cover HTTPS PDF fixture, local-file permissions, restart/update, migration/read-only, themes, zoom, keyboard/focus, import/export, and zero extension network requests.
- Record browser versions, driver versions, fixture URLs/paths, permission state, test counts, console/network evidence, screenshots, and WebDriver limitations.

Acceptance/tests:

- Chrome and Edge pass the same release matrix with matching drivers.
- No PDF bytes, text, headers, URL responses, or remote identifiers are read or transmitted.
- Browser close/reopen, extension update, import failure, and rollback preserve user data.
- No extension console errors or extension-originated HTTP(S) requests occur.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Malformed import mutates live data | Critical | Validate and preview in memory, backup first, single transaction, post-commit verification, rollback journal. |
| Legacy schema is silently reinterpreted | High | Explicit version adapters, unsupported-version readonly gate, migration fixtures. |
| Quota/interruption leaves partial state | Critical | Atomic writes, durable journal, backup restore, restart integration tests. |
| Arabic copy hides recovery action | Medium | Copy inventory, semantic status text, focus/live-region checks, responsive review. |
| Browser differences invalidate evidence | High | Matching binaries, isolated profiles, identical fixture matrix, exact evidence logs. |
| Import/export leaks document data | Critical | Field allowlist, privacy assertions, static scans, console/network instrumentation. |

## Completion evidence

- Implementation: import validation, bounded text/timestamp checks, explicit legacy-v1 normalization, count/reference validation, in-memory preview, atomic IndexedDB replacement, rollback, and a local phase journal are in `src/storage/indexedDb/` and the Library preview surface.
- Automated verification: `npm run check` passed on 2026-09-15 with 39 Vitest files / 155 tests, TypeScript type-check, and Vite production build. `git diff --check` passed.
- Chrome for Testing: `152.0.7977.82` with ChromeDriver `152.0.7977.82`; fresh isolated profile passed onboarding, core session flow, import preview/cancel (database count unchanged), import commit/reload, recovery, migration readonly/export, RTL, and zero extension console/network activity.
- Microsoft Edge: `153.0.4234.32` with EdgeDriver `153.0.4234.32`; the same matrix passed.
- WebDriver limitation: toolbar action triggering is blocked by the DevTools allowlist; the registered Side Panel document and `chrome.sidePanel.getOptions()` were exercised directly. This does not alter packaged runtime behavior.
- Privacy boundary: no PDF bytes/text/headers/MIME or URL responses are read or transmitted; the import journal stores only an in-progress phase and timestamp locally.

## Completion gates

- All eleven Work Items have implementation plans, acceptance mapping, and evidence.
- `npm run check`, production build, and `git diff --check` pass.
- Import validation, preview, backup, rollback, and round-trip tests pass with real IndexedDB integration.
- Arabic/RTL/theme/accessibility/reduced-motion checks pass at 320/420/600 px and 200% zoom.
- Chrome for Testing and Edge pass with matching WebDriver versions.
- Zero extension console errors and zero extension-originated network requests.
- `STATUS.md`, `MEMORY.md`, this plan, SPEC-016, and all eleven Work Items record matching status, versions, evidence, and limitations before any task is marked Done.

## Progress tracking

Final state: 11/11 tasks complete. All eleven Work Items are `Done` with DoR/DoD complete.

Next action: none for this plan; retain the evidence and limitations above for release review.
