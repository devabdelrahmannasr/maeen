# WORK-018 — Side Panel Shell and Routing Implementation Plan

Status: Ready for implementation  
Scope: planning only; no runtime code is changed by this document  
Target: complete within two focused implementation sessions, no later than 2026-09-15

## Sources

- Notion work item: [WORK-018 — Build the Side Panel shell and routing](https://app.notion.com/p/3d9805b7d82b813c8fa5dc6ce14e90cf)
- Approved Notion Technical Architecture: [SPEC-006](https://app.notion.com/p/3d9805b7d82b81bf94c7ebea3fa7376d)
- Approved Notion UX Specification: [SPEC-004](https://app.notion.com/p/3d9805b7d82b81a591cace7948b53503)
- Local references: `PRODUCT.md`, `DESIGN.md`, `docs/product/INFORMATION_ARCHITECTURE.md`, `docs/product/USER_FLOWS.md`, and `docs/delivery/TEST_STRATEGY.md`

## Outcome

Replace the two-route conditional inside `src/app/App.tsx` with a small typed navigation boundary for the ten MVP screens. The Side Panel must start on the correct route, recover only a validated safe route after closure or browser suspension, and keep product/domain decisions outside the shell.

## Current-state evidence

- `src/app/App.tsx` currently owns onboarding persistence, route selection, and screen rendering.
- The route type currently contains only `onboarding` and `library`.
- `OnboardingScreen` and `LibraryScreen` each render their own `<main class="app-shell">`.
- `onboardingSettings.ts` already uses Chrome Storage Local with a localStorage fallback for browser preview and tests.
- There is no router dependency, route parser, route persistence, route validation, or route-level recovery test.

## Scope

### Included

- A typed route catalog for all ten MVP destinations.
- Hash-path parsing and serialization without adding a routing package.
- A clear distinction between known, enabled, and safely restorable routes.
- Persistence of the last safe route in Chrome Storage Local, with the existing localStorage fallback pattern for preview/tests.
- Startup resolution that respects onboarding before any persisted route.
- A structural `AppShell` and a route outlet that contain no product/domain logic.
- Navigation integration for the existing Onboarding and Library screens.
- Automated tests for route validation, startup recovery, storage failure, and accessibility-critical landmarks.
- Manual verification in packaged Chrome and Edge Side Panels.

### Excluded

- Book, plan, protocol, session, timer, progress, import/export, or PDF-context business logic.
- Implementing the remaining eight product screens.
- A general-purpose router package.
- Deep linking from external websites.
- Browser history synchronization beyond the Side Panel's own hash route.
- Treating an unavailable or invalid contextual route as recoverable.

## Route contract

Define the ten stable route names now so later screen tasks do not invent navigation identifiers:

| Route name | Hash path | Required context | Restorable in WORK-018 |
|---|---|---|---|
| `onboarding` | `#/onboarding` | none | determined only by onboarding state |
| `library` | `#/library` | none | yes |
| `new-book` | `#/books/new` | none | no, until the screen exists |
| `goal-selection` | `#/books/:bookId/goals` | `bookId` | no |
| `protocol-preview` | `#/plans/:planId/protocol` | `planId` | no |
| `focus-session` | `#/sessions/:sessionId/focus` | `sessionId` | no |
| `recall-review` | `#/sessions/:sessionId/review` | `sessionId` | no |
| `session-summary` | `#/sessions/:sessionId/summary` | `sessionId` | no |
| `book-progress` | `#/books/:bookId/progress` | `bookId` | no |
| `settings-data` | `#/settings` | none | no, until the screen exists |

The catalog may know a future route without enabling it. Unknown, malformed, disabled, or context-dependent persisted routes resolve to `library`; they must never render a blank panel or fabricate missing domain state.

## Startup and navigation rules

1. Show the existing accessible loading state while startup settings are read.
2. If onboarding is incomplete, route to `onboarding` regardless of the hash or saved route.
3. If onboarding is complete, parse the current hash when present.
4. Accept it only when the route is known, enabled, and valid for the available context.
5. Otherwise read and validate the persisted last-safe route.
6. Fall back to `library` when persistence is missing, corrupt, unavailable, or unsafe.
7. Persist a route only after navigation succeeds and only when its route definition is restorable.
8. Never persist `onboarding` as the returning-user destination.
9. A failed route write keeps the current rendered screen and exposes a non-blocking Arabic status message explaining that navigation succeeded but restoration could not be saved.

## Planned file changes

### 1. Add the pure route model

Create `src/navigation/routes.ts`.

- Define a discriminated `AppRoute` union and stable `AppRouteName` values.
- Define the ten route descriptors, paths, enabled state, required parameter names, and restore policy.
- Implement pure `parseRouteHash()`, `serializeRoute()`, `isKnownRoute()`, and `isSafelyRestorableRoute()` functions.
- Validate identifiers as non-empty bounded strings before they enter route state.
- Keep this module independent of Preact, Chrome APIs, and domain repositories.

### 2. Add the navigation persistence adapter

Create `src/settings/navigationSettings.ts`.

- Use a versioned key such as `navigation.lastSafeRoute.v1`.
- Store the serialized route rather than an arbitrary object.
- Read from `chrome.storage.local` in the extension and localStorage in preview/tests.
- Parse and validate every stored value before returning it.
- Return `null` for missing or corrupt values; never throw corrupt storage into the UI.
- Let genuine storage API failures remain distinguishable so the UI can explain that restoration was not saved.

### 3. Add deterministic startup resolution

Create `src/navigation/resolveInitialRoute.ts`.

- Accept onboarding completion, current hash, and persisted route as inputs.
- Apply the startup precedence rules without reading browser APIs.
- Return a valid enabled route plus an optional recovery reason.
- Keep the function pure so all recovery branches can be unit tested.

### 4. Create the structural shell and route outlet

Create `src/app/AppShell.tsx` and `src/app/AppRouter.tsx`.

- `AppShell` owns the single `<main>` landmark, width/padding surface, loading state, and route-status announcement slot.
- `AppShell` accepts children and presentation props only; it must not read storage, inspect books, select protocols, or manage sessions.
- `AppRouter` maps enabled routes to screen components.
- Register Onboarding and Library as enabled.
- Keep the remaining route descriptors disabled until their owning work items provide screens; attempts to open them recover to Library.
- Do not create synthetic screen implementations merely to satisfy the route catalog.

### 5. Refactor the application coordinator

Update `src/app/App.tsx`.

- Move route types, parsing, persistence, and startup resolution out of the component.
- Keep only orchestration state: boot status, current route, and a narrow `navigate()` callback.
- Preserve the current onboarding behavior: save completion, then navigate to Library.
- Synchronize successful internal navigation with the Side Panel hash.
- Listen for `hashchange` and validate it through the same route parser.
- Render storage/recovery messages without discarding the active screen.

Update `src/screens/OnboardingScreen.tsx` and `src/screens/LibraryScreen.tsx`.

- Remove duplicate `<main class="app-shell">` ownership so the shared shell provides the single main landmark.
- Keep screen-specific headers and layouts inside their screen components.
- Add only the navigation callbacks needed by existing actions; do not add book or settings behavior that belongs to later work items.

Update `src/styles/global.css` only where needed to preserve the current 320, 420, and 600 px layouts after shell extraction.

### 6. Add automated verification

Create `src/navigation/routes.test.ts`.

- All ten names and paths are unique.
- Static and parameterized routes round-trip through serialize/parse.
- Unknown paths, missing identifiers, oversized identifiers, and malformed encodings are rejected.
- Disabled/context routes are not considered safe to restore.

Create `src/navigation/resolveInitialRoute.test.ts`.

- Incomplete onboarding always resolves to Onboarding.
- A valid enabled hash wins for a returning user.
- A valid saved safe route is restored when no hash is present.
- Corrupt, disabled, or contextual saved routes fall back to Library with a recovery reason.

Extend `src/app/App.test.tsx`.

- Preserve the four existing onboarding/storage tests.
- Verify returning startup restores Library.
- Verify a corrupt saved route does not blank or crash the panel.
- Verify completing onboarding updates the hash and saved safe route.
- Verify there is one `main` landmark after the shell refactor.
- Verify navigation-save failure leaves the destination usable and announces the safe recovery message.

### 7. Package and browser-check

Run:

```powershell
npm run check
git diff --check
```

Build the production extension and load `dist` in Chrome for Testing and Microsoft Edge. In both browsers verify:

1. First installation opens Onboarding.
2. Completing onboarding opens Library.
3. Close and reopen the Side Panel; Library is restored.
4. Set an invalid hash and reopen; the panel recovers to Library.
5. Refresh the Side Panel; no blank state or console error appears.
6. Keyboard focus remains visible and the document contains one main landmark.
7. Repeat at 320, 420, and 600 px.

Record exact browser versions, commands, test counts, console errors, and any automation limitation in `STATUS.md` and the Notion task.

## Acceptance-criteria mapping

| WORK-018 acceptance criterion | Implementation evidence |
|---|---|
| Routes for core screens | Ten-route typed catalog, unique route tests, and route parser/serializer tests |
| Restore the last safe route | Versioned navigation setting, deterministic startup resolver, corruption/fallback tests, and Chrome/Edge reopen checks |
| Shell without business logic | `AppShell` presentation-only API, pure navigation modules, and no imports from book/rules/session domains |

## Risks and mitigations

- **Persisted route points to missing domain context:** mark contextual routes non-restorable until their repositories and validators exist.
- **Chrome Storage is unavailable:** keep the active route, fall back safely on startup, and explain that restoration was not saved.
- **Hash and storage disagree:** use documented startup precedence and one parser for both sources.
- **Nested landmarks after refactor:** make `AppShell` the only `main` owner and assert it in tests.
- **Premature abstraction:** use a small typed router and no external dependency; revisit only if future navigation requirements exceed this contract.
- **Deferred user research:** do not describe the route model as user-validated; it is an implementation contract derived from the approved IA and UX spec.

## Definition of done

- Every WORK-018 acceptance criterion has code and verification evidence.
- `npm run check` and `git diff --check` pass.
- Chrome and Edge Side Panel close/reopen recovery is manually verified.
- No new extension permission or network dependency is introduced.
- Existing Onboarding and Library behavior and responsive presentation remain intact.
- The Notion task contains the commit, test output, browser evidence, unresolved limitations, and checked acceptance criteria before moving to Done.

## Implementation order

1. Route contract and pure tests.
2. Navigation persistence and startup resolver.
3. AppShell and AppRouter.
4. App integration and screen-root refactor.
5. UI/integration tests.
6. Production build and Chrome/Edge verification.
7. Notion evidence, `STATUS.md`, and `MEMORY.md` update.
