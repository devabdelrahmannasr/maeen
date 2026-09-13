# Project Memory

Last verified: 2026-09-13, Africa/Cairo.

## Current position

The approved product specification, delivery workspace, flow maps, and the complete visual UI package exist. This repository was assembled as the durable development and handoff workspace. Application implementation has not started, and the UI framework/tooling decision is intentionally still open under research spike `RES-004`.

## Completed assets

- Notion Product HQ: 6 databases, 4 releases, 9 specs, 60 work items, 8 accepted decisions, 8 risks, and 6 planned research studies.
- Miro: product flows, goal-to-protocol map, session state, system/data maps, wireframes, and clickable prototype intent.
- Figma: five organized pages covering start/handoff, foundations/components, ten MVP screens, states/dark/responsive examples, and prototype map.
- Local visual sources are preserved under `design/figma/`.
- A navigable ten-screen HTML reference is preserved under `design/miro-prototype/`.

## Important limitation

The Figma visual package passed the recorded visual and SVG checks. Native Figma variable collections, component sets, and Code Connect were not created because the available Figma Starter MCP quota was exhausted. Do not describe those native library features as complete. See `design/figma/figma-state.json`.

## Product memory

- Name: **مرافق القراءة — Reading Companion**. Repository/project name: **Reading Helper Open Source**.
- Promise: **قل لي لماذا تقرأ، وسأرتب لك كيف تقرأ.**
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

## Current delivery state

- Current release: `REL-001 Design Freeze` — In Progress.
- Following releases: Internal Alpha v0.1, Private Beta v0.2, Public Launch v1.0.
- Research evidence strength is currently `None`; the six studies are planned, not completed.
- Next development action: finish `RES-004` (UI framework/tooling technical spike), record the decision, then scaffold the Manifest V3 extension shell.
- Next recorded weekly review: 2026-09-20. Treat this as historical if working after that date; refresh Notion before relying on it.

## Handoff protocol

At the beginning of a task, read `AGENTS.md`, `PRODUCT.md`, and `STATUS.md`, then refresh the authoritative Notion record if the task depends on live status. At the end, record changed facts, commands/tests run, unresolved risks, and the exact next action in `STATUS.md`; keep this file concise and durable.

