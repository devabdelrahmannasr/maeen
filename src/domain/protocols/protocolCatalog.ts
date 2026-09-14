export const PROTOCOL_CATALOG_VERSION = 1 as const;

export const PROTOCOL_CATALOG = [
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
] as const;

export type ProtocolId = (typeof PROTOCOL_CATALOG)[number]['id'];

export type ProtocolBuildingBlockId = (typeof PROTOCOL_CATALOG)[number]['buildingBlocks'][number];

export interface ProtocolDefinition {
  readonly id: ProtocolId;
  readonly referenceName: string;
  readonly labelAr: string;
  readonly buildingBlocks: readonly ProtocolBuildingBlockId[];
}
