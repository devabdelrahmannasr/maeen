# RES-004 — UI Framework and Extension Tooling Spike

Date: 2026-09-13.

## Question

Which stack preserves Manifest V3 compatibility, TypeScript safety, a small bundle, RTL/accessibility quality, and maintainability across ten stateful screens?

## Compared options

| Option | Bundle/complexity | Stateful UI | Testability | Maintenance fit | Result |
|---|---|---|---|---|---|
| Vanilla TypeScript | Smallest runtime, more hand-written DOM/state plumbing | Weakest as flows grow | Good for pure domain logic, costly for UI | Risks duplicated rendering and event code | Declined |
| Lit | Small runtime and strong web-component model | Good | Good | Custom-element boundaries add ceremony without a reuse requirement outside this extension | Competitive |
| React | Mature ecosystem and straightforward hiring | Excellent | Excellent | More runtime than this local Side Panel needs | Declined |
| Preact | Small runtime with component/hooks ergonomics | Excellent | Excellent | Fits ten screens without carrying full React cost | Selected |

## Selected stack

- Preact 10 with TypeScript.
- Vite for development and production builds.
- Static Manifest V3 and service worker copied from `public/`.
- Vitest + Testing Library for component and adapter tests.
- Cairo Variable font bundled locally.
- Browser APIs behind adapters; domain logic has no Preact dependency.

## Evidence and constraints

- Chrome's official Side Panel API requires Manifest V3, the `sidePanel` permission, and a local `side_panel.default_path`; it is available from Chrome 114.
- Manifest V3 requires extension runtime code to be bundled locally.
- Preact's official guide recommends Vite and includes TypeScript support.
- The prototype build, tests, and Chrome/Edge loading evidence must be recorded before the Notion research item is moved to Concluded.

## Outcome

The architecture decision is accepted locally as DEC-009 so implementation can begin. The research item remains operationally incomplete until the built extension is loaded in current Chrome and Edge and the evidence is synchronized back to Notion.
