import { useEffect, useState } from 'preact/hooks';
import { BookPlus, Settings } from 'lucide-preact';
import { queryLibrary, type LibraryBookRow } from '../domain/books/libraryQuery';
import { createBookRepository, createReadingPlanRepository, createSessionRepository } from '../storage/indexedDb/domainRepositories';
import { findRecoveryCandidate, recoverInterruptedSession, abandonInterruptedSession, type RecoveryCandidate } from '../storage/recovery';
import { serializeRoute } from '../navigation/routes';

export function LibraryScreen() {
  const [rows, setRows] = useState<readonly LibraryBookRow[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [recovery, setRecovery] = useState<RecoveryCandidate | null>(null);
  useEffect(() => { const sessionRepository = createSessionRepository(); void Promise.all([queryLibrary(createBookRepository(), { plans: createReadingPlanRepository(), sessions: sessionRepository }), sessionRepository.list()]).then(([result, sessions]) => { setRows(result); setRecovery(sessions.map(findRecoveryCandidate).find((candidate): candidate is RecoveryCandidate => candidate !== null) ?? null); setStatus('ready'); }).catch(() => setStatus('failed')); }, []);
  const active = rows.filter((row) => !row.archived);
  const archived = rows.filter((row) => row.archived);
  return <div class="screen-root library-screen"><header class="app-bar app-bar--roomy"><div><h1 class="page-title">مكتبتي</h1><p class="supporting-text">مراجعك محفوظة على هذا الجهاز فقط</p></div><button class="icon-button" type="button" aria-label="فتح الإعدادات"><Settings size={20} /></button></header>
    {status === 'failed' ? <p class="save-error" role="alert">تعذر فتح المكتبة المحلية. بياناتك لم تُحذف؛ أعد المحاولة بعد التحقق من مساحة التخزين.</p> : null}
    {recovery ? <aside class="recovery-banner" aria-label="جلسة محفوظة تحتاج استكمالًا"><div><strong>جلسة متوقفة بأمان</strong><span>{recovery.messageAr}</span></div><div class="flow-actions"><button type="button" class="text-action" onClick={async () => { await recoverInterruptedSession(recovery, createSessionRepository(), new Date().toISOString()); window.location.hash = `#/sessions/${encodeURIComponent(recovery.session.id)}/focus`; }}>استكمل</button><button type="button" class="text-action" onClick={async () => { await abandonInterruptedSession(recovery, createSessionRepository(), new Date().toISOString()); setRecovery(null); }}>اتركها محفوظة</button></div></aside> : null}
    <section aria-labelledby="active-books-title"><div class="section-heading"><h2 id="active-books-title">الكتب النشطة</h2><span class="demo-label">{status === 'loading' ? 'جارٍ التحميل…' : `${active.length} كتب`}</span></div>{status === 'ready' && active.length === 0 ? <p class="supporting-text">لم تضف كتابًا بعد. ابدأ بمرجع واحد.</p> : <ol class="book-list">{active.map((row) => <li class="book-row" key={row.book.id}><div class="book-cover" aria-hidden="true"><span>كتاب</span></div><div class="book-row__content"><h3>{row.book.metadata.title}</h3><p>{row.book.metadata.author ?? 'مؤلف غير محدد'} · <bdi dir="ltr">{row.book.metadata.totalPages}</bdi> صفحة</p>{row.latestSession ? <p>آخر جلسة: {row.latestSession.status}</p> : null}<a class="text-action book-row__link" href={serializeRoute(row.resumeRoute)}>{row.latestSession ? 'استكمل القراءة' : row.activePlan ? 'عرض الطريقة' : 'عرض التقدم'}</a></div></li>)}</ol>}</section>
    {archived.length > 0 ? <section aria-labelledby="archived-books-title"><div class="section-heading"><h2 id="archived-books-title">الأرشيف</h2><span class="demo-label">{archived.length} كتب</span></div><ol class="book-list">{archived.map((row) => <li class="book-row" key={row.book.id}><div class="book-row__content"><h3>{row.book.metadata.title}</h3><p>مؤرشف</p><a class="text-action book-row__link" href={serializeRoute(row.resumeRoute)}>استعادة الكتاب</a></div></li>)}</ol></section> : null}
    <a class="primary-button primary-button--with-icon" href="#/books/new"><BookPlus size={20} aria-hidden="true" /> أضف كتابًا</a>
  </div>;
}
