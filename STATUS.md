# Current Status

Verified on 2026-09-14.

## Done

- Approved Product & System Design Spec and Implementation Plan exist in Notion.
- Product HQ data model and delivery workflow exist in Notion.
- Miro board contains product/system maps and prototype reference.
- Figma visual package covers five pages, ten MVP screens, key states, dark mode, responsive examples, components/foundations documentation, and prototype map.
- Local Figma SVG sources and ten-screen HTML prototype were copied into this repository.
- Project handoff documents and development-ready directory structure were created.
- Local Git repository initialized on `main` after verification.
- `RES-004` concluded with Strong evidence and DEC-009 selected Preact + TypeScript + Vite with Vitest.
- Manifest V3 Side Panel scaffold created with local-only runtime assets and Cairo Variable font.
- Onboarding and Library screens implemented in structural Arabic RTL with local onboarding persistence.
- Responsive browser captures reviewed at 320, 420, and 600 px.
- The production `dist/` extension loaded and completed the onboarding persistence flow in Chrome for Testing 152.0.7977.82 and Microsoft Edge 152.0.4191.66.
- The implemented visual system is recorded in canonical `DESIGN.md` tokens and `.impeccable/design.json`.
- `WORK-013` was rebaselined for AI-assisted delivery: the owner's 7 hours/week are reserved for decisions, review, testing, and acceptance, while estimates remain relative size/risk indicators.
- `SPEC-010` defines the reviewed implementation boundary, route contract, file map, tests, and browser verification plan for `WORK-018`.
- `WORK-018` is Done in Notion with DoD complete and all acceptance criteria checked. A typed ten-route hash catalog, versioned safe-route storage, deterministic startup recovery, shared single-landmark shell, and thin route outlet coordinate Onboarding and Library without adding a dependency or enabling unfinished screens.
- `SPEC-011` defines the implementation boundary, versioned settings contract, safe defaults, theme application, file map, tests, and browser verification plan for `WORK-019`.
- `WORK-019` implemented the versioned `userSettings.v1` contract, Chrome Storage Local adapter, field-level corrupt-input recovery, system/light/dark theme application, and safe startup restoration without enabling the Settings screen or changing domain state.
- `SPEC-012` defines the implementation boundary for `WORK-020`: active-tab title/URL only, `activeTab` as the sole new permission, explicit HTTPS/local-file/unavailable states, no PDF-content or network access, and automated plus packaged Chrome/Edge verification.
- `WORK-020` implements the pure active-document classifier, transient Chrome adapter, explicit action-to-Side-Panel invocation, exact minimum-permission manifest, and safe HTTPS/local-file/restricted/unavailable states without enabling a new route or creating domain records.
- `SPEC-013` defines the exact versioned pure-data boundary for WORK-021: nine stable goal definitions, six protocol families and their ordered building blocks, independent version constants, contract tests, and explicit separation from later rules/snapshot work.
- `WORK-021` implements goal catalog version 1 with nine exact Arabic-interface goals and protocol catalog version 1 with six exact protocol families, stable IDs, Arabic labels, English reference names, and ordered building-block IDs as pure readonly data.

## Ready

- No implementation item is currently Ready.

## In progress

- `REL-001 Design Freeze`.

## Not started

- Remaining eight MVP screens and their domain behavior.
- IndexedDB, rules/protocol, session/timer, backup/import/export, and complete automated coverage.
- Five user-research studies; `WORK-014` through `WORK-016` are explicitly deferred and their evidence remains absent.

## Known limitation

Native Figma variables, component sets, and Code Connect remain pending due to the exhausted Figma Starter MCP quota. The visual design itself is preserved and reviewed.

Edge 152.0.4191.66 continued exposing raw local-file `activeTab` metadata after its file-access setting was disabled. The adapter does not trust that metadata: `isAllowedFileSchemeAccess() === false` is authoritative and produces `metadata-unavailable:file-access-not-granted`.

## Exact next action

Refresh the live Work Items queue and prepare the implementation spec for dependency-cleared P0 `WORK-022` without starting implementation until its DoR is complete.

## Verification log

- 2026-09-13: Figma state JSON parsed and matched file key; passed.
- 2026-09-13: all five local Figma SVG artifacts parsed as XML; passed.
- 2026-09-13: ten HTML prototype screens found and each declared Arabic RTL; passed.
- 2026-09-13: `git diff --check`; passed.
- 2026-09-13: `npm run check`; 4 Vitest tests passed, TypeScript passed, Vite production build passed.
- 2026-09-13: production JS 21.62KB raw / 8.92KB gzip; Cairo font bundled locally.
- 2026-09-13: browser preview console errors 0; onboarding and library visually reviewed at 320/420/600 px.
- 2026-09-13: Impeccable detector returned zero findings for the changed UI targets.
- 2026-09-13: independent Impeccable review resolved RTL numerals, 44px targets, narrow-width labeling, and persistence states; final disposition `ship`.
- 2026-09-13: packaged Manifest V3 extension loaded in Chrome for Testing 152.0.7977.82 and Edge 152.0.4191.66; service worker, structural RTL, Side Panel path, onboarding transition, Chrome Storage persistence, and reload recovery passed in both browsers.
- 2026-09-13: browser-action triggering through ChromeDriver returned DevTools `Method not allowed`; the registered Side Panel document was exercised directly after verifying `chrome.sidePanel.getOptions()` returned an enabled `sidepanel.html` path.
- 2026-09-13: Notion release targets were compressed to a one-month, no-buffer plan: REL-001 2026-09-17, REL-002 2026-09-27, REL-003 2026-10-06, and REL-004 2026-10-13. Public source/package launch is controlled by the project; Chrome and Edge store availability remains dependent on external review.
- 2026-09-13: clarified the product boundary in Notion and local sources: Arabic applies to the user interface, while books/PDFs may be in any language. `DEC-010`, `WORK-014`, and `RES-001` record the correction.
- 2026-09-13: `DEC-011` deferred `WORK-014`, `WORK-015`, and `WORK-016` without evidence. They remain incomplete in Inbox; `WORK-018` became the single Ready implementation item.
- 2026-09-13: created and linked `SPEC-010`, the implementation plan for `WORK-018`. It is In Review and explicitly keeps routing, persistence, shell structure, domain scope, tests, and Chrome/Edge verification separate.
- 2026-09-13: `npm run check`; 4 Vitest files and 38 tests passed, TypeScript passed, and the Vite production build passed. Production JS is 27.28KB raw / 10.48KB gzip; no routing dependency or extension permission was added.
- 2026-09-13: `git diff --check`; passed with only Git's existing LF-to-CRLF working-copy notices.
- 2026-09-13: packaged `dist` verification passed in Google Chrome for Testing 153.0.8010.12 and Microsoft Edge 152.0.4191.66. Both loaded the service worker and registered `sidepanel.html`; first-use onboarding, `#/library` plus `navigation.lastSafeRoute.v1` persistence, browser close/reopen recovery, disabled/contextual hash recovery, refresh, structural RTL, one `main`, and a visible 3px focus outline passed with zero console errors.
- 2026-09-13: Library presentation was visually reviewed in both packaged browsers at 320, 420, and 600 px. The registered Side Panel document was exercised directly because the automation surface does not open browser side-panel chrome through the toolbar action.
- 2026-09-13: updated Notion `WORK-018` with commit `76226fd`, checked all three acceptance criteria, recorded the automated and Chrome/Edge evidence, set `DoD Complete`, and moved the item to `Done`; a confirming live fetch verified the final properties and content.
- 2026-09-13: refreshed the live Work Items queue after WORK-018; no item was Ready or In Progress. Selected dependency-cleared P0 `WORK-019`, created and linked `SPEC-011`, expanded its acceptance criteria into testable settings/restart/corruption behavior, completed DoR, and moved only WORK-019 from Inbox to Ready. Confirming live fetches verified both records.
- 2026-09-13: implemented WORK-019 in commit `0ff9135`. `npm run check` passed 7 Vitest files and 64 tests, TypeScript, and the Vite production build; production JS is 28.60 kB raw / 10.90 kB gzip. `git diff --check` passed with only existing LF-to-CRLF notices.
- 2026-09-13: packaged WORK-019 verification passed in Google Chrome for Testing 153.0.8010.12 and Microsoft Edge 152.0.4191.66. Both restored `system`, `light`, and `dark` after persistent-profile browser close/reopen; corrupt settings recovered without blank/crash; RTL, one `main`, 320/420/600 px no-overflow layouts, 3px focus outline and offset, and zero console errors or warnings passed. The registered Side Panel document was exercised directly because automation cannot open browser side-panel chrome through the toolbar action.
- 2026-09-14: refreshed the live queue and confirmed no Ready/In Progress/In Review work. Selected dependency-cleared P0 `WORK-020`, created and linked `SPEC-012`, and wrote `docs/delivery/WORK-020-ACTIVE-PDF-CONTEXT-PERMISSIONS-PLAN.md`. The plan restricts access to transient active-tab title/URL behind `activeTab`, documents local-file permission states and the URL/MIME limitation, prohibits broad host/content/network access, and maps automated plus packaged Chrome/Edge evidence.
- 2026-09-14: implemented WORK-020 locally. Added the pure `ActiveDocumentContext` classifier, transient Chrome adapter, exact MV3 permission contract (`sidePanel`, `storage`, `activeTab` only), and 19 new browser/manifest tests. `npm run check` passed 10 files and 83 tests, TypeScript, and the Vite production package; `git diff --check` passed with only existing LF-to-CRLF notices.
- 2026-09-14: an initial packaged run verified loading, manifest, RTL, and zero console/network activity but could not invoke the action because the CDP command was attached to the wrong target and omitted the extension ID. Chromium's protocol definition resolved the harness issue; no product evidence relies on that incomplete run.
- 2026-09-14: review found that automatic Side Panel action handling did not grant `activeTab`. Replaced it with an explicit `chrome.action.onClicked` handler that opens the Side Panel for the invoked tab, added a service-worker contract test, and recorded DEC-012.
- 2026-09-14: implementation commit `997b1f8` completed WORK-020. The final packaged matrix passed in Chrome for Testing 153.0.8010.12 and Edge 152.0.4191.66 using isolated profiles and Chromium's guarded CDP action command. Both browsers withheld title/URL before invocation, returned exact `dummy.pdf` metadata from the W3C HTTPS fixture after invocation, revoked it after cross-origin navigation, passed local-file enabled and disabled permission states, safely handled restricted pages, opened the Side Panel, preserved RTL and one main landmark, and produced zero extension console errors and zero extension-originated HTTP(S) requests. Edge exposed raw local metadata while file access was disabled, but the adapter's authoritative permission check returned the required blocked state. Temporary local fixtures and profiles were removed. WORK-020 is Done in Notion with DoD complete and all three acceptance criteria checked; SPEC-012 is Approved.
- 2026-09-14: refreshed the live queue after WORK-020 and selected dependency-free P0 WORK-021. Created and linked SPEC-013 plus `docs/delivery/WORK-021-GOAL-PROTOCOL-CATALOGS-PLAN.md`, reconciled the exact nine goals and six protocol families against the approved product spec, completed DoR, and moved only WORK-021 to Ready. No runtime code changed.
- 2026-09-14: delegated WORK-021 implementation to OpenCode 1.18.23 using `opencode/muse-spark-1.3-contributor-free` with the `high` variant. It wrote the two pure catalog modules and two contract-test files test-first, then left them uncommitted for review. Independent verification repeated `npm run check`: 13 files and 99 tests passed, TypeScript and the Vite production build passed; `git diff --check` passed. No browser matrix was needed because the catalogs are not imported by UI and add no browser behavior, permissions, persistence, or network access.
- 2026-09-14: final review found no blocking WORK-021 defect. Commit `3a0bd06` records the exact version 1 catalogs and 15 focused tests. The acceptance criteria are satisfied: all nine goals and six protocols match the approved order and labels, each catalog has an independent version, and production modules are pure readonly data with no functions or environment dependencies. WORK-021 is Done in Notion with DoD complete; SPEC-013 is Approved.

## Codex app handoff

The current task was renamed **Reading Helper Open Source**. The local Codex integration available during workspace creation could list saved projects and create tasks inside an existing saved project, but it did not expose a command to register a new folder or move the calling task itself. Register `C:\Users\PC\Documents\Reading Helper Open Source` through **Add project** in the Codex sidebar, then continue this named task from that project if the app offers the move action. No separate duplicate task was created.
