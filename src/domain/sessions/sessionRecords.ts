export interface SessionStep {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly sessionId: string;
  readonly stepId: string;
  readonly order: number;
  readonly status: 'pending' | 'active' | 'completed';
  readonly updatedAt: string;
}

export interface LearningArtifact {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly sessionId: string;
  readonly type: 'recall' | 'explanation' | 'question' | 'review' | 'application';
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata?: Readonly<{
    readonly kind?: 'note' | 'question' | 'gap' | 'evidence';
    readonly resolvedAt?: string;
    readonly sourceArtifactId?: string;
    readonly pageStart?: number;
    readonly pageEnd?: number;
  }>;
}

export interface DistractionEvent {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly sessionId: string;
  readonly stepId: string;
  readonly occurredAt: string;
  /** IndexedDB-friendly alias retained for consumers that call this a timestamp. */
  readonly timestamp: string;
  readonly category?: string;
  readonly note?: string;
}
