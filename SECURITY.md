# Security policy

## Supported versions

The current `0.1.x` line is the supported Internal Alpha line. Older or modified unpacked builds are unsupported; please reproduce issues from a clean checkout where possible.

## Reporting a vulnerability

Use a private [GitHub Security Advisory](https://github.com/devabdelrahmannasr/maeen/security/advisories/new). Do not report vulnerabilities in a public issue, and do not include secrets, personal exports, or PDF samples.

Include a concise impact description, affected version/commit, reproduction steps that use synthetic data, and any suggested mitigation. We will acknowledge a report, triage severity, coordinate a fix and disclosure date, and publish only after maintainer coordination. Do not publicly disclose exploit details before that coordination.

## Severity and response

P0 means active compromise or data exfiltration; P1 means a serious privacy, permission, or integrity bypass; P2 means a contained security defect; P3 means hardening or documentation. P0/P1 reports receive highest-priority investigation and block an alpha or public release until resolved or explicitly accepted by maintainers. Response timing depends on reproducibility and available maintainer capacity; status updates are provided through the private channel.

## Security boundaries

The extension is local-first. It does not read or transmit PDF bytes, text, headers, MIME responses, or fetched URLs; it uses only `sidePanel`, `storage`, and `activeTab`. IndexedDB holds domain records, Chrome Storage holds small preferences, and imports are validated, backed up, migrated, and rolled back locally.
