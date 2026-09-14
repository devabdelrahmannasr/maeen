import type { ProtocolId } from './protocolCatalog';

export interface ProtocolStepDefinition {
  readonly id: string;
  readonly protocolId: ProtocolId;
  readonly order: number;
  readonly kind: 'preview' | 'question' | 'read' | 'recall' | 'explain' | 'review' | 'apply' | 'focus' | 'break';
  readonly labelAr: string;
  readonly defaultDurationMinutes: number;
}

const step = (
  protocolId: ProtocolId,
  order: number,
  id: string,
  kind: ProtocolStepDefinition['kind'],
  labelAr: string,
  defaultDurationMinutes: number,
): ProtocolStepDefinition => ({ protocolId, order, id, kind, labelAr, defaultDurationMinutes });

export const PROTOCOL_STEP_CATALOG: readonly ProtocolStepDefinition[] = [
  step('deep-technical-reading', 1, 'preview', 'preview', 'عاين الهدف والبنية', 5),
  step('deep-technical-reading', 2, 'question', 'question', 'اكتب سؤالًا موجّهًا', 5),
  step('deep-technical-reading', 3, 'read', 'read', 'اقرأ بتركيز', 50),
  step('deep-technical-reading', 4, 'recall', 'recall', 'استرجع من الذاكرة', 10),
  step('deep-technical-reading', 5, 'explain', 'explain', 'اشرح الفكرة', 10),
  step('exam-study', 1, 'preview', 'preview', 'استعرض ما ستذاكره', 5),
  step('exam-study', 2, 'question', 'question', 'حوّل العنوان إلى سؤال', 5),
  step('exam-study', 3, 'read', 'read', 'ذاكر بتركيز', 25),
  step('exam-study', 4, 'recall', 'recall', 'اكتب ما تتذكره', 10),
  step('exam-study', 5, 'review', 'review', 'راجع الفجوات', 10),
  step('practical-application', 1, 'preview', 'preview', 'حدّد ما ستطبقه', 5),
  step('practical-application', 2, 'read', 'read', 'اقرأ الجزء الأعلى قيمة', 25),
  step('practical-application', 3, 'apply', 'apply', 'سجّل تطبيقًا واحدًا', 15),
  step('deadline-reading', 1, 'preview', 'preview', 'قسّم القراءة', 5),
  step('deadline-reading', 2, 'read', 'read', 'اقرأ ضمن الحصة', 25),
  step('deadline-reading', 3, 'review', 'review', 'راجع التقدم', 5),
  step('critical-reading', 1, 'question', 'question', 'اكتب أسئلة نقدية', 5),
  step('critical-reading', 2, 'read', 'read', 'اقرأ وابحث عن الدليل', 25),
  step('critical-reading', 3, 'review', 'review', 'راجع الحجة', 10),
  step('focus-recovery', 1, 'preview', 'preview', 'اختصر الحصة', 3),
  step('focus-recovery', 2, 'focus', 'focus', 'ركّز لفترة قصيرة', 15),
  step('focus-recovery', 3, 'break', 'break', 'خذ استراحة واعية', 5),
] as const;

export function stepsForProtocol(protocolId: ProtocolId): readonly ProtocolStepDefinition[] {
  return PROTOCOL_STEP_CATALOG.filter((definition) => definition.protocolId === protocolId);
}
