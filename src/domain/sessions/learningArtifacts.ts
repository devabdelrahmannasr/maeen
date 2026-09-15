import type { LearningArtifact } from './sessionRecords';

export const LEARNING_ARTIFACT_TYPES = ['recall', 'explanation', 'question', 'review', 'application'] as const;
export type LearningArtifactType = (typeof LEARNING_ARTIFACT_TYPES)[number];

const MAX_ARTIFACT_LENGTH = 20_000;

export interface LearningArtifactInput {
  readonly id: string;
  readonly sessionId: string;
  readonly type: LearningArtifactType;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly metadata?: LearningArtifact['metadata'];
}

export function validateLearningArtifact(input: LearningArtifactInput): string | null {
  if (!input.id.trim() || !input.sessionId.trim()) return 'missing-identity';
  if (!LEARNING_ARTIFACT_TYPES.includes(input.type)) return 'unsupported-type';
  if (!input.content.trim()) return 'empty-content';
  if (input.content.length > MAX_ARTIFACT_LENGTH) return 'content-too-long';
  if (Number.isNaN(Date.parse(input.createdAt))) return 'invalid-created-at';
  if (input.updatedAt && Number.isNaN(Date.parse(input.updatedAt))) return 'invalid-updated-at';
  return null;
}

export function createLearningArtifact(input: LearningArtifactInput): LearningArtifact {
  const error = validateLearningArtifact(input);
  if (error) throw new Error(`Invalid learning artifact: ${error}`);
  return {
    schemaVersion: 1,
    id: input.id,
    sessionId: input.sessionId,
    type: input.type,
    content: input.content.trim(),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt ?? input.createdAt,
    ...(input.metadata ? { metadata: { ...input.metadata } } : {}),
  };
}

export function updateLearningArtifact(artifact: LearningArtifact, content: string, updatedAt: string): LearningArtifact {
  return createLearningArtifact({ ...artifact, content, updatedAt });
}

export function isGapArtifact(artifact: LearningArtifact): boolean {
  return artifact.metadata?.kind === 'gap';
}

export function isClosedGapArtifact(artifact: LearningArtifact): boolean {
  return isGapArtifact(artifact) && typeof artifact.metadata?.resolvedAt === 'string';
}

export function createGapArtifact(input: Omit<LearningArtifactInput, 'type'>): LearningArtifact {
  return createLearningArtifact({ ...input, type: 'review', metadata: { ...input.metadata, kind: 'gap' } });
}

export function resolveGapArtifact(artifact: LearningArtifact, sourceArtifactId: string, resolvedAt: string): LearningArtifact {
  if (!isGapArtifact(artifact)) throw new Error('Only gap artifacts can be resolved.');
  if (!sourceArtifactId.trim() || Number.isNaN(Date.parse(resolvedAt))) throw new Error('Invalid gap resolution.');
  return updateLearningArtifact({ ...artifact, metadata: { ...artifact.metadata, kind: 'gap', sourceArtifactId, resolvedAt } }, artifact.content, resolvedAt);
}
