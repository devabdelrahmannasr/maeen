# Changelog

## 0.1.0 — Internal Alpha

This is a draft, unpublished internal-alpha package for `REL-002 Internal Alpha v0.1`.

- Arabic-first RTL onboarding, library, New Book, protocol, focus, summary, progress, settings, import/export, and local recovery flows.
- Local IndexedDB domain records with Chrome Storage preferences; validated import, backup, migration, rollback, and phase-only recovery marker.
- Active-tab title/URL reference context only; no PDF bytes, text, headers, MIME inspection, URL fetching, accounts, telemetry, analytics, or cloud sync.
- Chrome and Edge Manifest V3 packaging with only `sidePanel`, `storage`, and `activeTab` permissions.
- Known limitation: the current WebDriver harness cannot reliably invoke the browser toolbar action; manual invocation is required for that evidence.

Compatibility: Chrome for Testing and Microsoft Edge with matching WebDriver binaries. Public store publication, canonical support URLs, and research validation remain out of scope.
