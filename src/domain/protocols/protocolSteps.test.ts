import { describe, expect, it } from 'vitest';
import { PROTOCOL_CATALOG } from './protocolCatalog';
import { stepsForProtocol } from './protocolSteps';

describe('protocol steps', () => {
  it('provides stable ordered executable steps for every protocol', () => {
    for (const protocol of PROTOCOL_CATALOG) {
      const steps = stepsForProtocol(protocol.id);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps.map((step) => step.order)).toEqual(steps.map((_, index) => index + 1));
      expect(steps.map((step) => step.id)).toEqual([...new Set(steps.map((step) => step.id))]);
    }
  });
});
