# WORK-020 — Active PDF Context and Permissions Implementation Plan

Status: Done on 2026-09-14
Scope: implemented and verified
Target: one focused implementation session, no later than 2026-09-16

## Sources

- Notion work item: [WORK-020 — Detect PDF context and permission states](https://app.notion.com/p/3d9805b7d82b81cab371e7a9e81f0cc1)
- Notion implementation plan: [SPEC-012](https://app.notion.com/p/3db805b7d82b81c3a14bc0df9278fedf)
- Approved Product & System Design Spec v1.0: [source](https://app.notion.com/p/3d9805b7d82b8118918af8f6b19ce1a2)
- Approved Technical Architecture — SPEC-006: [source](https://app.notion.com/p/3d9805b7d82b81bf94c7ebea3fa7376d)
- Official Chrome documentation: [activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab), [tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs), [permission declarations](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions), and [file-scheme access](https://developer.chrome.com/docs/extensions/reference/api/extension#method-isAllowedFileSchemeAccess)
- Local references: `PRODUCT.md`, `DESIGN.md`, `docs/architecture/ARCHITECTURE.md`, `docs/architecture/PRIVACY_SECURITY.md`, and `docs/delivery/TEST_STRATEGY.md`

## Outcome

Add a small Browser Adapter that reads only the active tab's `title` and `url` after the user explicitly invokes the extension. It classifies HTTPS, local-file, restricted, and unavailable states without reading PDF content, making a network request, or tracking browsing activity.

This work establishes a transient context and permission boundary. It does not create a Book or Reading Plan, persist browsing metadata, or enable a new screen.

## Resolved requirements

- Add only the `activeTab` permission. Do not add `tabs`, `host_permissions`, `optional_host_permissions`, `content_scripts`, `scripting`, or `webRequest`.
- `activeTab` exposes the invoked tab's sensitive `title` and `url` temporarily after an explicit user gesture. Access expires when the tab navigates to another origin or closes.
- Local-file access remains controlled by the browser's **Allow access to file URLs** setting. Read its state with `chrome.extension.isAllowedFileSchemeAccess()` and never bypass it.
- A title and URL cannot prove a document's MIME type. HTTPS and file URLs are document-reference candidates; the extension must not claim that it inspected or verified PDF content.
- Context remains in memory for the current read. WORK-020 must not store the title or URL in Chrome Storage, IndexedDB, logs, analytics, or telemetry.
- The toolbar action is handled by `chrome.action.onClicked`, which opens the Side Panel for the invoked tab. Automatic `openPanelOnActionClick` is disabled because packaged verification showed that path did not grant `activeTab` metadata.

## Current-state evidence (planning baseline)

- At plan creation, `public/manifest.json` declared only `sidePanel` and `storage`.
- At plan creation, `public/service-worker.js` configured the action to open the registered Side Panel.
- At plan creation, no Browser/PDF Context Adapter existed under `src/`.
- Only Onboarding and Library were enabled; contextual routes remained disabled.
- The plan baseline suite contained 64 Vitest tests across seven files, with TypeScript and Vite production-build checks.

## Scope

### Included

- Add `activeTab` to required API permissions.
- Pure URL/title normalization and context classification.
- A thin Chrome adapter for querying the active tab and reading file-scheme permission state.
- Explicit states for HTTPS, local-file allowed or blocked, missing metadata, unsupported schemes, and no active tab.
- Unit tests using injected browser-port fakes.
- A manifest permission allowlist test.
- Packaged Google Chrome for Testing and Microsoft Edge permission verification.
- Documentation of the exact permission and user-controlled local-file setting.

### Excluded

- Reading, parsing, rendering, uploading, hashing, indexing, annotating, or transmitting PDF bytes or text.
- Fetching the tab URL, issuing `HEAD` or `GET`, reading response headers, or MIME sniffing.
- `tabs` permission, host match patterns, content scripts, script injection, network interception, or browsing-history access.
- Persistent storage of an active tab's title or URL.
- Continuous `tabs.onUpdated` or `tabs.onActivated` monitoring.
- Enabling New Book or another screen, or creating Book/Plan domain records.
- Firefox, mobile, Acrobat, a custom PDF viewer, or incognito support.

## Context contract

```ts
type ActiveDocumentContext =
  | {
      status: 'available';
      source: 'https' | 'local-file';
      title: string;
      url: string;
      pdfConfidence: 'url-hint' | 'unknown';
      fileAccess: 'allowed' | 'not-applicable';
    }
  | {
      status: 'metadata-unavailable' | 'unsupported-scheme' | 'no-active-tab';
      fileAccess: 'allowed' | 'not-allowed' | 'unknown';
      reason: string;
    };
```

Contract rules:

1. Available context contains only normalized `title`, canonical `url`, and coarse state metadata.
2. A missing title receives a calm local fallback; it never triggers page inspection.
3. Only `https:` and `file:` can return `available`. `http:`, `chrome:`, `edge:`, `about:`, `data:`, `blob:`, `devtools:`, and extension pages are non-available in the MVP.
4. A `.pdf` pathname may produce `pdfConfidence: 'url-hint'`; every other eligible URL remains `unknown`. This is not MIME verification.
5. Missing sensitive properties after permission loss return `metadata-unavailable`; stale context is never fabricated or reused.
6. Navigation or active-tab changes require a fresh explicit read. No background browsing listeners are added.

## Planned file changes

### 1. Add the pure context model

Create `src/browser/activeDocumentContext.ts`.

- Define the discriminated union and stable reason codes.
- Parse and canonicalize URL values without fetching them.
- Normalize the title and provide a local fallback for an empty title.
- Apply the scheme allowlist and optional `.pdf` URL hint.
- Keep the module free of Chrome and Preact imports.

### 2. Add the browser adapter

Create `src/browser/chromeActiveDocumentContext.ts`.

- Inject narrow ports for `tabs.query({ active: true, lastFocusedWindow: true })` and `extension.isAllowedFileSchemeAccess()`.
- Query one active tab only when the caller asks for context.
- Pass only `title` and `url` into the pure classifier.
- Convert missing metadata and rejected APIs into explicit safe states.
- Do not cache, persist, log, transmit, or continuously observe the result.

### 3. Enforce the manifest and invocation boundary

Update `public/manifest.json`.

- Add `activeTab` to `permissions`.
- Preserve `sidePanel` and `storage`.
- Add no `tabs`, host patterns, optional hosts, content scripts, `scripting`, or network permissions.
- Handle the explicit toolbar action with `chrome.action.onClicked` and open the registered Side Panel using the supplied tab ID.
- Add no tab activation or navigation listeners.

### 4. Add automated verification

Create `src/browser/activeDocumentContext.test.ts`.

- HTTPS and local-file success.
- `.pdf` URL hint and unknown confidence.
- Empty-title fallback.
- Unsupported and malformed URLs.
- No input mutation.

Create `src/browser/chromeActiveDocumentContext.test.ts`.

- Exact active-tab query shape.
- Only the first active tab is considered.
- File access allowed and blocked.
- Missing sensitive metadata.
- Rejected browser APIs.
- No persistence or network port exists in the adapter contract.

Add or extend a manifest contract test under `src/browser/`.

- The exact permission allowlist is `sidePanel`, `storage`, and `activeTab`.
- `host_permissions`, `optional_host_permissions`, and `content_scripts` are absent.

Run the existing suite unchanged to protect onboarding, navigation, settings, RTL, and accessibility behavior.

### 5. Package and browser-check

Run:

```powershell
npm run check
git diff --check
```

Build `dist` and verify in Google Chrome for Testing and Microsoft Edge using isolated persistent profiles:

1. Confirm the packaged manifest contains only `sidePanel`, `storage`, and `activeTab` permissions and no site-wide host access.
2. Invoke the extension action on a controlled HTTPS PDF fixture; confirm the exact title and URL become available after the gesture.
3. Navigate to another origin without reinvoking; confirm the previous metadata is not reused.
4. Open a local PDF with **Allow access to file URLs** disabled; confirm a non-crashing unavailable/permission state and no stale metadata.
5. Enable file access, reinvoke on the same local PDF, and confirm the exact local title and URL.
6. Open a restricted browser page and confirm a safe unsupported/unavailable result.
7. Confirm zero extension network requests, zero PDF-content reads, zero console errors, and unchanged onboarding/routing behavior.

Record exact browser versions, commands, fixture URLs and paths, permission prompts, pass/fail counts, and automation limitations.

## Acceptance-criteria mapping

| WORK-020 acceptance criterion | Implementation evidence |
|---|---|
| Read title and URL only | Typed contract exposes only title/URL; unit tests cover normalization and failures; packaged action invocation returns exact metadata. |
| HTTPS and local-file permission states | Unit state matrix plus Chrome/Edge packaged checks with file access disabled and enabled. |
| No broad host permissions | Manifest allowlist test and packaged permission review prove `activeTab` only, with no `tabs` or host match patterns. |

## Risks and mitigations

- **Side Panel action timing differs by browser:** verify the real action-click flow in both packaged browsers before DoD.
- **Title and URL do not prove PDF MIME:** expose candidate/confidence state and never claim content verification.
- **Disabled file access may hide the URL entirely:** return metadata-unavailable with the global file-access state; do not guess the scheme.
- **The Side Panel remains open after navigation:** perform fresh on-demand reads and never reuse previous tab metadata.
- **The `tabs` permission appears simpler:** prohibit it because it grants sensitive metadata across all tabs.
- **Toolbar automation can grant sensitive access:** use Chromium's guarded `Extensions.triggerAction` CDP command only in isolated packaged-test profiles with the required unsafe-debugging flag.

## Completion evidence

- Implementation commit: `997b1f8`.
- `npm run check` passed 11 Vitest files and 84 tests, TypeScript, and the Vite production build.
- `git diff --check` passed.
- Chrome for Testing 153.0.8010.12 and Microsoft Edge 152.0.4191.66 loaded the packaged extension in isolated profiles.
- On `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`, neither browser exposed title/URL before invocation; both exposed exactly `dummy.pdf` and the fixture URL after the action.
- Cross-origin navigation to `https://example.com/work-020-navigation` removed the transient metadata without reinvocation in both browsers.
- Temporary local `work-020-local.pdf` fixtures exposed exact title/URL with file access enabled. After the browser setting was disabled, `isAllowedFileSchemeAccess()` returned `false`; the adapter therefore returns `metadata-unavailable:file-access-not-granted`. Edge still exposed raw `activeTab` metadata in this state, confirming why the explicit permission check is authoritative.
- Restricted pages returned either unavailable metadata (Chrome) or an `edge:` URL that the classifier rejects as `unsupported-scheme`.
- The action opened the packaged Side Panel; structural RTL and one main landmark remained intact. Observed extension console errors and extension-originated HTTP(S) requests were both zero.
- The verifier read browser-provided title/URL properties only. It did not fetch the tab URL, inspect responses or headers, access PDF bytes/text, persist metadata, or transmit it.

## Definition of ready

- Context contract and permission-state matrix are explicit.
- `activeTab` is the only approved new permission.
- WORK-019 is Done.
- Automated and packaged evidence map to every acceptance criterion.
- Scope fits the existing two-day estimate.
- The URL/MIME limitation is documented and does not block implementation.

## Definition of done

- All WORK-020 acceptance criteria have implementation and verification evidence.
- `npm run check` and `git diff --check` pass.
- Chrome and Edge pass HTTPS, local-file disabled/enabled, permission-loss, and restricted-page cases.
- The manifest has no `tabs`, host permissions, content scripts, `scripting`, or network permissions.
- No PDF content or headers are read, no URL is fetched, and title/URL are not persisted or transmitted.
- Existing onboarding, routing, settings, RTL, accessibility, and responsive behavior remains intact.
- WORK-020 records the commit, exact test output, browser evidence, and unresolved limitations before moving to Done.

## Implementation order

1. Pure context model and tests.
2. Chrome adapter and failure-state tests.
3. Exact manifest permission test and `activeTab` addition.
4. Full automated verification.
5. Packaged Chrome/Edge permission matrix.
6. Notion evidence plus local `STATUS.md` and `MEMORY.md` update.
