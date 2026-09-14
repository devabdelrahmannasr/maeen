import { describe, expect, it } from 'vitest';
import { addQuestion, createPreviewQuestionState } from './previewQuestions';

describe('preview questions', () => {
  it('keeps a short ordered checklist and validates questions', () => {
    const state = createPreviewQuestionState(['one', 'two', 'three', 'four']);
    expect(state.checklist).toEqual(['one', 'two', 'three']);
    expect(addQuestion(state, '  Why? ').questions).toEqual(['Why?']);
    expect(() => addQuestion(state, ' ')).toThrow();
  });
});
