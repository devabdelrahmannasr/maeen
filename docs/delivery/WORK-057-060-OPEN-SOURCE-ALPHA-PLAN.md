# WORK-057–060 — Open-Source and Internal Alpha Release Readiness

## Objective

Deliver a documented MIT-licensed repository, contribution/security/privacy policies, deterministic store-draft assets, and a reproducible Go/No-Go decision for `REL-002 Internal Alpha v0.1`.

## Dependency chain

`WORK-057 → WORK-058 → WORK-059 → WORK-060` (one Notion item in `In Progress` at a time).

## Locked boundaries

- Local-first Arabic RTL Chrome/Edge MV3 extension; no backend, accounts, analytics, cloud sync, AI/RAG, custom PDF reader, or public release claim.
- No PDF bytes, text, headers, MIME inspection, URL fetching, or remote identifiers.
- Manifest permissions remain exactly `sidePanel`, `storage`, and `activeTab`.
- Store package is draft/unpublished. Canonical public support/privacy URLs are prerequisites and are not invented.
- WORK-014–016 research remains deferred; it blocks a public-launch claim, not this internal alpha.

## Deliverables and gates

1. WORK-057: `LICENSE`, README, contribution workflow, and operator/release instructions.
2. WORK-058: contribution expansion, `SECURITY.md`, reconciled privacy contracts, and documentation contract tests.
3. WORK-059: manifest icons, Arabic RTL synthetic store screenshots, changelog, store metadata, and asset manifest.
4. WORK-060: pinned Node/npm, CI, `npm run release:verify`, package/evidence hashes, browser evidence, and Go/No-Go record.

Go requires all four evidence sets, passing tests/build/package checks, no open P0/P1 defects, matching privacy/security/runtime contracts, and green packaged Chrome/Edge checks. No-Go applies to failed checks, permission drift, missing assets, unresolved contradictions, missing canonical submission metadata, or unverified public-release claims.
