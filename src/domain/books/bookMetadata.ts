export interface BookMetadataInput {
  readonly title: string;
  readonly author?: string;
  readonly totalPages: number;
  readonly referenceUrl?: string;
}

export interface BookMetadata {
  readonly title: string;
  readonly author?: string;
  readonly totalPages: number;
  readonly referenceUrl?: string;
}

export type MetadataValidationResult = {
  readonly ok: true;
  readonly metadata: BookMetadata;
} | { readonly ok: false; readonly errors: readonly string[] };

function normalizeText(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim().replace(/\s+/gu, ' ');
  return normalized || undefined;
}

export function validateBookMetadata(input: BookMetadataInput): MetadataValidationResult {
  const title = normalizeText(input.title);
  const author = normalizeText(input.author);
  const errors: string[] = [];
  if (!title) errors.push('title-required');
  if (title && (title.length > 200 || /[\u0000-\u001f\u007f]/u.test(title))) errors.push('title-invalid');
  if (author && (author.length > 160 || /[\u0000-\u001f\u007f]/u.test(author))) errors.push('author-invalid');
  if (!Number.isInteger(input.totalPages) || input.totalPages < 1 || input.totalPages > 1_000_000) errors.push('total-pages-invalid');
  if (input.referenceUrl !== undefined) {
    try { const parsed = new URL(input.referenceUrl); if (!['http:', 'https:', 'file:'].includes(parsed.protocol)) errors.push('reference-url-invalid'); }
    catch { errors.push('reference-url-invalid'); }
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, metadata: { title: title as string, ...(author ? { author } : {}), totalPages: input.totalPages, ...(input.referenceUrl ? { referenceUrl: input.referenceUrl } : {}) } };
}
