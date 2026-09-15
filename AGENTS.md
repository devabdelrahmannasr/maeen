# Agent Operating Guide

This repository is the complete working home for **معين — Maeen**.

## Start here

Before changing anything, read these files in order:

1. `MEMORY.md`
2. `PRODUCT.md`
3. `DESIGN.md`
4. `STATUS.md`
5. `docs/delivery/SOURCE_LINKS.md`
6. The document relevant to the task under `docs/`

Inspect the current branch and dirty worktree before edits. Preserve unrelated work. Do not switch branches, rewrite history, delete files, publish, or create a remote without explicit approval.

## Sources of truth

When sources disagree, use this precedence:

1. Approved Notion Product & System Design Spec and accepted decisions
2. Current Notion work records and workflows
3. Figma for visual UI truth
4. Miro for flows, system maps, and prototype intent
5. This repository's memory and summaries

Record any resolved conflict in `DECISIONS.md` and update the affected document. Do not silently invent missing product requirements or research evidence.

## Product boundaries

- Arabic-first, structurally RTL, accessible browser-extension UI.
- Arabic describes the user's interface language, not the book: the reader may study or read a book/PDF in any language, and the product remains content-language neutral.
- Chrome and Edge Manifest V3 MVP using a side panel beside the browser's existing PDF viewer.
- The extension does not read, upload, parse, annotate, or replace PDF content.
- Core behavior is local-first and must not require a network connection.
- IndexedDB stores product data; Chrome Storage Local stores small preferences.
- The deterministic rules engine produces a versioned, immutable Protocol Snapshot per reading plan.
- No backend, accounts, cloud sync, analytics, monetization, AI/RAG, custom PDF reader, Firefox, mobile, or Acrobat integration in MVP.
- Preserve interruption recovery and user-owned export/import behavior.

## Engineering rules

- Follow existing architecture and conventions once the technical spike selects the stack.
- Keep UI components thin and business rules in focused services/actions.
- Use clear domain names. Avoid vague identifiers and hidden side effects.
- Validate all imported data before mutation: validate, migrate, preview, back up, then commit.
- Treat timer state using absolute timestamps so browser suspension and restarts cannot corrupt elapsed time.
- Add practical automated tests for rules, state transitions, persistence, migrations, recovery, and accessibility-critical behavior.
- Work on one executable item at a time; Notion WIP limit is one item in `In Progress`.
- Run relevant verification and report actual output. Never claim completion based only on code inspection.
- Keep changes narrowly scoped and update `STATUS.md` and `MEMORY.md` at the end of meaningful work.
- Do not use Superpowers skills for this project, per the user's explicit instruction.

## UI rules

- Arabic is the primary interface language and `dir="rtl"` is structural.
- Support keyboard navigation, visible focus, WCAG AA contrast, reduced motion, and non-color status cues.
- Optimize the narrow side-panel layout first, then 320, 420, and 600 px responsive states.
- Use calm, direct copy. During a focus session, expose one clear next action.
- Error and recovery states must explain what happened, what was preserved, and the safe next action.

## Delivery workflow

`Inbox → Ready → In Progress → In Review → Blocked / Done → Released`

Use priorities P0–P3. Keep implementation tasks around one to two days. Do not mark work `Done` until acceptance criteria and verification evidence are recorded.
