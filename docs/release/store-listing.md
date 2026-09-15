# Draft store listing — Internal Alpha 0.1.0

Submission state: draft/unpublished only. The repository and policy URLs are configured; final marketplace publication remains outside this release.

- **Name:** معين — Maeen
- **Short description:** جلسات قراءة عربية محلية بجانب قارئ PDF، بدون قراءة محتوى الملف.
- **Long description:** معين يساعدك على تنظيم جلسة قراءة، بناء بروتوكول، تسجيل التركيز، ومراجعة التقدم محليًا. الواجهة عربية RTL، بينما لغة الكتاب يحددها القارئ. يعمل بجانب عارض PDF ولا يقرأ أو يرفع محتوى PDF.
- **Category:** Productivity
- **Permission rationale:** `sidePanel` displays the companion panel; `storage` keeps small preferences; `activeTab` reads the active tab title and URL only after explicit invocation. No host permissions are requested.
- **Privacy disclosure:** Data stays in local IndexedDB and Chrome Storage. No accounts, telemetry, analytics, URL fetching, or remote identifiers; PDF content and response metadata are never inspected.
- **Supported browsers:** Chrome 114+ and Microsoft Edge with Manifest V3 support.
- **Screenshot set:** Arabic RTL onboarding, Library, New Book, Protocol, Focus, Summary, Progress, Settings/import, and recovery states at documented 320/420/600px widths (synthetic data only).
- **Support URL:** https://github.com/devabdelrahmannasr/maeen/issues
- **Privacy URL:** https://github.com/devabdelrahmannasr/maeen/blob/main/docs/architecture/PRIVACY_SECURITY.md
- **Security reporting:** Use the private advisory channel described in [`SECURITY.md`](https://github.com/devabdelrahmannasr/maeen/blob/main/SECURITY.md).

This draft must not claim capabilities outside the documented MVP, public availability, or research validation.
