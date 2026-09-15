# Privacy and Security

- Core usage works offline and requires no account.
- Never read, upload, index, or transmit PDF contents.
- Request the minimum browser permissions and explain why each is needed.
- The MV3 manifest requests exactly `sidePanel`, `storage`, and `activeTab`; it has no `tabs`, host permissions, content scripts, `scripting`, or `webRequest` access.
- Treat imported files as untrusted input; enforce schema, size, type, and migration checks.
- Encode rendered user text and avoid unsafe HTML injection.
- Keep destructive deletion behind explicit scope explanation and confirmation.
- Avoid analytics, remote fonts, remote scripts, or hidden network calls in MVP.
- Exports may contain personal notes; warn the user before saving or sharing them.
- Import recovery records only a local phase/timestamp marker; it never stores book titles, PDF metadata, content, URLs, or remote responses.
- Use Content Security Policy compatible with Manifest V3 and no dynamic code execution.
- Security and privacy review is required before public launch.
# Metrics privacy

Progress metrics are deterministic projections over local IndexedDB records only. They use local record identifiers, never PDF bytes/text/headers or fetched URL responses, and make no network, analytics, account, or remote-identifier calls. The UI names the source and version of each metric; page count remains secondary to completion, recall, gaps, and applications.
