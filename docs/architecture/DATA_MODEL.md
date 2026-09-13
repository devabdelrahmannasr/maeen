# Local Data Model

## Core records

- `Book`: id, title, author, total pages, optional non-content PDF reference metadata, lifecycle timestamps.
- `ReadingPlan`: id, book id, primary/secondary goals, constraints, active protocol snapshot id, status.
- `ProtocolSnapshot`: id, protocol/rules version, selection reasons, ordered step definitions, created timestamp; immutable.
- `Session`: id, plan id, status, page range, absolute timing fields, interruption/recovery metadata, completion/abandonment timestamps.
- `SessionStep`: session id, step key, status, timing, order, saved input.
- `LearningArtifact`: session id, type (recall, explanation, question, review, application), content, timestamps.
- `DistractionEvent`: session id, timestamp, optional category/note.
- `Setting`: small preference key/value stored separately in Chrome Storage Local.
- `BackupMetadata`: schema version, created timestamp, record counts, checksum/validation result where appropriate.

Identifiers, timestamps, schema versions, and migrations must be explicit. Import must be atomic and must never partially replace the active database.

