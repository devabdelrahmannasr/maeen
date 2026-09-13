# Project Memory

Last verified: 2026-09-13, Africa/Cairo.

## Current position

The approved product specification, delivery workspace, flow maps, and visual UI package exist. Application implementation has started. `RES-004` concluded with Strong evidence and selected Preact + TypeScript + Vite with Vitest. The Manifest V3 Side Panel now implements onboarding, the local-library reference state, and the typed WORK-018 navigation boundary with safe Library restoration.

## Completed assets

- Notion Product HQ: 6 databases, 4 releases, 10 specs, 60 work items, 11 accepted decisions, 8 risks, and 6 research studies.
- Miro: product flows, goal-to-protocol map, session state, system/data maps, wireframes, and clickable prototype intent.
- Figma: five organized pages covering start/handoff, foundations/components, ten MVP screens, states/dark/responsive examples, and prototype map.
- Local visual sources are preserved under `design/figma/`.
- A navigable ten-screen HTML reference is preserved under `design/miro-prototype/`.
- The extension scaffold, bundled Cairo font, Chrome Storage settings adapters, onboarding screen, library screen, typed route catalog, safe startup resolver, shared shell, and tests exist under `src/` and `public/`.

## Important limitation

The Figma visual package passed the recorded visual and SVG checks. Native Figma variable collections, component sets, and Code Connect were not created because the available Figma Starter MCP quota was exhausted. Do not describe those native library features as complete. See `design/figma/figma-state.json`.

## Product memory

- Name: **مرافق القراءة — Reading Companion**. Repository/project name: **Reading Helper Open Source**.
- Promise: **قل لي لماذا تقرأ، وسأرتب لك كيف تقرأ.**
- Arabic is the user's interface language, not a restriction on book content. The target user may read, study, or learn from a book/PDF in any language; the product remains content-language neutral and does not inspect the document.
- Core loop: Preview → Question → Read → Recall → Explain → Review → Apply.
- One primary goal plus at most two secondary goals creates a versioned Protocol Snapshot.
- Browser side panel; no custom reader and no PDF-content access.
- Local-first persistence: IndexedDB plus Chrome Storage Local.
- Export JSON and Markdown. Import is validated, migrated, previewed, backed up, then committed.
- The session model supports pause, break, interruption recovery, completion, and abandonment with notes preserved.

## Accepted decisions

1. Goal-first guided product.
2. Chrome/Edge first.
3. Side Panel; no custom PDF reader.
4. No AI, backend, accounts, or cloud in MVP.
5. IndexedDB plus Chrome Storage Local.
6. Deterministic, versioned rules engine.
7. Protocol Snapshot per reading plan.
8. Unified Work Items database.
9. Arabic-interface users may read books or PDFs in any language; content language is not a product constraint.
10. User interviews and usability studies are deferred; implementation continues under explicitly unvalidated assumptions.

## Current delivery state

- Current release: `REL-001 Design Freeze` — In Progress.
- Following releases: Internal Alpha v0.1, Private Beta v0.2, Public Launch v1.0.
- Public Launch has a hard maximum target of 2026-10-13. The owner's 7 hours per week across seven days are reserved for decisions, review, testing, and acceptance; AI-assisted execution is not converted into one human calendar week per `Estimate Day`.
- `Estimate Days` remain relative size and risk indicators. The compressed no-buffer targets are REL-001 2026-09-17, REL-002 2026-09-27, REL-003 2026-10-06, and REL-004 2026-10-13.
- The controllable launch commitment is a public open-source release, installable package, and complete release documentation by 2026-10-13. Chrome Web Store and Microsoft Edge Add-ons availability depends on external review, so submission must happen before the final launch gate.
- `RES-004` is Concluded with Strong technical evidence in Notion; the other five planned research studies remain at `None`.
- The production package completed the same browser verification matrix in Chrome for Testing 152.0.7977.82 and Edge 152.0.4191.66: service worker, RTL, registered Side Panel path, onboarding-to-library transition, Chrome Storage persistence, and reload recovery all passed. Branded Chrome's legacy command-line side-loading is unavailable, so use Chrome for Testing for repeatable automated extension checks.
- The first UI slice passed the Impeccable detector with no findings and an independent finish review with final disposition `ship`; storage failure and pending-save states are implemented and visually evidenced.
- `WORK-014`, `WORK-015`, and `WORK-016` are deferred in Inbox under `DEC-011`; no user interviews or usability evidence exist. `WORK-018` is locally implemented and verified; its Notion work record still needs the commit and verification evidence before its workflow status is changed.
- `SPEC-010` is the implementation plan for `WORK-018`. Its ten-route typed hash contract adds no dependency, Library remains the only restorable post-onboarding route, 38 automated tests pass, and packaged recovery checks pass in Google Chrome for Testing 153.0.8010.12 and Edge 152.0.4191.66.
- Next recorded weekly review: 2026-09-20. Treat this as historical if working after that date; refresh Notion before relying on it.

## Handoff protocol

At the beginning of a task, read `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, and `STATUS.md`, then refresh the authoritative Notion record if the task depends on live status. At the end, record changed facts, commands/tests run, unresolved risks, and the exact next action in `STATUS.md`; keep this file concise and durable.
