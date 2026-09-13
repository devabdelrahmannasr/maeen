# Session State Machine

## States and transitions

- `Draft → Ready → Active`
- `Active ↔ Paused`
- `Active ↔ Break`
- `Active → Recall → Review → Completed`
- `Draft → Abandoned`
- `Active → Abandoned`

Interruption is recoverable from the latest safe persisted state; it is not a completion state. Only `Completed` sessions contribute to completion metrics. `Abandoned` sessions retain saved notes and artifacts.

Every transition must be explicit, validated, persisted transactionally, and covered by tests. Invalid transitions return a clear domain error and do not mutate state.

