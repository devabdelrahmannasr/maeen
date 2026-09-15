# Contributing

Maeen is an open-source, local-first Chrome and Edge Manifest V3 extension. Contributions are welcome when they preserve the product and privacy boundaries in `PRODUCT.md`, `DESIGN.md`, and `AGENTS.md`.

## Development workflow

The stack is Preact, TypeScript, Vite, and Vitest. Use Node 24.19.0 and npm 11.17.0 (see `.nvmrc`), then run:

```text
npm ci
npm run test
npm run build
npm run check
```

Work on one Notion item at a time. Keep the item in `In Progress` only while it is actively being implemented, and attach test/evidence links before moving it to `Done`.

## Contribution expectations

- Explain the user problem, scope, and acceptance evidence in an issue or pull request.
- Keep changes focused and include regression tests for domain, persistence, migration, recovery, permissions, or UI behavior that changed.
- Preserve Arabic-first structural RTL (`dir="rtl"`), keyboard navigation, visible focus, WCAG AA contrast, reduced-motion support, and narrow side-panel responsiveness.
- Keep user data local. Do not add PDF bytes/text/headers/MIME inspection, URL fetching, telemetry, analytics, accounts, remote identifiers, or broad host permissions.
- Validate imported data before mutation and preserve backup/rollback/recovery behavior.
- Do not request secrets, private exports, or PDF samples in public issues. Use `SECURITY.md` for vulnerabilities.

## Review checklist

Reviewers verify the acceptance criteria, tests, `npm run check`, `git diff --check`, privacy/permission contracts, RTL and accessibility behavior, and the absence of unrelated files or generated artifacts. Release work also requires `npm run release:verify` and the evidence described in `STATUS.md`.

Changes that add a backend, cloud sync, AI/RAG, PDF parsing or a custom reader, new runtime permissions, analytics, public store claims, or a new product route require an approved product decision before implementation.

## Operator and release notes

For a clean checkout, use `npm ci` with the pinned Node/npm versions, run `npm run check`, and load the generated `dist/` directory as an unpacked extension in Chrome or Edge. Use a browser binary with its matching WebDriver, and record versions, fixture paths, screenshots, console/network evidence, and package hashes in `STATUS.md`. Release artifacts and manifests are written under the ignored `output/release/` directory. The toolbar action cannot be invoked reliably through the current WebDriver harness; invoke it manually when that limitation applies.

Do not publish, push a remote, or create a release without explicit approval.
