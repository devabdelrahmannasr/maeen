export const GOAL_CATALOG_VERSION = 1 as const;

export const GOAL_CATALOG = [
  { id: 'deep-understanding', labelAr: 'الفهم العميق' },
  { id: 'exam-study', labelAr: 'المذاكرة لامتحان' },
  { id: 'skill-application', labelAr: 'تعلم مهارة وتطبيقها' },
  { id: 'key-ideas', labelAr: 'استخراج أهم الأفكار' },
  { id: 'deadline-completion', labelAr: 'إنهاء الكتاب قبل موعد' },
  { id: 'efficient-reading', labelAr: 'القراءة بسرعة مع الحفاظ على القيمة' },
  { id: 'focus-improvement', labelAr: 'تحسين التركيز' },
  { id: 'critical-reading', labelAr: 'القراءة النقدية' },
  { id: 'reading-enjoyment', labelAr: 'القراءة للمتعة' },
] as const;

export type GoalId = (typeof GOAL_CATALOG)[number]['id'];

export interface GoalDefinition {
  readonly id: GoalId;
  readonly labelAr: string;
}
