# Draft store listing — Internal Alpha 0.1.0

Submission state: draft/unpublished only. The repository and policy URLs are configured; final marketplace publication remains outside this release.

- **Name:** Maeen — Reading Helper
- **Short description:** Local reading sessions beside a PDF viewer, without reading PDF content.
- **Long description:** Maeen helps readers organize a session, build a protocol, record focus, and review progress locally. The interface is Arabic RTL, while the reader chooses the book language. It works beside a PDF viewer and never reads or uploads PDF content.
- **Category:** Productivity
- **Permission rationale:** `sidePanel` displays the companion panel; `storage` keeps small preferences; `activeTab` reads the active tab title and URL only after explicit invocation. No host permissions are requested.
- **Privacy disclosure:** Data stays in local IndexedDB and Chrome Storage. No accounts, telemetry, analytics, URL fetching, or remote identifiers; PDF content and response metadata are never inspected.
- **Supported browsers:** Chrome 114+ and Microsoft Edge with Manifest V3 support.
- **Screenshot set:** Pending owner-provided PNG assets. No screenshot files are currently included in the draft package; add and verify the final set before submission.
- **Support URL:** https://github.com/devabdelrahmannasr/maeen/issues
- **Privacy URL:** https://github.com/devabdelrahmannasr/maeen/blob/main/docs/architecture/PRIVACY_SECURITY.md
- **Security reporting:** Use the private advisory channel described in [`SECURITY.md`](https://github.com/devabdelrahmannasr/maeen/blob/main/SECURITY.md).

This draft must not claim capabilities outside the documented MVP, public availability, or research validation.
