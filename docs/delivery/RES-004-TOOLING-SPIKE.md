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
- Chrome for Testing is the automation-safe Chrome distribution for reproducible extension checks; branded Chrome 152 no longer accepts automated unpacked-extension side-loading through the legacy command-line flags.

## Outcome

`RES-004` concluded with strong evidence. DEC-009 selects Preact + TypeScript + Vite, with Vitest for unit/component coverage and browser-level verification for packaged extension behavior.

## Browser verification

The production `dist/` bundle was loaded as an unpacked extension in both supported browser engines on 2026-09-13:

| Check | Chrome for Testing 152.0.7977.82 | Microsoft Edge 152.0.4191.66 |
|---|---:|---:|
| Manifest V3 service worker loaded | Passed | Passed |
| `side_panel.default_path` resolved to `sidepanel.html` | Passed | Passed |
| Arabic root direction was `rtl` | Passed | Passed |
| Onboarding rendered and advanced to Library | Passed | Passed |
| `onboardingComplete` persisted in `chrome.storage.local` | Passed | Passed |
| Library restored after page reload | Passed | Passed |

The browser action command itself is blocked by ChromeDriver's DevTools allowlist (`Method not allowed`), so the harness verified the packaged Side Panel document directly after confirming the registered Side Panel path and active service worker. This is a harness boundary, not an extension runtime error.

The reusable harness is `scripts/verify-extension.mjs`; it accepts `chrome` or `edge`, the browser executable, and its matching WebDriver executable. Supporting evidence is generated under ignored `output/` as JSON and PNG captures. The repeatable source verification remains `npm run check`; the browser matrix used matching ChromeDriver/EdgeDriver 152 builds against the production package.
