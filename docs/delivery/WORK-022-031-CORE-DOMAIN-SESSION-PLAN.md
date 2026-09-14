# WORK-022–031 — Core Domain, Planning, and Session Implementation Plan

Status: In Review on 2026-09-14
Scope: planning only; no runtime code or work status changed

## Outcome

Deliver the first complete local core from validated goal selection through immutable protocol snapshots, book and reading-plan lifecycle, a guided session state machine, Preview/Questions, and an absolute-time Focus/Break timer.

This plan coordinates these ten P0 work items:

1. `WORK-022` — goal conflicts and selection.
2. `WORK-023` — immutable Protocol Snapshot.
3. `WORK-024` — rules matrix and time calculations.
4. `WORK-025` — book create/edit/archive/restore.
5. `WORK-026` — metadata validation and duplicate detection.
6. `WORK-027` — Reading Plan and reverse planning.
7. `WORK-028` — Library and safe resume.
8. `WORK-029` — Session state machine.
9. `WORK-030` — Preview and Questions.
10. `WORK-031` — Focus, Break, and timer.

## Sources

- [SPEC-014 — coordinated implementation plan](https://app.notion.com/p/3db805b7d82b8119b7baec0abddd02ec)
- [Approved Product & System Design Spec](https://app.notion.com/p/3d9805b7d82b8118918af8f6b19ce1a2)
- [SPEC-005 — Goal & Protocol Specification](https://app.notion.com/p/3d9805b7d82b816cac16fc77aea69e73)
- [SPEC-006 — Technical Architecture](https://app.notion.com/p/3d9805b7d82b81bf94c7ebea3fa7376d)
- [SPEC-007 — Local Data Specification](https://app.notion.com/p/3d9805b7d82b81a0b5cbf1a97584ddce)
- [SPEC-008 — Test Strategy](https://app.notion.com/p/3d9805b7d82b815bb187e7057654ba43)
- [SPEC-013 — Versioned Goal and Protocol Catalogs](https://app.notion.com/p/3db805b7d82b81a1b402dc19c6f68084)
- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/DATA_MODEL.md`
- `docs/architecture/SESSION_STATE_MACHINE.md`
- `docs/product/PROTOCOLS.md`
- `docs/product/USER_FLOWS.md`
- `docs/delivery/TEST_STRATEGY.md`

## Execution topology

The work contains three internal chains:

```text
Rules:       WORK-022 → WORK-023 → WORK-024
Books/plans: WORK-025 → WORK-026 → WORK-027 → WORK-028
Sessions:    WORK-029 → WORK-030 → WORK-031

Integration: Rules → Reading Plan → Session
```

The three chain roots may be technically independent after their individual readiness gates are satisfied. The repository WIP limit still permits only one executable item in `In Progress` at a time.

## Phase 0 — Readiness and dependency correction

All ten tasks remain `Inbox` with DoR incomplete. Before an owning task moves to `Ready`, resolve its missing contract and verify its real dependencies.

The live backlog currently places durable storage work later:

- `WORK-041` owns the IndexedDB schema and repository.
- `WORK-043` owns autosave and data integrity.
- `WORK-044` owns interrupted-session recovery.

This conflicts with acceptance criteria in `WORK-025`, `WORK-028`, `WORK-030`, and `WORK-031`, which require archive/restore, resume, autosave, and reload/restart behavior. Before execution, choose one of these honest paths:

1. Move the required storage tasks earlier and add explicit dependencies; or
2. Split the affected work into pure/domain and durable-integration tasks, keeping persistence criteria incomplete until the storage work lands.

Do not use `localStorage` as a substitute for the approved IndexedDB domain store, and do not mark persistence-dependent work Done against an in-memory fake.

The following product contracts also require approval before their owning task enters `Ready`:

- Exact goal-conflict and secondary-goal decision matrix.
- Exact Arabic rationale and invalid-selection messages.
- Reverse-planning timezone, inclusive-day, and rounding semantics.
- Executable ordered step templates and default durations for each protocol.
- Versioned metadata fingerprint fields and collision-confirmation behavior.

## Shared engineering contract

- Keep domain behavior in small pure TypeScript modules; UI components and browser adapters stay thin.
- Inject IDs, clocks, and repositories. Pure reducers/calculators must not read browser globals, current time, random values, storage, or network state.
- Use readonly JSON-serializable records with explicit schema/catalog/rules versions.
- Invalid input or transitions return typed errors and preserve the last valid state.
- IndexedDB is the durable domain store. Chrome Storage Local remains settings-only.
- A Protocol Snapshot copies its source definitions and versions. It never holds a mutable catalog reference.
- The active-tab adapter remains transient. Saved book references never include PDF bytes, text, headers, or fetched URL content.
- No new extension permission, content script, host access, network call, analytics, account, or backend is introduced.
- Arabic UI is structurally RTL, keyboard accessible, narrow-panel-first, and verified at 320, 420, and 600 px.

## WORK-022 — Goal selection and conflict rules

### Deliverable

Create a pure, versioned goal-selection validator and deterministic protocol-decision function backed by the WORK-021 catalogs.

### Contract

- Accept exactly one primary goal and zero to two unique secondary goals.
- Reject a missing primary goal, unknown IDs, duplicate secondaries, primary repeated as secondary, and more than two secondaries.
- Return stable typed error codes and calm Arabic messages.
- Use an explicit decision table. The primary goal wins conflicts; secondaries affect compatible output only when the approved matrix says so.
- Return the selected protocol ID and structured Arabic rationale.
- Do not create snapshots, calculate time, persist records, or enable UI routes.

### Planned files

- `src/domain/goals/goalSelection.ts`
- `src/domain/goals/goalSelection.test.ts`
- `src/domain/rules/protocolDecision.ts`
- `src/domain/rules/protocolDecision.test.ts`

### Verification

- Every primary goal has an expected result.
- Zero, one, and two valid secondaries.
- Overflow, duplicates, primary duplication, unknown IDs, and missing primary.
- Primary-goal conflict precedence and deterministic rationale.
- Complete decision-table coverage and no input mutation.

## WORK-023 — Immutable Protocol Snapshot

### Deliverable

Create a snapshot factory and readonly versioned contract that isolates historical reading plans from future catalog/rule changes.

### Contract

- Copy the selected protocol ID, reference name, Arabic label, building blocks, selected goals, rationale, goal/protocol/rules versions, and ordered executable step definitions.
- Accept caller-supplied snapshot ID and creation timestamp.
- Deep-copy all nested arrays/records and freeze at runtime where practical.
- Reject unsupported IDs, versions, or incomplete decisions without partial output.

### Planned files

- `src/domain/protocols/protocolSnapshot.ts`
- `src/domain/protocols/protocolSnapshot.test.ts`
- `src/domain/protocols/protocolSteps.ts`
- `src/domain/protocols/protocolSteps.test.ts`

### Verification

- Identical inputs serialize identically.
- Runtime and compile-time mutation are rejected.
- Mutating source fixtures cannot alter an existing snapshot.
- Versions and rationale survive serialization.
- A historical version-1 fixture remains stable after simulated catalog changes.

## WORK-024 — Rules matrix and time calculations

### Deliverable

Add exhaustive decision fixtures plus pure pages-per-minute and reverse-planning calculators.

### Contract

- Cover all nine primary goals and approved secondary-goal conflict cases.
- Validate page range, current page, available minutes, pages per minute, deadline, and timezone/date inputs.
- Produce remaining pages, estimated minutes, available reading days, daily page target, and suggested session duration.
- Make inclusive-day behavior and rounding explicit.
- Reject zero, negative, non-finite, reversed, and impossible inputs.

### Planned files

- `src/domain/rules/protocolDecisionMatrix.test.ts`
- `src/domain/planning/readingTime.ts`
- `src/domain/planning/readingTime.test.ts`

### Verification

- Exhaustive primary-goal coverage and rationale for every result.
- PPM boundaries and fractional values.
- Same-day, month, year, and leap boundaries.
- Inclusive-day and timezone behavior.
- Rounding, impossible deadlines, and deterministic output.

## WORK-025 — Book lifecycle

### Deliverable

Define the Book contract, lifecycle service, repository port, and thin New Book/edit/archive/restore application flow.

### Contract

- Store local ID, normalized title, optional author, total pages, optional explicitly saved document-reference metadata, lifecycle timestamps, and active/archived state.
- Archive without deleting Reading Plans, Sessions, or Learning Artifacts.
- Restore returns the book to active Library results.
- Keep permanent deletion outside this task.
- Never persist PDF content, headers, or fetched URL responses.

### Planned files

- `src/domain/books/book.ts`
- `src/domain/books/bookLifecycle.ts`
- `src/domain/books/bookRepository.ts`
- Co-located tests
- `src/screens/NewBookScreen.tsx` after the durable repository dependency is satisfied

### Verification

- Create/edit validation and timestamp injection.
- Archive/restore idempotency.
- Related plan/session/artifact preservation.
- Repository failure leaves the previous state valid.
- Active and archived query behavior.

## WORK-026 — Metadata validation and duplicate detection

### Deliverable

Create a pure metadata normalizer, a versioned local fingerprint, duplicate-warning behavior, and explicit one-use override.

### Contract

- Validate title, page count, optional author/reference fields, whitespace, control characters, and explicit length bounds.
- Derive the fingerprint from canonical metadata only; never read or hash PDF content.
- Treat a fingerprint match as a warning with candidate IDs, not an automatic rejection.
- Require an explicit acknowledgement to save a warned duplicate.
- Confirm normalized fields before treating a candidate as the same book; do not trust a hash alone.

### Planned files

- `src/domain/books/bookMetadata.ts`
- `src/domain/books/bookMetadata.test.ts`
- `src/domain/books/bookFingerprint.ts`
- `src/domain/books/bookFingerprint.test.ts`

### Verification

- Normalization equivalence and meaningful differences.
- Invalid page counts, empty titles, control characters, and bounds.
- Deterministic versioned fingerprints.
- Collision-safe confirmation and explicit override semantics.
- No input mutation or environment dependency.

## WORK-027 — Reading Plan and reverse planning

### Deliverable

Create a ReadingPlan contract and transactional creation service linked to one immutable Protocol Snapshot.

### Contract

- Capture book ID, page range/progress start, primary/secondary goals, time budget, optional deadline, daily target, status, and injected timestamps.
- Invoke WORK-022 selection, WORK-023 snapshot creation, and WORK-024 calculations through focused interfaces.
- Persist the Reading Plan and Protocol Snapshot atomically.
- Preserve prior plans as history when a new plan becomes active.
- Never mutate a historical snapshot.

### Planned files

- `src/domain/planning/readingPlan.ts`
- `src/domain/planning/createReadingPlan.ts`
- `src/domain/planning/readingPlanRepository.ts`
- Co-located tests
- Thin Goal Selection and Protocol Preview screens after dependencies are complete

### Verification

- Page-only, time-only, and deadline flows.
- Daily target and suggested session calculations.
- Invalid constraints and unavailable rule result.
- Snapshot linkage, active-plan replacement, and history preservation.
- Transaction rollback on any failed write.

## WORK-028 — Library and safe resume

### Deliverable

Replace the current reference-only Library with repository-backed active/archived states and deterministic safe-resume routing.

### Contract

- Show active and archived books separately with progress and latest-session summary.
- Resolve an interrupted session to its latest persisted safe step.
- Otherwise resume the active plan or open Book Progress.
- Missing/corrupt references fail safely with preserved-data guidance.
- Never reuse transient active-tab metadata as stored book identity.

### Planned files

- `src/domain/books/libraryQuery.ts`
- `src/domain/books/resolveBookResume.ts`
- Co-located tests
- Update `src/screens/LibraryScreen.tsx`
- Update router tests and route enablement only for completed flows

### Verification

- Empty, populated, archived, loading, and recoverable error states.
- Ordering and latest-session selection.
- Interrupted and non-interrupted resume paths.
- Missing/corrupt IDs and stale-context isolation.
- RTL, keyboard, accessible status, and 320/420/600 px behavior.

## WORK-029 — Session state machine

### Deliverable

Create a pure session reducer with explicit validated transitions.

### Contract

- States: Draft, Ready, Active, Paused, Break, Recall, Review, Completed, Interrupted, and Abandoned.
- Interrupted is recoverable from Active, Paused, Break, Recall, and Review and stores the last safe state.
- Invalid transitions return typed domain errors and do not mutate state.
- Completed alone contributes to completion metrics.
- Abandoned retains saved notes and artifacts.
- Every transition receives its timestamp from the caller.

### Planned files

- `src/domain/sessions/session.ts`
- `src/domain/sessions/sessionStateMachine.ts`
- `src/domain/sessions/sessionStateMachine.test.ts`

### Verification

- Full allowed-transition table and every invalid edge.
- Interruption and safe resume from every supported state.
- Abandonment preservation and completion semantics.
- Replayed command determinism, serialization, and no mutation.

## WORK-030 — Preview and Questions

### Deliverable

Build protocol-derived Preview checklist and user-authored Question steps using session commands and an autosave port.

### Contract

- The Preview checklist is short, ordered, and derived from the saved snapshot.
- Questions are user-authored; the extension does not inspect or generate from document content.
- Persist each meaningful input/update before advancing.
- Expose saved, pending, failed, and retry states with accessible Arabic feedback.
- Enable only routes whose domain and durable-storage dependencies are complete.

### Planned files

- `src/domain/sessions/previewQuestions.ts`
- `src/domain/sessions/previewQuestions.test.ts`
- `src/screens/PreviewQuestionsScreen.tsx`
- Co-located UI/integration tests

### Verification

- Checklist order and question validation.
- Autosave success, failure, retry, and reload restoration.
- No document-content access.
- Keyboard/focus order, structural RTL, status announcements, and responsive checks.

## WORK-031 — Focus, Break, and timer

### Deliverable

Build a pure absolute-time timer plus Focus/Break UI for Pomodoro, 50/10, short blocks, and Timeboxing.

### Contract

- Store `startedAt`, `targetEndAt`, accumulated paused duration, pause/break timestamps, and timer mode.
- Derive remaining time from an injected current timestamp; interval ticks repaint only and are never authoritative.
- Browser suspension or reload recomputes state and never auto-completes a session.
- Pause, Resume, and Break commands transition through WORK-029.
- Show one primary action at a time.

### Planned files

- `src/domain/timer/absoluteTimer.ts`
- `src/domain/timer/absoluteTimer.test.ts`
- `src/screens/FocusSessionScreen.tsx`
- Co-located UI/integration tests

### Verification

- Start, pause, resume, break, expiry, repeated commands, and clock boundaries.
- Long suspension and reload recovery.
- Pomodoro, 50/10, short-block, and Timeboxing modes.
- Reduced motion, RTL, keyboard-only use, and 320/420/600 px.
- Packaged Chrome/Edge restart behavior, zero console errors, and zero extension-originated network requests.

## Verification gates

For every task:

```powershell
npm run check
git diff --check
```

Also record focused red/green evidence, final test counts, commit, limitations, and the exact Notion acceptance mapping.

Pure-domain tasks must prove exhaustive fixtures, invalid-input safety, no mutation, deterministic serialization, and no browser/storage/network dependencies.

Persistence-bearing tasks must use the real IndexedDB adapter and cover transaction failures, reload/restart, migration compatibility, and preservation. Mock-only success is not completion evidence.

UI tasks must cover semantic RTL, keyboard-only operation, visible focus, accessible saved/error status, reduced motion, light/dark themes, and 320/420/600 px.

Browser-visible milestones require packaged Google Chrome for Testing and Microsoft Edge evidence with exact versions, console output, network evidence, and recovery behavior.

## Coordinated Definition of Done

- Every acceptance criterion in WORK-022 through WORK-031 has implementation and runtime evidence in its own record.
- Actual dependency relations match the architecture.
- No persistence-dependent task is marked Done against a fake-only repository.
- Historical Protocol Snapshots survive catalog/rule changes unchanged.
- Archive, resume, autosave, interruption, and timer recovery survive a packaged-browser restart.
- No PDF content is accessed or transmitted and no browser permission is added.
- Local `STATUS.md` and `MEMORY.md`, Notion evidence, commits, test counts, browser versions, and limitations are updated before each item moves Done.

## Current state

SPEC-014 is In Review. All ten work items are linked to it and remain `Inbox` with DoR and DoD incomplete. `WORK-022` is the first dependency-cleared candidate, but its decision matrix, messages, and rationale contract must be approved before it moves to `Ready`.
