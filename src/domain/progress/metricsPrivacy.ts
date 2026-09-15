export const METRICS_PRIVACY_CONTRACT = Object.freeze({
  storage: 'IndexedDB only',
  network: 'none',
  identifiers: 'local record IDs only',
  documentContent: 'never accessed',
  sourceVersion: 1,
} as const);

export const METRICS_PRIVACY_NOTICE_AR = 'مؤشرات التقدم تُحسب من سجلاتك المحلية فقط. لا تُرسل معرفات أو محتوى أو بيانات إلى خارج جهازك.';
