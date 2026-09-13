# WORK-019 — Settings Store and Themes Implementation Plan

Status: Ready for implementation  
Scope: planning only; no runtime code is changed by this document  
Target: one focused implementation session, no later than 2026-09-14

## Sources

- Notion work item: [WORK-019 — نفّذ Settings Store والـthemes](https://app.notion.com/p/3d9805b7d82b81f2badbcdf36d8cf8be)
- Notion implementation plan: [SPEC-011](https://app.notion.com/p/3da805b7d82b8141971afe8822260ff9)
- Approved Product & System Design Spec v1.0: [source](https://app.notion.com/p/3d9805b7d82b8118918af8f6b19ce1a2)
- Approved Technical Architecture — SPEC-006: [source](https://app.notion.com/p/3d9805b7d82b81bf94c7ebea3fa7376d)
- Approved UX Specification — SPEC-004: [source](https://app.notion.com/p/3d9805b7d82b81a591cace7948b53503)
- Local references: `PRODUCT.md`, `DESIGN.md`, `docs/architecture/ARCHITECTURE.md`, `docs/architecture/DATA_MODEL.md`, `docs/design/ACCESSIBILITY.md`, `docs/design/UI_INVENTORY.md`, and `docs/delivery/TEST_STRATEGY.md`
- Visual references: `design/figma/reading-companion-ui.svg`, `design/figma/states-dark-responsive.svg`, and `design/miro-prototype/10-settings.html`

## Outcome

Add a small, versioned `UserSettings` boundary for interface language, theme preference, and default session duration. Settings must persist in Chrome Storage Local, recover after Side Panel or browser restart, apply theme deterministically to the existing UI, and replace missing or corrupt fields with documented safe defaults.

The work establishes settings infrastructure. It does not implement the Settings & Data screen or expose new controls yet.

## Resolved requirements

- Arabic is the only MVP interface language. Persist `ar` as a compatibility field; do not add a language selector or imply that additional interface languages are available.
- The theme preference supports `system`, `light`, and `dark`. The safe default is `system`, matching the approved Figma setting.
- The default session duration is stored in whole minutes. The safe default is 30 minutes, matching the Settings reference.
- Accept duration values from 5 through 180 minutes. This is an implementation validation boundary, not a researched recommendation, and remains easy to revise before a duration control is exposed.
- A setting changes presentation or a future default only. It must not mutate an existing Reading Plan, Protocol Snapshot, Session, or Timer state.

## Current-state evidence

- `onboardingSettings.ts` and `navigationSettings.ts` independently use Chrome Storage Local with a localStorage fallback for preview and tests.
- The app has no unified `UserSettings` model, schema version, parser, normalizer, or update API.
- `global.css` follows `prefers-color-scheme: dark`, but there is no explicit light/dark override.
- `App.tsx` already owns asynchronous startup coordination and an accessible loading state.
- The `settings-data` route exists in the typed catalog but remains disabled because its screen and data-management behavior are later work.
- No runtime network dependency or permission is needed.

## Scope

### Included

- A typed, versioned settings model and immutable safe defaults.
- Field-by-field validation and normalization for stored values.
- Chrome Storage Local persistence with the established localStorage fallback.
- A narrow read and update API that writes one validated settings object.
- System/light/dark theme application through the root document element.
- Startup restoration before the active screen is displayed.
- A non-blocking Arabic recovery message when the storage API is unavailable.
- Unit and UI tests for validation, persistence, restart restoration, theme application, and failures.
- Packaged Chrome and Edge verification at 320, 420, and 600 px.

### Excluded

- Implementing or enabling the Settings & Data route.
- Language selection, translation infrastructure, or non-Arabic UI.
- Font-size controls, reduced-motion overrides, export/import, backup, deletion, or data migration UI.
- Goal-specific time constraints, protocol step durations, session/timer behavior, or changes to existing plans.
- IndexedDB or a general state-management dependency.

## Settings contract

Use one structured value under the versioned key `userSettings.v1`:

```ts
interface UserSettingsV1 {
  schemaVersion: 1;
  interfaceLanguage: 'ar';
  theme: 'system' | 'light' | 'dark';
  defaultSessionDurationMinutes: number;
}
```

Safe defaults:

```ts
{
  schemaVersion: 1,
  interfaceLanguage: 'ar',
  theme: 'system',
  defaultSessionDurationMinutes: 30,
}
```

Validation rules:

1. Missing storage returns a fresh copy of the defaults.
2. Non-object values or unsupported schema versions return all defaults.
3. For schema version 1, normalize each field independently: keep valid values and replace invalid or missing fields with that field's default.
4. Duration must be a finite integer from 5 through 180 inclusive.
5. Ignore unknown properties so forward-added metadata cannot enter runtime state.
6. Never mutate the exported default object or a caller-provided object.
7. Validate the complete merged result before writing it.
8. Corrupt content is a data value and does not throw. A genuine Chrome Storage/localStorage API failure remains distinguishable and may throw to the coordinator.

## Planned file changes

### 1. Add the pure settings model

Create `src/settings/userSettings.ts`.

- Define `UserSettingsV1`, `ThemePreference`, constants, and frozen defaults.
- Implement `normalizeUserSettings(candidate: unknown): UserSettingsV1` without browser or Preact imports.
- Implement a narrow patch merge that accepts only known settings fields and returns a newly validated object.
- Keep language fixed to `ar` for MVP compatibility.

### 2. Add the persistence adapter

Create `src/settings/userSettingsStorage.ts`.

- Read and write `userSettings.v1` through Chrome Storage Local.
- Use localStorage for preview and Vitest, matching the current settings adapters.
- Store the structured versioned object in Chrome Storage and serialized JSON in localStorage.
- Normalize every read before returning it.
- Expose `getUserSettings()` and `updateUserSettings(patch)`; avoid a generic arbitrary-key store.
- Preserve genuine API failures so the app can explain the fallback.

### 3. Add theme application plumbing

Create `src/settings/applyTheme.ts`.

- `light` sets `data-theme="light"` on `document.documentElement`.
- `dark` sets `data-theme="dark"`.
- `system` removes the attribute and lets `prefers-color-scheme` decide.
- Keep the function focused on DOM presentation and independently testable.

Update `src/styles/global.css`.

- Preserve the current tokens and dark palette.
- Apply the dark palette for explicit `data-theme="dark"` and for system preference unless `data-theme="light"` is present.
- Declare the matching `color-scheme` so native controls render consistently.
- Do not redesign existing screens or introduce decorative styling.

### 4. Integrate startup restoration

Update `src/app/App.tsx`.

- Read user settings during the existing loading phase, alongside onboarding/navigation settings.
- Apply the normalized theme before rendering the active route.
- If stored content is corrupt, continue with normalized defaults without an error state.
- If the storage API fails, continue with defaults and announce in Arabic that preferences could not be restored and safe defaults are in use.
- Do not move storage or domain logic into `AppShell` or `AppRouter`.

### 5. Add automated verification

Create `src/settings/userSettings.test.ts`.

- Defaults are stable and returned as fresh values.
- Each valid theme round-trips.
- `ar` is the only accepted interface language.
- Duration bounds 5 and 180 are accepted; fractions, non-finite values, and out-of-range values use 30.
- Invalid individual fields fall back without discarding other valid version-1 fields.
- Non-object and unsupported-version values return all defaults.
- Unknown fields are ignored and input objects are not mutated.

Create `src/settings/userSettingsStorage.test.ts`.

- Missing storage returns defaults.
- Valid settings persist and restore through localStorage.
- Corrupt JSON and invalid stored fields recover safely.
- Updates merge with existing valid settings and store one normalized object.
- Storage read/write failures remain distinguishable.

Create `src/settings/applyTheme.test.ts`.

- Light and dark set the expected root attribute.
- System removes the override.

Extend `src/app/App.test.tsx`.

- Startup restores explicit light and dark preferences.
- Missing/corrupt settings use system/30/ar defaults without a blank state.
- A settings-storage read failure still opens the correct route and announces the safe fallback.
- Existing onboarding, navigation, landmark, and failure tests remain passing.

### 6. Package and browser-check

Run:

```powershell
npm run check
git diff --check
```

Build `dist` and verify in Google Chrome for Testing and Microsoft Edge:

1. Fresh storage uses system theme and opens Onboarding.
2. Seed light settings, reopen the Side Panel, and confirm the light palette and correct route.
3. Seed dark settings, reopen, and confirm the dark palette and correct route.
4. Seed malformed settings and confirm safe defaults, no blank state, and no console error.
5. Confirm settings survive browser close/reopen.
6. Confirm structural RTL, one `main`, visible keyboard focus, and layouts at 320, 420, and 600 px.

Record exact browser versions, commands, test counts, console errors, and automation limitations in `STATUS.md` and WORK-019.

## Acceptance-criteria mapping

| WORK-019 acceptance criterion | Implementation evidence |
|---|---|
| حفظ اللغة والـtheme والوقت | Versioned typed contract, validated update API, and persistence tests for `ar`, theme, and default duration |
| الاستعادة بعد restart | Startup integration, storage round-trip tests, and packaged Chrome/Edge close-reopen checks |
| defaults آمنة للمدخلات الفاسدة | Pure normalizer tests, corrupt-storage tests, safe startup fallback, and Arabic storage-failure status |

## Risks and mitigations

- **Language field implies unsupported localization:** keep the only accepted value `ar`; additional interface languages remain Future Roadmap.
- **Global default changes active domain state:** store only a future default; never rewrite plans, snapshots, sessions, or timers.
- **Explicit light loses to the OS dark preference:** scope the media-query palette so a light root override wins.
- **Corrupt field discards unrelated valid preferences:** normalize version-1 fields independently.
- **Storage unavailable blocks startup:** use defaults, render the route, and expose a non-blocking recovery message.
- **Settings screen scope creep:** keep `settings-data` disabled and add no synthetic settings UI.
- **Duplicated browser-adapter checks:** keep this task narrow; consider shared adapter extraction only if implementation proves repetition harmful.
- **Deferred user research:** describe the defaults as approved/design-derived implementation defaults, not user-validated preferences.

## Definition of ready

- Outcome and settings schema are explicit.
- Acceptance criteria map to automated and packaged-browser evidence.
- Dependency WORK-018 is Done.
- Approved architecture, UX, and visual references are linked.
- Scope fits the existing one-day estimate.
- No unresolved decision blocks implementation.

## Definition of done

- All three WORK-019 acceptance criteria have code and verification evidence.
- `npm run check` and `git diff --check` pass.
- Chrome and Edge restore system/light/dark settings after close/reopen.
- Corrupt settings never blank or crash the Side Panel.
- No new permission, network request, runtime dependency, Settings screen, or non-Arabic UI is introduced.
- Existing onboarding, routing, responsive, RTL, and accessibility behavior remains intact.
- WORK-019 contains the commit, exact test output, browser evidence, unresolved limitations, and checked acceptance criteria before moving to Done.

## Implementation order

1. Pure settings contract and normalization tests.
2. Persistence adapter and failure tests.
3. Theme application and CSS override rules.
4. App startup integration and UI tests.
5. Production build and Chrome/Edge verification.
6. Notion evidence plus `STATUS.md` and `MEMORY.md` update.
