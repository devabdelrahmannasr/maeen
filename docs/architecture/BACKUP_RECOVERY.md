# Backup and Recovery

## Session recovery

Persist the latest safe state and absolute timestamps around meaningful transitions. On wake/reopen, calculate elapsed time from timestamps, show what was restored, and ask the reader to continue or abandon when ambiguity exists.

## Export

- JSON: complete, versioned, machine-restorable product data.
- Markdown: human-readable books, progress, and learning artifacts; not necessarily round-trippable.

## Import

1. Parse without modifying live data.
2. Validate schema, supported version, size, and record relationships.
3. Apply migrations in an isolated representation.
4. Show a preview of additions, updates, conflicts, and removals.
5. Create a recoverable backup of current data.
6. Commit atomically.
7. Verify counts and report the outcome.

Failure at any step leaves the live database unchanged.

