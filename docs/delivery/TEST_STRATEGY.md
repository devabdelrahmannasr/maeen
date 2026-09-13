# Test Strategy

## Unit

Rules decision table, protocol versioning, snapshot immutability, session transitions, timer calculations, progress calculations, validators, and migrations.

## Integration

IndexedDB transactions and upgrades, Chrome settings adapter, browser suspension/recovery, export/import/backup atomicity, and permission behavior.

## UI and accessibility

Ten-screen happy path, keyboard-only operation, RTL focus/order, visible focus, AA contrast, reduced motion, screen-reader status behavior, dark theme, and widths 320/420/600 px.

## Failure cases

Corrupt or oversized imports, unsupported schema, partial transaction failure, duplicate records, browser restart during active/pause/break, storage quota, missing tab metadata, and destructive deletion cancellation.

## Release evidence

Record exact commands, versions, pass/fail counts, browser versions, and unresolved limitations. A visual artifact or code review alone is not runtime verification.

