import type { DistractionEvent } from './sessionRecords';

const MAX_NOTE_LENGTH = 500;

export interface DistractionEventInput {
  readonly id: string;
  readonly sessionId: string;
  readonly stepId: string;
  readonly occurredAt: string;
  readonly category?: string;
  readonly note?: string;
}

export function createDistractionEvent(input: DistractionEventInput): DistractionEvent {
  if (!input.id.trim() || !input.sessionId.trim() || !input.stepId.trim()) throw new Error('Invalid distraction event identity.');
  if (Number.isNaN(Date.parse(input.occurredAt))) throw new Error('Invalid distraction event timestamp.');
  if ((input.note?.length ?? 0) > MAX_NOTE_LENGTH) throw new Error('Distraction note is too long.');
  return { schemaVersion: 1, id: input.id, sessionId: input.sessionId, stepId: input.stepId, occurredAt: input.occurredAt, timestamp: input.occurredAt, ...(input.category?.trim() ? { category: input.category.trim() } : {}), ...(input.note?.trim() ? { note: input.note.trim() } : {}) };
}
