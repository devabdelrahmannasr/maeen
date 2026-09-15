import type { Session } from './session';
import type { DistractionEvent, LearningArtifact } from './sessionRecords';
import { isClosedGapArtifact, isGapArtifact } from './learningArtifacts';

export interface SessionSummary {
  readonly sessionId: string;
  readonly status: Session['status'];
  readonly recall: readonly LearningArtifact[];
  readonly review: readonly LearningArtifact[];
  readonly applications: readonly LearningArtifact[];
  readonly questions: readonly LearningArtifact[];
  readonly notes: readonly LearningArtifact[];
  readonly openGaps: readonly LearningArtifact[];
  readonly closedGaps: readonly LearningArtifact[];
  readonly distractionCount: number;
}

export function buildSessionSummary(session: Session, artifacts: readonly LearningArtifact[], distractions: readonly DistractionEvent[] = []): SessionSummary {
  const forSession = artifacts.filter((artifact) => artifact.sessionId === session.id);
  const gaps = forSession.filter(isGapArtifact);
  return {
    sessionId: session.id,
    status: session.status,
    recall: forSession.filter((artifact) => artifact.type === 'recall'),
    review: forSession.filter((artifact) => artifact.type === 'review'),
    applications: forSession.filter((artifact) => artifact.type === 'application'),
    questions: forSession.filter((artifact) => artifact.type === 'question'),
    notes: forSession.filter((artifact) => artifact.type === 'explanation' && artifact.metadata?.kind === 'note'),
    openGaps: gaps.filter((artifact) => !isClosedGapArtifact(artifact)),
    closedGaps: gaps.filter(isClosedGapArtifact),
    distractionCount: distractions.filter((event) => event.sessionId === session.id).length,
  };
}
