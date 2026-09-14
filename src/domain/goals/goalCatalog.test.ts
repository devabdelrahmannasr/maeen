import { describe, expect, it } from 'vitest';
import {
  GOAL_CATALOG,
  GOAL_CATALOG_VERSION,
  type GoalId,
} from './goalCatalog';

const EXPECTED_GOALS: ReadonlyArray<{ id: GoalId; labelAr: string }> = [
  { id: 'deep-understanding', labelAr: 'الفهم العميق' },
  { id: 'exam-study', labelAr: 'المذاكرة لامتحان' },
  { id: 'skill-application', labelAr: 'تعلم مهارة وتطبيقها' },
  { id: 'key-ideas', labelAr: 'استخراج أهم الأفكار' },
  { id: 'deadline-completion', labelAr: 'إنهاء الكتاب قبل موعد' },
  { id: 'efficient-reading', labelAr: 'القراءة بسرعة مع الحفاظ على القيمة' },
  { id: 'focus-improvement', labelAr: 'تحسين التركيز' },
  { id: 'critical-reading', labelAr: 'القراءة النقدية' },
  { id: 'reading-enjoyment', labelAr: 'القراءة للمتعة' },
];

describe('goal catalog contract', () => {
  it('exposes independent version 1', () => {
    expect(GOAL_CATALOG_VERSION).toBe(1);
  });

  it('contains the exact nine goals in canonical order', () => {
    expect(GOAL_CATALOG.map(({ id }) => id)).toEqual(EXPECTED_GOALS.map(({ id }) => id));
    expect(GOAL_CATALOG.map(({ labelAr }) => labelAr)).toEqual(EXPECTED_GOALS.map(({ labelAr }) => labelAr));
    expect(GOAL_CATALOG).toEqual(EXPECTED_GOALS);
  });

  it('has nine unique goals with no blank identifiers or labels', () => {
    expect(GOAL_CATALOG).toHaveLength(9);
    expect(new Set(GOAL_CATALOG.map(({ id }) => id)).size).toBe(9);

    for (const goal of GOAL_CATALOG) {
      expect(goal.id.trim().length).toBeGreaterThan(0);
      expect(goal.labelAr.trim().length).toBeGreaterThan(0);
    }
  });

  it('exposes only pure-data fields', () => {
    for (const goal of GOAL_CATALOG) {
      expect(Object.keys(goal).sort()).toEqual(['id', 'labelAr']);
      expect(typeof goal.id).toBe('string');
      expect(typeof goal.labelAr).toBe('string');
    }
  });

  it('serializes deterministically as JSON', () => {
    const firstSerialization = JSON.stringify(GOAL_CATALOG);
    const secondSerialization = JSON.stringify(GOAL_CATALOG);

    expect(secondSerialization).toBe(firstSerialization);
    expect(JSON.parse(firstSerialization)).toEqual(EXPECTED_GOALS);
  });

  it('rejects invalid literal goal ids at compile time', () => {
    // @ts-expect-error - unknown goal id is not part of the catalog union
    const invalidGoalId: GoalId = 'not-a-goal';

    expect(invalidGoalId).toBe('not-a-goal');
  });

  it('rejects catalog mutation at compile time', () => {
    function acceptMutableGoals(_goals: Array<{ id: GoalId; labelAr: string }>): void {}

    // @ts-expect-error - goal catalog is readonly and cannot be assigned to a mutable array
    acceptMutableGoals(GOAL_CATALOG);

    expect(GOAL_CATALOG).toHaveLength(9);
  });
});
