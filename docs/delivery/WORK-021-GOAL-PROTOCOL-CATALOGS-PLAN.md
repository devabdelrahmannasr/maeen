# WORK-021 — Versioned Goal and Protocol Catalogs Implementation Plan

Status: Ready on 2026-09-14
Scope: planning only; no runtime code is changed by this document
Target: one focused implementation session, no later than 2026-09-16

## Sources

- Notion work item: [WORK-021 — عرّف Goal وProtocol catalogs بإصدارات ثابتة](https://app.notion.com/p/3d9805b7d82b8195b9e3fd2782a063d8)
- Notion implementation spec: [SPEC-013](https://app.notion.com/p/3db805b7d82b81a1b402dc19c6f68084)
- [Approved Product & System Design Spec v1.0](https://app.notion.com/p/3d9805b7d82b8118918af8f6b19ce1a2)
- [Goal & Protocol Engine epic](https://app.notion.com/p/3d9805b7d82b8103a78aed2f188f4075)
- [Miro Goal → Protocol Decision Map](https://miro.com/app/board/uXjVHnuKCW4=/?moveToWidget=3458764683529583865)
- Local references: `PRODUCT.md`, `docs/product/PROTOCOLS.md`, `docs/architecture/ARCHITECTURE.md`, `docs/architecture/DATA_MODEL.md`, and `docs/delivery/TEST_STRATEGY.md`

## Outcome

Create small, versioned, framework-independent Goal and Protocol catalogs that exactly encode the nine approved goals and six approved protocol families. These constants become stable inputs for later conflict resolution, selection, and snapshot work without implementing those behaviors early.

## Catalog contract

```ts
export const GOAL_CATALOG_VERSION = 1 as const;
export const PROTOCOL_CATALOG_VERSION = 1 as const;

interface GoalDefinition {
  readonly id: GoalId;
  readonly labelAr: string;
}

interface ProtocolDefinition {
  readonly id: ProtocolId;
  readonly referenceName: string;
  readonly labelAr: string;
  readonly buildingBlocks: readonly ProtocolBuildingBlockId[];
}
```

- Derive literal ID unions from readonly catalog constants instead of maintaining duplicate unions.
- Catalog order is canonical and deterministic.
- Versions are independent positive integers. Increment the affected version only when catalog meaning or shape changes.
- IDs are durable domain keys. Arabic labels and English protocol reference names are display/source text, never identity.
- Definitions contain JSON-serializable primitives and readonly arrays only. They must not depend on the browser, UI framework, storage, network, random values, locale state, or the clock.

## Canonical goals

| Stable ID | Arabic label |
|---|---|
| `deep-understanding` | الفهم العميق |
| `exam-study` | المذاكرة لامتحان |
| `skill-application` | تعلم مهارة وتطبيقها |
| `key-ideas` | استخراج أهم الأفكار |
| `deadline-completion` | إنهاء الكتاب قبل موعد |
| `efficient-reading` | القراءة بسرعة مع الحفاظ على القيمة |
| `focus-improvement` | تحسين التركيز |
| `critical-reading` | القراءة النقدية |
| `reading-enjoyment` | القراءة للمتعة |

## Canonical protocols

| Stable ID | Reference name | Arabic label | Ordered building blocks |
|---|---|---|---|
| `deep-technical-reading` | Deep Technical Reading | قراءة تقنية عميقة | `p2r`, `active-recall`, `feynman`, `focus-50-10` |
| `exam-study` | Exam Study | مذاكرة للامتحان | `sq3r`, `blurting`, `review`, `pomodoro` |
| `practical-application` | Practical Application | تطبيق عملي | `pareto-80-20`, `structured-notes`, `apply`, `timeboxing` |
| `deadline-reading` | Deadline Reading | قراءة بموعد نهائي | `reverse-planning`, `pages-per-minute`, `timeboxing` |
| `critical-reading` | Critical Reading | قراءة نقدية | `questions`, `marginal-notes`, `review` |
| `focus-recovery` | Focus Recovery | استعادة التركيز | `short-reading-blocks`, `pomodoro`, `distraction-tracking` |

The building-block order mirrors the approved source. These identifiers describe composition only; they are not executable session-step definitions or duration rules.

## Scope

### Included

- Exact nine-goal catalog from the approved product specification.
- Exact six-protocol catalog and building blocks from the approved specification and local protocol summary.
- An explicit independent version constant for each catalog.
- Stable TypeScript IDs, Arabic interface labels, English protocol reference names, and stable building-block IDs.
- Pure domain modules with no framework or environment dependency.
- Contract tests for exact contents, canonical order, uniqueness, versions, readonly typing, and deterministic JSON serialization.

### Excluded

- Goal-combination and conflict rules; `WORK-022` owns them.
- Protocol selection, scores, fallbacks, or explanation copy.
- Deadline, pages-per-minute, time-budget, or duration calculations.
- Protocol Snapshot creation or immutability; `WORK-023` owns it.
- The complete rules/time matrix; `WORK-024` owns it.
- UI routes, screens, state, persistence, migrations, browser APIs, PDF context, analytics, or network access.
- User-validation claims; deferred research remains incomplete.

## Planned files

- Add `src/domain/goals/goalCatalog.ts`.
- Add `src/domain/goals/goalCatalog.test.ts`.
- Add `src/domain/protocols/protocolCatalog.ts`.
- Add `src/domain/protocols/protocolCatalog.test.ts`.
- Update `STATUS.md`, `MEMORY.md`, and WORK-021 evidence after implementation.

## Tests and verification

- Assert `GOAL_CATALOG_VERSION === 1` and `PROTOCOL_CATALOG_VERSION === 1`.
- Assert the exact ordered goal IDs and exact Arabic labels.
- Assert the exact ordered protocol IDs, reference names, Arabic labels, and building-block IDs.
- Assert nine unique goals and six unique protocols with no blank identifiers or labels.
- Assert protocol-local building-block IDs are non-empty and unique.
- Assert deterministic JSON serialization without functions or environment-dependent fields.
- Add compile-time assertions that reject mutation and invalid literal IDs.
- Run `npm run check` and `git diff --check`.

No packaged browser matrix is needed for the catalogs themselves because they are pure domain data and add no browser behavior, permission, persistence, or UI. The existing production build remains the integration boundary.

## Acceptance-criteria mapping

| WORK-021 acceptance criterion | Implementation evidence |
|---|---|
| Define all nine goals and six protocols | Exact ordered catalog assertions against the approved names and building blocks |
| Explicit version for each catalog | Independent version constants and tests for both catalogs |
| Pure-data definitions | Framework/browser/storage-free modules, readonly contracts, deterministic serialization tests, and source review |

## Risks and mitigations

- **IDs become persistence contracts:** use explicit semantic kebab-case IDs and never derive identity from translated labels.
- **WORK-022 logic leaks into catalogs:** prohibit priorities, conflict tables, scores, and selection functions.
- **Building blocks are confused with executable steps:** keep them descriptive; session step definitions belong to snapshot/session work.
- **Future updates rewrite history:** catalog updates apply to new plans; historical Protocol Snapshots remain unchanged.
- **Arabic labels drift:** exact tests lock the approved taxonomy while stable IDs remain language-independent.

## Definition of ready

- The nine goals and six protocol families are explicit.
- Versioning, identity, labels, building blocks, file ownership, tests, and exclusions are resolved.
- WORK-021 has no dependency and remains a two-day task.
- No unresolved product or technical decision blocks implementation.

## Definition of done

- Both catalogs match the approved lists and expose explicit version 1.
- Catalog tests, the existing regression suite, TypeScript, and the production build pass.
- No rules engine, snapshot, persistence, UI, browser, PDF-content, or network scope is added.
- The implementation commit and exact verification output are recorded in WORK-021 and local status documents.

## Implementation order

1. Goal catalog and contract tests.
2. Protocol building-block IDs, protocol catalog, and contract tests.
3. Full regression and production build.
4. Documentation and Notion completion evidence.
