import { beforeEach, describe, expect, it } from 'vitest';
import {
  beginImportJournal,
  clearImportJournal,
  markImportCommitting,
  markImportRollbackRequired,
  readImportJournal,
} from './importJournal';

describe('import journal', () => {
  beforeEach(() => clearImportJournal());

  it('records transient import phases without domain metadata', () => {
    beginImportJournal('2026-09-15T00:00:00.000Z');
    expect(readImportJournal()).toEqual({ version: 1, phase: 'prepared', startedAt: '2026-09-15T00:00:00.000Z' });
    markImportCommitting();
    expect(readImportJournal()?.phase).toBe('committing');
    markImportRollbackRequired();
    expect(readImportJournal()?.phase).toBe('rollback-required');
    clearImportJournal();
    expect(readImportJournal()).toBeNull();
  });

  it('ignores malformed journal values', () => {
    localStorage.setItem('reading-helper.import-journal.v1', '{bad');
    expect(readImportJournal()).toBeNull();
  });
});
