# Architecture Boundary

The implementation stack is undecided, but the domain boundaries are stable.

## Proposed modules

- UI Shell: Side Panel routing, layout, localization, theme, and accessibility plumbing.
- Book Catalog: local book metadata and lifecycle.
- Goal Catalog: goal and constraint definitions.
- Rules Engine: pure deterministic goal-to-protocol decision logic.
- Protocol Catalog: versioned protocol definitions.
- Planning: creates reading plans and immutable snapshots.
- Session Engine: state transitions and recoverable progression.
- Timer Engine: absolute timestamps, pause/break calculations, suspension recovery.
- Local Repository: IndexedDB transactions, schema, migrations, and queries.
- Settings Store: small Chrome Storage Local preferences.
- Backup Engine: JSON/Markdown export and guarded import.
- Browser Adapter: Manifest V3, Side Panel, tab metadata, and permissions without PDF content access.

Keep browser APIs and storage adapters outside pure domain logic so rules and session behavior can be tested without a browser.

