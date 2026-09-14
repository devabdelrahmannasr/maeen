import { GOAL_CATALOG_VERSION, type GoalId } from '../goals/goalCatalog';
import { PROTOCOL_CATALOG, PROTOCOL_CATALOG_VERSION, type ProtocolId } from './protocolCatalog';
import { RULES_VERSION, type ProtocolDecision } from '../rules/protocolDecision';
import { stepsForProtocol, type ProtocolStepDefinition } from './protocolSteps';

export interface ProtocolSnapshot {
  readonly id: string;
  readonly createdAt: string;
  readonly goalCatalogVersion: typeof GOAL_CATALOG_VERSION;
  readonly protocolCatalogVersion: typeof PROTOCOL_CATALOG_VERSION;
  readonly rulesVersion: typeof RULES_VERSION;
  readonly primaryGoal: GoalId;
  readonly secondaryGoals: readonly GoalId[];
  readonly protocolId: ProtocolId;
  readonly referenceName: string;
  readonly labelAr: string;
  readonly buildingBlocks: readonly string[];
  readonly rationaleAr: string;
  readonly steps: readonly ProtocolStepDefinition[];
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createProtocolSnapshot(
  decision: ProtocolDecision,
  input: { readonly id: string; readonly createdAt: string },
): ProtocolSnapshot {
  if (!input.id || !input.createdAt) {
    throw new Error('Snapshot identity and creation time are required.');
  }

  const protocol = PROTOCOL_CATALOG.find((candidate) => candidate.id === decision.protocolId);
  if (!protocol) {
    throw new Error('Unknown protocol for snapshot.');
  }

  const snapshot: ProtocolSnapshot = {
    id: input.id,
    createdAt: input.createdAt,
    goalCatalogVersion: GOAL_CATALOG_VERSION,
    protocolCatalogVersion: PROTOCOL_CATALOG_VERSION,
    rulesVersion: RULES_VERSION,
    primaryGoal: decision.primaryGoal,
    secondaryGoals: clone(decision.secondaryGoals),
    protocolId: protocol.id,
    referenceName: protocol.referenceName,
    labelAr: protocol.labelAr,
    buildingBlocks: clone(protocol.buildingBlocks),
    rationaleAr: decision.rationaleAr,
    steps: clone(stepsForProtocol(protocol.id)),
  };

  return Object.freeze({
    ...snapshot,
    secondaryGoals: Object.freeze(snapshot.secondaryGoals),
    buildingBlocks: Object.freeze(snapshot.buildingBlocks),
    steps: Object.freeze(snapshot.steps.map((step) => Object.freeze(step))),
  });
}
