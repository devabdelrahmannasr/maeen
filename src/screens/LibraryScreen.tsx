import { useEffect, useRef, useState } from 'preact/hooks';
import { BookPlus, Settings } from 'lucide-preact';
import { queryLibrary, type LibraryBookRow } from '../domain/books/libraryQuery';
import { createBookRepository, createReadingPlanRepository, createSessionRepository } from '../storage/indexedDb/domainRepositories';
import { findRecoveryCandidate, recoverInterruptedSession, abandonInterruptedSession, type RecoveryCandidate } from '../storage/recovery';
import { serializeRoute } from '../navigation/routes';
import { downloadExportFile, exportProductData, serializeMarkdownExport, serializeProductExport } from '../storage/indexedDb/dataExport';
import { importProductData, parseImportText, type ImportPreview } from '../storage/indexedDb/dataImport';

export function LibraryScreen() {
  const [rows, setRows] = useState<readonly LibraryBookRow[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [recovery, setRecovery] = useState<RecoveryCandidate | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const importTriggerRef = useRef<HTMLButtonElement>(null);
  const importPreviewRef = useRef<HTMLElement>(null);
  useEffect(() => { if (importPreview) importPreviewRef.current?.focus(); else importTriggerRef.current?.focus(); }, [importPreview]);
  useEffect(() => { const sessionRepository = createSessionRepository(); void Promise.all([queryLibrary(createBookRepository(), { plans: createReadingPlanRepository(), sessions: sessionRepository }), sessionRepository.list()]).then(([result, sessions]) => { setRows(result); setRecovery(sessions.map(findRecoveryCandidate).find((candidate): candidate is RecoveryCandidate => candidate !== null) ?? null); setStatus('ready'); }).catch(() => setStatus('failed')); }, []);
  const active = rows.filter((row) => !row.archived);
  const archived = rows.filter((row) => row.archived);
  async function exportData(format: 'json' | 'markdown') {
    try {
      const envelope = await exportProductData();
      const content = format === 'json' ? serializeProductExport(envelope) : serializeMarkdownExport(envelope);
      downloadExportFile(content, format === 'json' ? 'maeen-backup.json' : 'maeen-backup.md', format === 'json' ? 'application/json' : 'text/markdown');
      setExportStatus('تم تجهيز النسخة الاحتياطية محليًا.');
    } catch {
      setExportStatus('تعذر التصدير؛ لم تتغير البيانات المحلية.');
    }
  }
  async function inspectImport(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    setImportStatus(null);
    try { setImportPreview(parseImportText(await file.text())); } catch { setImportPreview(parseImportText('')); }
  }
  async function commitImport() {
    if (!importPreview?.ok || !importPreview.envelope) return;
    try {
      const result = await importProductData(importPreview.envelope);
      setImportStatus(`تم الاستيراد بأمان: ${Object.values(result.importedCounts).reduce((sum, count) => sum + count, 0)} سجل.`);
      setImportPreview(null);
      window.location.reload();
    } catch {
      setImportStatus('تعذر الاستيراد؛ بقيت بياناتك السابقة دون تغيير.');
    }
  }
  return <div class="screen-root library-screen"><header class="app-bar app-bar--roomy"><div><h1 class="page-title">مكتبتي</h1><p class="supporting-text">مراجعك محفوظة على هذا الجهاز فقط</p></div><button class="icon-button" type="button" aria-label="فتح الإعدادات"><Settings size={20} /></button></header>
    {status === 'failed' ? <p class="save-error" role="alert">تعذر فتح المكتبة المحلية. بياناتك لم تُحذف؛ أعد المحاولة بعد التحقق من مساحة التخزين.</p> : null}
    {recovery ? <aside class="recovery-banner" aria-label="جلسة محفوظة تحتاج استكمالًا"><div><strong>جلسة متوقفة بأمان</strong><span>{recovery.messageAr}</span></div><div class="flow-actions"><button type="button" class="text-action" onClick={async () => { await recoverInterruptedSession(recovery, createSessionRepository(), new Date().toISOString()); window.location.hash = `#/sessions/${encodeURIComponent(recovery.session.id)}/focus`; }}>استكمل</button><button type="button" class="text-action" onClick={async () => { await abandonInterruptedSession(recovery, createSessionRepository(), new Date().toISOString()); setRecovery(null); }}>اتركها محفوظة</button></div></aside> : null}
    <section aria-labelledby="active-books-title"><div class="section-heading"><h2 id="active-books-title">الكتب النشطة</h2><span class="demo-label">{status === 'loading' ? 'جارٍ التحميل…' : `${active.length} كتب`}</span></div>{status === 'ready' && active.length === 0 ? <p class="supporting-text">لم تضف كتابًا بعد. ابدأ بمرجع واحد.</p> : <ol class="book-list">{active.map((row) => <li class="book-row" key={row.book.id}><div class="book-cover" aria-hidden="true"><span>كتاب</span></div><div class="book-row__content"><h3>{row.book.metadata.title}</h3><p>{row.book.metadata.author ?? 'مؤلف غير محدد'} · <bdi dir="ltr">{row.book.metadata.totalPages}</bdi> صفحة</p>{row.latestSession ? <p>آخر جلسة: {row.latestSession.status}</p> : null}<a class="text-action book-row__link" href={serializeRoute(row.resumeRoute)}>{row.latestSession ? 'استكمل القراءة' : row.activePlan ? 'عرض الطريقة' : 'عرض التقدم'}</a></div></li>)}</ol>}</section>
    {archived.length > 0 ? <section aria-labelledby="archived-books-title"><div class="section-heading"><h2 id="archived-books-title">الأرشيف</h2><span class="demo-label">{archived.length} كتب</span></div><ol class="book-list">{archived.map((row) => <li class="book-row" key={row.book.id}><div class="book-row__content"><h3>{row.book.metadata.title}</h3><p>مؤرشف</p><a class="text-action book-row__link" href={serializeRoute(row.resumeRoute)}>استعادة الكتاب</a></div></li>)}</ol></section> : null}
    <section class="flow-card export-card" aria-labelledby="export-title"><h2 id="export-title">نسخة احتياطية يملكها المستخدم</h2><p class="supporting-text">صدّر بياناتك دون محتوى PDF أو اتصالات خارجية.</p><div class="flow-actions"><button class="text-action" type="button" onClick={() => void exportData('json')}>تصدير JSON</button><button class="text-action" type="button" onClick={() => void exportData('markdown')}>تصدير Markdown</button><button ref={importTriggerRef} class="text-action file-action" type="button" onClick={() => importInputRef.current?.click()}>استيراد JSON</button><input ref={importInputRef} class="visually-hidden-file-input" type="file" accept="application/json,.json" onChange={(event) => void inspectImport(event)} /></div>{exportStatus ? <p class="supporting-text" role="status">{exportStatus}</p> : null}{importStatus ? <p class="supporting-text" role="status">{importStatus}</p> : null}</section>{importPreview ? <section ref={importPreviewRef} class="flow-card import-preview" role="dialog" tabIndex={-1} aria-labelledby="import-preview-title"><h2 id="import-preview-title">معاينة الاستيراد</h2>{importPreview.ok ? <><p>سيتم استبدال البيانات بعد إنشاء نسخة احتياطية محلية.</p><ul>{Object.entries(importPreview.counts).map(([storeName, count]) => <li key={storeName}>{storeName}: {count}</li>)}</ul>{importPreview.migrationSteps.map((step) => <p class="supporting-text" key={step}>{step}</p>)}<div class="flow-actions"><button class="primary-button" type="button" onClick={() => void commitImport()}>تأكيد الاستيراد</button><button class="text-action" type="button" onClick={() => setImportPreview(null)}>إلغاء</button></div></> : <><p class="save-error" role="alert">لا يمكن استيراد هذا الملف.</p><ul>{importPreview.issues.map((entry) => <li key={`${entry.code}-${entry.store ?? ''}-${entry.recordId ?? ''}`}>{entry.message}</li>)}</ul><button class="text-action" type="button" onClick={() => setImportPreview(null)}>إغلاق</button></>}</section> : null}<a class="primary-button primary-button--with-icon" href="#/books/new"><BookPlus size={20} aria-hidden="true" /> أضف كتابًا</a>
  </div>;
}
