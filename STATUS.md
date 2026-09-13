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

## In progress

- `REL-001 Design Freeze`.

## Not started

- Remaining eight MVP screens and their domain behavior.
- IndexedDB, rules/protocol, session/timer, backup/import/export, and complete automated coverage.
- Five user-research studies; their evidence strength remains `None`.

## Known limitation

Native Figma variables, component sets, and Code Connect remain pending due to the exhausted Figma Starter MCP quota. The visual design itself is preserved and reviewed.

## Exact next action

Start `WORK-014`: identify five Arabic readers, schedule the interviews, and capture evidence for keep / revise / remove decisions. It is the single `Ready` item.

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

## Codex app handoff

The current task was renamed **Reading Helper Open Source**. The local Codex integration available during workspace creation could list saved projects and create tasks inside an existing saved project, but it did not expose a command to register a new folder or move the calling task itself. Register `C:\Users\PC\Documents\Reading Helper Open Source` through **Add project** in the Codex sidebar, then continue this named task from that project if the app offers the move action. No separate duplicate task was created.
