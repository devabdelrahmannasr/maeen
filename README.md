# Reading Helper Open Source

The complete product, design, architecture, delivery, and future development workspace for **مرافق القراءة — Reading Companion**.

## Repository map

- `PRODUCT.md` — stable product definition and MVP boundary.
- `DESIGN.md` — implementation-facing visual system extracted from Figma.
- `MEMORY.md` — concise continuation context for future agents.
- `STATUS.md` — verified current state and immediate next work.
- `AGENTS.md` — rules for contributors and coding agents.
- `docs/product/` — scope, flows, information architecture, and protocols.
- `docs/design/` — design system, Figma handoff, UI inventory, and accessibility.
- `docs/architecture/` — system boundaries, data model, state machine, privacy, and recovery.
- `docs/delivery/` — implementation, workflow, tests, releases, and source links.
- `design/figma/` — local SVG source artifacts and Figma run state.
- `design/miro-prototype/` — navigable HTML reference for the ten MVP screens.
- `src/`, `tests/`, `scripts/` — reserved development areas pending the tooling decision.

## Getting oriented

Read `AGENTS.md`, `MEMORY.md`, `PRODUCT.md`, and `STATUS.md`. The live Notion workspace remains authoritative for textual execution status; Figma remains authoritative for visual intent.

## Current phase

Design Freeze is in progress. `RES-004` selected Preact + TypeScript + Vite and produced the first Manifest V3 Side Panel slice with onboarding and library screens. Chrome manual loading remains the final browser-specific evidence before the spike can be concluded.

## Local commands

```powershell
npm install
npm run dev
npm run check
```

The unpacked extension build is written to `dist/`. Load that folder from the browser's extensions page with Developer Mode enabled.

No open-source license has been selected yet. Do not publish or accept external contributions until that decision is recorded and a license file is added.
