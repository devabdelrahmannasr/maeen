# Current Status

Verified on 2026-09-13.

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
- `WORK-018` is implemented locally: a typed ten-route hash catalog, versioned safe-route storage, deterministic startup recovery, shared single-landmark shell, and thin route outlet now coordinate Onboarding and Library without adding a dependency or enabling unfinished screens.

## In progress

- `REL-001 Design Freeze`.

## Not started

- Remaining eight MVP screens and their domain behavior.
- IndexedDB, rules/protocol, session/timer, backup/import/export, and complete automated coverage.
- Five user-research studies; `WORK-014` through `WORK-016` are explicitly deferred and their evidence remains absent.

## Known limitation

Native Figma variables, component sets, and Code Connect remain pending due to the exhausted Figma Starter MCP quota. The visual design itself is preserved and reviewed.

## Exact next action

Add the local commit and recorded verification evidence to Notion `WORK-018`, check its acceptance criteria, and move it through review to `Done`. This external record update remains pending confirmation for the representational Notion edit.

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

## Codex app handoff

The current task was renamed **Reading Helper Open Source**. The local Codex integration available during workspace creation could list saved projects and create tasks inside an existing saved project, but it did not expose a command to register a new folder or move the calling task itself. Register `C:\Users\PC\Documents\Reading Helper Open Source` through **Add project** in the Codex sidebar, then continue this named task from that project if the app offers the move action. No separate duplicate task was created.
