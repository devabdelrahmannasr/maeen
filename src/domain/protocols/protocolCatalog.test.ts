import { describe, expect, it } from 'vitest';
import {
  PROTOCOL_CATALOG,
  PROTOCOL_CATALOG_VERSION,
  type ProtocolBuildingBlockId,
  type ProtocolId,
} from './protocolCatalog';

const EXPECTED_PROTOCOLS: ReadonlyArray<{
  id: ProtocolId;
  referenceName: string;
  labelAr: string;
  buildingBlocks: readonly ProtocolBuildingBlockId[];
}> = [
  {
    id: 'deep-technical-reading',
    referenceName: 'Deep Technical Reading',
    labelAr: 'قراءة تقنية عميقة',
    buildingBlocks: ['p2r', 'active-recall', 'feynman', 'focus-50-10'],
  },
  {
    id: 'exam-study',
    referenceName: 'Exam Study',
    labelAr: 'مذاكرة للامتحان',
    buildingBlocks: ['sq3r', 'blurting', 'review', 'pomodoro'],
  },
  {
    id: 'practical-application',
    referenceName: 'Practical Application',
    labelAr: 'تطبيق عملي',
    buildingBlocks: ['pareto-80-20', 'structured-notes', 'apply', 'timeboxing'],
  },
  {
    id: 'deadline-reading',
    referenceName: 'Deadline Reading',
    labelAr: 'قراءة بموعد نهائي',
    buildingBlocks: ['reverse-planning', 'pages-per-minute', 'timeboxing'],
  },
  {
    id: 'critical-reading',
    referenceName: 'Critical Reading',
    labelAr: 'قراءة نقدية',
    buildingBlocks: ['questions', 'marginal-notes', 'review'],
  },
  {
    id: 'focus-recovery',
    referenceName: 'Focus Recovery',
    labelAr: 'استعادة التركيز',
    buildingBlocks: ['short-reading-blocks', 'pomodoro', 'distraction-tracking'],
  },
];

describe('protocol catalog contract', () => {
  it('exposes independent version 1', () => {
    expect(PROTOCOL_CATALOG_VERSION).toBe(1);
  });

  it('contains the exact six protocols in canonical order', () => {
    expect(PROTOCOL_CATALOG.map(({ id }) => id)).toEqual(EXPECTED_PROTOCOLS.map(({ id }) => id));
    expect(PROTOCOL_CATALOG.map(({ referenceName }) => referenceName)).toEqual(
      EXPECTED_PROTOCOLS.map(({ referenceName }) => referenceName),
    );
    expect(PROTOCOL_CATALOG.map(({ labelAr }) => labelAr)).toEqual(
      EXPECTED_PROTOCOLS.map(({ labelAr }) => labelAr),
    );
    expect(PROTOCOL_CATALOG.map(({ buildingBlocks }) => [...buildingBlocks])).toEqual(
      EXPECTED_PROTOCOLS.map(({ buildingBlocks }) => [...buildingBlocks]),
    );
    expect(PROTOCOL_CATALOG).toEqual(EXPECTED_PROTOCOLS);
  });

  it('has six unique protocols with no blank identifiers or labels', () => {
    expect(PROTOCOL_CATALOG).toHaveLength(6);
    expect(new Set(PROTOCOL_CATALOG.map(({ id }) => id)).size).toBe(6);

    for (const protocol of PROTOCOL_CATALOG) {
      expect(protocol.id.trim().length).toBeGreaterThan(0);
      expect(protocol.referenceName.trim().length).toBeGreaterThan(0);
      expect(protocol.labelAr.trim().length).toBeGreaterThan(0);
    }
  });

  it('keeps each protocol-local building-block list non-empty and unique', () => {
    for (const protocol of PROTOCOL_CATALOG) {
      expect(protocol.buildingBlocks.length).toBeGreaterThan(0);
      expect(new Set(protocol.buildingBlocks).size).toBe(protocol.buildingBlocks.length);

      for (const buildingBlock of protocol.buildingBlocks) {
        expect(buildingBlock.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('exposes only pure-data fields', () => {
    for (const protocol of PROTOCOL_CATALOG) {
      expect(Object.keys(protocol).sort()).toEqual(['buildingBlocks', 'id', 'labelAr', 'referenceName']);
      expect(typeof protocol.id).toBe('string');
      expect(typeof protocol.referenceName).toBe('string');
      expect(typeof protocol.labelAr).toBe('string');
      expect(Array.isArray(protocol.buildingBlocks)).toBe(true);
    }
  });

  it('serializes deterministically as JSON', () => {
    const firstSerialization = JSON.stringify(PROTOCOL_CATALOG);
    const secondSerialization = JSON.stringify(PROTOCOL_CATALOG);

    expect(secondSerialization).toBe(firstSerialization);
    expect(JSON.parse(firstSerialization)).toEqual(
      EXPECTED_PROTOCOLS.map((protocol) => ({
        ...protocol,
        buildingBlocks: [...protocol.buildingBlocks],
      })),
    );
  });

  it('rejects invalid literal protocol and building-block ids at compile time', () => {
    // @ts-expect-error - unknown protocol id is not part of the catalog union
    const invalidProtocolId: ProtocolId = 'not-a-protocol';
    // @ts-expect-error - unknown building-block id is not part of the catalog union
    const invalidBuildingBlockId: ProtocolBuildingBlockId = 'not-a-building-block';

    expect(invalidProtocolId).toBe('not-a-protocol');
    expect(invalidBuildingBlockId).toBe('not-a-building-block');
  });

  it('rejects catalog mutation at compile time', () => {
    function acceptMutableProtocols(
      _protocols: Array<{
        id: ProtocolId;
        referenceName: string;
        labelAr: string;
        buildingBlocks: readonly ProtocolBuildingBlockId[];
      }>,
    ): void {}

    // @ts-expect-error - protocol catalog is readonly and cannot be assigned to a mutable array
    acceptMutableProtocols(PROTOCOL_CATALOG);

    expect(PROTOCOL_CATALOG).toHaveLength(6);
  });
});
