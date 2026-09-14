import { GOAL_CATALOG, type GoalId } from '../goals/goalCatalog';
import { PROTOCOL_CATALOG, type ProtocolId } from '../protocols/protocolCatalog';

export const RULES_VERSION = 1 as const;

export type GoalSelectionErrorCode =
  | 'missing-primary'
  | 'unknown-goal'
  | 'too-many-secondary-goals'
  | 'duplicate-secondary-goal'
  | 'primary-as-secondary';

export interface GoalSelectionInput {
  readonly primaryGoal: GoalId | string | null | undefined;
  readonly secondaryGoals?: readonly (GoalId | string)[];
}

export interface GoalSelectionError {
  readonly code: GoalSelectionErrorCode;
  readonly messageAr: string;
}

export interface ProtocolDecision {
  readonly rulesVersion: typeof RULES_VERSION;
  readonly primaryGoal: GoalId;
  readonly secondaryGoals: readonly GoalId[];
  readonly protocolId: ProtocolId;
  readonly rationaleAr: string;
}

export type GoalSelectionResult =
  | { readonly ok: true; readonly decision: ProtocolDecision }
  | { readonly ok: false; readonly error: GoalSelectionError };

const protocolForPrimaryGoal: Readonly<Record<GoalId, ProtocolId>> = {
  'deep-understanding': 'deep-technical-reading',
  'exam-study': 'exam-study',
  'skill-application': 'practical-application',
  'key-ideas': 'deep-technical-reading',
  'deadline-completion': 'deadline-reading',
  'efficient-reading': 'deadline-reading',
  'focus-improvement': 'focus-recovery',
  'critical-reading': 'critical-reading',
  'reading-enjoyment': 'deep-technical-reading',
};

const labelForGoal = new Map(GOAL_CATALOG.map((goal) => [goal.id, goal.labelAr]));
const protocolLabelForId = new Map(PROTOCOL_CATALOG.map((protocol) => [protocol.id, protocol.labelAr]));

function failure(code: GoalSelectionErrorCode): GoalSelectionResult {
  const messages: Record<GoalSelectionErrorCode, string> = {
    'missing-primary': 'اختر هدفًا رئيسيًا واحدًا للقراءة.',
    'unknown-goal': 'يوجد هدف غير معروف. اختر من الأهداف المتاحة.',
    'too-many-secondary-goals': 'يمكنك إضافة هدفين ثانويين كحد أقصى.',
    'duplicate-secondary-goal': 'لا يمكن تكرار الهدف الثانوي.',
    'primary-as-secondary': 'الهدف الرئيسي لا يُضاف مرة أخرى كهدف ثانوي.',
  };

  return { ok: false, error: { code, messageAr: messages[code] } };
}

function isGoalId(value: string): value is GoalId {
  return labelForGoal.has(value as GoalId);
}

export function decideProtocol(input: GoalSelectionInput): GoalSelectionResult {
  const secondaryGoals = [...(input.secondaryGoals ?? [])];

  if (typeof input.primaryGoal !== 'string' || input.primaryGoal.length === 0) {
    return failure('missing-primary');
  }

  if (!isGoalId(input.primaryGoal) || secondaryGoals.some((goal) => typeof goal !== 'string' || !isGoalId(goal))) {
    return failure('unknown-goal');
  }

  if (secondaryGoals.length > 2) {
    return failure('too-many-secondary-goals');
  }

  if (new Set(secondaryGoals).size !== secondaryGoals.length) {
    return failure('duplicate-secondary-goal');
  }

  if (secondaryGoals.includes(input.primaryGoal)) {
    return failure('primary-as-secondary');
  }

  const validSecondaryGoals = secondaryGoals as GoalId[];
  const protocolId = protocolForPrimaryGoal[input.primaryGoal];
  const protocolLabel = protocolLabelForId.get(protocolId) ?? protocolId;
  const primaryLabel = labelForGoal.get(input.primaryGoal) ?? input.primaryGoal;
  const secondaryText = secondaryGoals.length > 0
    ? ` الأهداف الثانوية محفوظة للتخصيص دون تغيير الأولوية: ${validSecondaryGoals.map((goal) => labelForGoal.get(goal)).join('، ')}.`
    : '';

  return {
    ok: true,
    decision: {
      rulesVersion: RULES_VERSION,
      primaryGoal: input.primaryGoal,
      secondaryGoals: validSecondaryGoals,
      protocolId,
      rationaleAr: `الهدف الرئيسي «${primaryLabel}» يقود الاختيار إلى «${protocolLabel}».${secondaryText}`,
    },
  };
}

export function protocolForGoal(goal: GoalId): ProtocolId {
  return protocolForPrimaryGoal[goal];
}
