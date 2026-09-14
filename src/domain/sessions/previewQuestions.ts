export interface PreviewQuestionState {
  readonly checklist: readonly string[];
  readonly questions: readonly string[];
}

export function createPreviewQuestionState(stepLabels: readonly string[], questions: readonly string[] = []): PreviewQuestionState {
  return { checklist: [...stepLabels].slice(0, 3), questions: questions.map((question) => question.trim()).filter(Boolean) };
}

export function addQuestion(state: PreviewQuestionState, question: string): PreviewQuestionState {
  const normalized = question.trim();
  if (!normalized) throw new Error('اكتب سؤالًا قبل الحفظ.');
  return { ...state, questions: [...state.questions, normalized] };
}
