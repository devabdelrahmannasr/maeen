# WORK-032–036, WORK-037–040 & WORK-045 — Session Artifacts, Progress Metrics, and Export Plan

Status: Done, completed 2026-09-15

Notion plan: https://app.notion.com/p/3dc805b7d82b81cca4e1d74e936d49da

## Outcome

Complete the post-focus learning loop, make local progress explainable, and give the reader an explicit user-owned export path. The work remains local-first and content-neutral: the extension records only user-entered artifacts and domain metadata, never PDF bytes, text, headers, fetched responses, or network telemetry.

This plan covers the ten existing Notion Work Items:

- \`WORK-032\` → \`WORK-033\` → \`WORK-034\` → \`WORK-035\` → \`WORK-036\`
- \`WORK-037\` → \`WORK-038\` → \`WORK-039\` → \`WORK-040\`
- \`WORK-045\`

No new Work Items are created. The plan is linked to \`SPEC-015\` in Notion and to the existing \`REL-002 Internal Alpha\` and \`REL-003 Private Beta\` release records.

## Scope boundaries

In scope:

- Recall, Review, Apply, and Summary after a Focus session.
- A single typed Learning Artifact model for recall, explanation, question, review, and application.
- Fast in-session Notes and Questions with autosave and recovery-safe feedback.
- Gaps, evidence, applications, and distraction events.
- Deterministic local completion, recall, gaps, applications, and secondary page metrics.
- Book Progress presentation and one explainable next safe action.
- JSON and human-readable Markdown export initiated by an explicit user action.
- Unit, integration, UI/accessibility, privacy, and packaged Chrome/Edge verification.

Out of scope:

- PDF content access, parsing, OCR, annotation, MIME verification, URL fetching, or content-language detection.
- Import, preview, backup-before-commit, rollback, and migration of imported files; those belong to \`WORK-046\`–\`WORK-048\`.
- Cloud sync, accounts, analytics, telemetry, remote identifiers, or server APIs.
- New extension permissions, content scripts, host permissions, routes that bypass the existing domain gates, or automatic AI-generated notes/questions.
- Permanent deletion; archive and user-owned export remain the safe data controls.

## Current prerequisites

The following are complete and are treated as implementation inputs, not reimplemented:

- Versioned goal and protocol catalogs (\`WORK-021\`).
- Core rules, snapshots, planning, books, session transitions, and absolute timers (\`SPEC-014\`).
- IndexedDB schema/repositories, migrations/read-only gate, autosave, and interrupted-session recovery (\`WORK-041\`–\`WORK-044\`).
- Library query and safe-resume contracts from \`WORK-028\`.
- Arabic RTL shell, settings/theme adapter, \`activeTab\`-only browser boundary, and existing test/build harness.

## Dependency graph and sequencing

~~~text
WORK-031 (Done) ──> WORK-032
                         └─> WORK-034 ──> WORK-035 ──> WORK-036
WORK-033 (independent foundation) ────────────────┘

WORK-037 ──> WORK-038 ──> WORK-039 ──> WORK-040

Existing IndexedDB/export read boundary ──> WORK-045
~~~

\`WORK-032\` and \`WORK-033\` are technically independent roots, but the repository WIP limit allows only one item in \`In Progress\`. Recommended queue order is \`032 → 033 → 034 → 035 → 036 → 037 → 038 → 039 → 040 → 045\`; \`WORK-045\` may be pulled forward when a slot is free because it has no direct Notion dependency.

## Shared implementation contract

- Keep domain calculations and reducers pure. Inject IDs, clocks, repositories, and download sinks.
- Use the existing schema/catalog versions and JSON-serializable records. Add a migration only if a new persisted field requires it; do not silently reinterpret historical artifacts.
- Persist meaningful user input before navigation or session completion. Never report \`saved\` before the transaction succeeds.
- Write Session, SessionStep, LearningArtifact, and DistractionEvent changes atomically where a user action spans records.
- Only \`Completed\` sessions count as completed. Abandoned sessions retain artifacts but do not count as completed work.
- Metrics are deterministic projections over local records and carry their source definition/version; they are not uploaded or used for behavioral tracking.
- Export reads through a readonly repository boundary, includes schema/version metadata, and does not mutate live data. Markdown is a human-readable projection, not the import contract.
- UI remains Arabic-first, structural RTL, keyboard accessible, reduced-motion aware, and usable at 320, 420, and 600 px.

## Implementation phases

### Phase 1 — Artifact foundation and post-focus loop

#### WORK-032 — Recall, Review, Apply, and Summary (P0, 2 days)

Objective: complete the session learning loop after Focus and persist the result safely.

Implementation:

- Add typed commands/view-models for Recall, Review, Apply, and Summary derived from the immutable Protocol Snapshot.
- Reuse \`LearningArtifact\` records; distinguish recall, review, and application without conflating them with questions or notes.
- Require explicit user submission for each artifact and persist before advancing.
- Complete the session only after the required steps are valid; preserve partial artifacts if the user abandons.
- Render a calm Summary with completion, recall, gaps, applications, elapsed time, and the next safe action.

Likely files: \`src/domain/sessions/sessionRecords.ts\`, a focused artifact/session-summary domain module, \`src/screens/FlowScreens.tsx\` or a dedicated summary screen, repository bundle methods, and co-located tests.

Acceptance and tests:

- Recall is entered from memory; Review and Apply are distinct persisted artifacts.
- Gaps and applications are visible in Summary.
- Only \`Completed\` contributes to completion metrics.
- Reload, interruption, retryable save failure, and abandonment retain already-saved input.
- No document API, PDF bytes, network call, or generated content is involved.

#### WORK-033 — Learning Artifact model and repository (P0, 2 days)

Objective: establish the single durable artifact contract used by all later session and metric work.

Implementation:

- Define the five artifact types: \`recall\`, \`explanation\`, \`question\`, \`review\`, and \`application\`.
- Validate session ownership, non-empty bounded content, timestamps, IDs, and schema version.
- Support optional page-range/reference fields only when explicitly supplied by the user; never infer them from the PDF.
- Add repository CRUD/list-by-session/list-by-type operations over IndexedDB with transaction and unavailable/quota errors.
- Keep repository access behind a port; UI never opens IndexedDB directly.

Likely files: \`src/domain/sessions/sessionRecords.ts\`, \`src/domain/sessions/learningArtifacts.ts\`, \`src/storage/indexedDb/domainRepositories.ts\`, and integration tests using \`fake-indexeddb\`.

Acceptance and tests:

- One type-safe model covers all five types.
- CRUD and filtered queries work against the real IndexedDB adapter.
- Invalid type, ownership, content, and timestamp inputs are rejected without mutation.
- Atomic rollback is proven when an artifact write fails.

### Phase 2 — Fast capture and distraction evidence

#### WORK-034 — In-session Notes and Questions (P0, 1 day)

Objective: capture user-authored notes/questions without leaving the session.

Implementation:

- Add compact Notes and Questions controls to the active session surface.
- Use keyboard shortcuts only when focus is not inside a text field and expose the shortcuts in accessible help text.
- Debounce/coalesce autosave through the existing coordinator while preserving the latest input.
- Show saved, pending, failed, and retry states without losing text; restore the last saved draft on reload/recovery.
- Do not generate, summarize, or inspect document content.

Acceptance and tests:

- Add a note/question without leaving the session.
- Keyboard-only path has deterministic focus order and no shortcut interference with text entry.
- Rapid edits persist the last value; panel close/reload does not erase acknowledged content.
- Save failure exposes retry and preserves the draft.

#### WORK-035 — Recall, Gaps, and Applications (P0, 2 days)

Objective: model learning evidence explicitly and make gap closure auditable.

Implementation:

- Add artifact helpers for recall statements, gap records, evidence/closure, and application commitments.
- Link gap closure to user-entered evidence or an explanation artifact; never mark a gap closed implicitly.
- Include application artifacts in Summary and later metric projections.
- Preserve all records when sessions are abandoned; do not count abandoned sessions as complete.

Acceptance and tests:

- Recall and gap records are distinct.
- Closing a gap requires evidence and persists that evidence.
- Applications appear in Summary and survive restart.
- Invalid transitions and partial writes leave the last valid state intact.

#### WORK-036 — Distraction action and events (P0, 1 day)

Objective: record a lightweight distraction event without punishing or stopping the reader.

Implementation:

- Add one explicit distraction action that records timestamp, session ID, current step, and optional category/note.
- Keep the timer running; do not transition session state or reset the focus block.
- Display a neutral count and accessible status text; avoid shame-oriented copy.
- Persist event and associated session metadata atomically when needed.

Acceptance and tests:

- One press records the correct timestamp and step.
- Timer state is unchanged.
- Count is deterministic, local, and non-judgmental.
- Duplicate/retry behavior does not create accidental repeated writes.

### Phase 3 — Metrics, progress, and recommendations

#### WORK-037 — Local learning metrics (P1, 2 days)

Objective: calculate deterministic progress signals from local records.

Implementation:

- Define a versioned \`LearningMetrics\` projection for completion, recall, open/closed gaps, applications, distraction count, and secondary page progress.
- Count only completed sessions for completion; retain abandoned data for history but exclude it from completion numerator/denominator.
- Define zero-data, partial-session, and missing-reference behavior explicitly.
- Keep calculations pure and expose source/version metadata for privacy documentation.

Acceptance and tests:

- Completion, recall, gaps, and applications are calculated consistently.
- Page count is a secondary metric, never the only progress signal.
- Same records produce byte-stable serialized results.
- Empty, partial, archived, and abandoned cases are covered.

#### WORK-038 — Book Progress dashboard (P1, 2 days)

Objective: present progress and the next useful action for each book.

Implementation:

- Extend the repository-backed Book Progress view with metric cards, latest-session context, open gaps, applications, and safe next action.
- Reuse \`queryLibrary\`/\`resolveBookResume\` instead of duplicating routing or treating active-tab metadata as book identity.
- Handle loading, empty, archived, missing-reference, and recoverable-error states.
- Keep the dashboard narrow-panel-first and progressively disclose detail.

Acceptance and tests:

- Progress and latest sessions are visible.
- Open understanding gaps are distinguishable from completed recall.
- Exactly one explainable next safe action is shown.
- RTL, keyboard/focus, status announcements, and 320/420/600 px checks pass.

#### WORK-039 — Resume recommendations (P1, 1 day)

Objective: recommend the latest safe continuation without reviving abandoned work.

Implementation:

- Add a pure recommendation function over book, plan, session, recovery, and metrics state.
- Prefer interrupted safe step, then active plan preview, then Book Progress; never recommend an abandoned session as resumable.
- Return a reason code and Arabic explanation alongside the route.
- Treat missing/corrupt references as a safe recovery action, not as a silent fallback.

Acceptance and tests:

- Latest safe step wins when an interruption exists.
- Abandoned sessions are never auto-resumed.
- Every recommendation has an explainable reason.
- Missing references preserve data and guide the user to a safe action.

#### WORK-040 — Local metrics privacy review (P1, 1 day)

Objective: prove metrics remain local and transparent.

Implementation:

- Document every metric's local source, retention, and exclusion rules.
- Add static/contract checks that metric code has no fetch, XMLHttpRequest, WebSocket, analytics SDK, remote identifier, or host-permission dependency.
- Review exported fields to ensure metrics contain no PDF content or fetched URL response.
- Add a concise UI privacy explanation linked from Book Progress/Settings and update privacy docs.

Acceptance and tests:

- No analytics or network requests.
- No identifiers leave the device.
- Each metric cites its source record and version.
- Automated scans and packaged browser observation record zero extension-originated requests and console errors.

### Phase 4 — Explicit user-owned export

#### WORK-045 — JSON and Markdown export (P0, 2 days)

Objective: export the complete local product state in machine-readable JSON and human-readable Markdown.

Implementation:

- Define a versioned export envelope with schema version, export timestamp, record counts/checksums where available, and the domain stores required for restore.
- Read through a readonly export service; do not open a write transaction or mutate live data.
- Serialize books, plans, immutable snapshots, sessions, steps, artifacts, distraction events, and metric source metadata while excluding PDF content, headers, responses, and settings secrets.
- Generate readable Markdown grouped by book/session with explicit status and timestamps; preserve Arabic and non-Arabic book titles without language assumptions.
- Require an explicit user action, provide progress/error feedback, and revoke temporary download URLs after use.
- Leave import validation/migration/preview/backup/commit to \`WORK-046\`–\`WORK-048\`.

Acceptance and tests:

- JSON contains release/schema metadata and deterministic record coverage.
- Markdown is readable and includes books, progress, and learning artifacts.
- Export occurs only after an explicit action and does not write to IndexedDB.
- Empty database, large artifact text, Unicode/RTL, missing optional fields, and readonly/migration-gated mode are covered.
- Exported payload contains no PDF bytes/text/headers/URL responses and triggers no network request.

## Verification gates

## Completion evidence (2026-09-15)

- Implementation complete for all ten linked items: WORK-032, WORK-033, WORK-034, WORK-035, WORK-036, WORK-037, WORK-038, WORK-039, WORK-040, and WORK-045.
- Automated verification: `npm run check` passed 37 Vitest files / 146 tests, TypeScript validation, and the Vite production build. `git diff --check` passed with only the repository's existing CRLF conversion notices.
- Chrome for Testing `152.0.7977.82` with matching ChromeDriver `152.0.7977.82` passed the packaged New Book → Goals → Protocol Preview → Focus → Recall → Summary flow, note/question autosave, distraction recording, completed-session persistence, JSON/Markdown export, Book Progress metrics/privacy notice, true restart/recovery, and future-version migration read-only/export behavior.
- Microsoft Edge `153.0.4234.32` with matching EdgeDriver `152.0.4234.32` passed the same matrix. Both runs recorded zero extension console errors and zero extension-originated network requests.
- The browser-action toolbar trigger remains blocked by the WebDriver DevTools allowlist (`blocked-by-webdriver-devtools-allowlist`); the registered `sidepanel.html` target and `chrome.sidePanel.getOptions()` contract were exercised directly. This is an automation limitation, not a product failure.
- Privacy boundary confirmed: only user-authored artifacts and domain metadata are stored/exported; no PDF bytes, text, headers, fetched URL responses, remote identifiers, or network telemetry are accessed or transmitted.

For every item:

~~~powershell
npm run check
git diff --check
~~~

Focused checks must cover pure no-mutation/determinism, real \`fake-indexeddb\` transactions, save/recovery behavior, and UI accessibility. The final milestone must package the extension and verify both Chrome for Testing and Microsoft Edge with matching WebDriver binaries:

- New Book → Goals → Protocol → Focus → Recall/Review/Apply → Summary.
- Notes/questions autosave and reload/recovery.
- Distraction event with timer continuity.
- Progress dashboard and safe resume after a second browser session.
- JSON/Markdown export from a user gesture, including migration read-only mode.
- RTL, keyboard/focus, reduced motion, 320/420/600 px behavior.
- Zero extension console errors and zero extension-originated network requests.

Record exact browser and driver versions, fixture data, test counts, console/network evidence, and automation limitations in \`STATUS.md\` and each Work Item before moving any task to Done.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Artifact schema drifts from session/repository records | High | Freeze the five-type versioned contract first; add migration only for required persisted changes. |
| Autosave acknowledges stale or partial input | High | Use one transactional coordinator, coalesce by record key, and test failure/retry/close races. |
| Metrics imply false learning certainty | Medium | Show source/version, use neutral labels, keep page count secondary, and document deterministic limits. |
| Resume recommendation revives abandoned state | High | Require non-terminal/non-abandoned checks and reason-coded pure routing. |
| Export leaks document or remote data | High | Export only repository-owned fields; add field allowlist, static network checks, and payload assertions. |
| Narrow RTL UI hides recovery/save state | Medium | Verify semantic RTL, focus order, status announcements, reduced motion, and all three target widths. |

## Definition of Ready for each item

- Direct dependencies are Done or explicitly waived with evidence.
- Acceptance criteria above are copied into the Work Item's implementation section.
- Files, repository ports, test fixtures, and privacy boundaries are identified.
- No unresolved decision changes the approved MVP/product boundary.
- Only one executable item is moved to \`In Progress\`.

## Definition of Done for the coordinated plan

- All ten Work Items have implementation, tests, review, and per-task evidence.
- The dependency chain is respected and no task is closed against fake-only storage.
- Session artifacts, metrics, recommendations, and export survive packaged Chrome/Edge restart/recovery checks.
- No PDF content or remote response is read, persisted, or transmitted.
- \`npm run check\` and \`git diff --check\` pass.
- \`STATUS.md\`, \`MEMORY.md\`, the local plan, the Notion plan, and all linked Work Items contain matching status, evidence, versions, and limitations.

## Progress tracking

Final state: 10/10 tasks complete; all ten linked records have implementation, automated coverage, packaged Chrome/Edge evidence, and Done/DoR/DoD updates in Notion.

Next action: no remaining implementation action in this plan. Import/validation remains explicitly deferred to WORK-046–WORK-048.
