import { ArrowLeft, BookPlus, Play, Settings } from 'lucide-preact';

interface DemoBook {
  title: string;
  goal: string;
  detail?: string;
  pageRange?: string;
  progress?: number;
  coverTone: 'indigo' | 'amber' | 'green';
}

const demoBooks: DemoBook[] = [
  {
    title: 'Clean Architecture',
    goal: 'فهم عميق',
    pageRange: '84–102',
    progress: 44,
    coverTone: 'indigo',
  },
  {
    title: 'التفكير النقدي',
    goal: 'قراءة نقدية',
    detail: '3 جلسات',
    coverTone: 'amber',
  },
  {
    title: 'التعلّم الفعّال',
    goal: 'تعلّم مهارة',
    detail: 'جلسة واحدة',
    coverTone: 'green',
  },
];

export function LibraryScreen() {
  return (
    <main class="app-shell library-screen">
      <header class="app-bar app-bar--roomy">
        <div>
          <h1 class="page-title">مكتبتي</h1>
          <p class="supporting-text">3 كتب · جلسة واحدة تحتاج استكمالًا</p>
        </div>
        <button class="icon-button" type="button" aria-label="فتح الإعدادات">
          <Settings size={20} />
        </button>
      </header>

      <aside class="recovery-banner" aria-label="جلسة محفوظة تحتاج استكمالًا">
        <div>
          <strong>جلسة متوقفة بأمان</strong>
          <span>Clean Architecture · القراءة المركّزة</span>
        </div>
        <button type="button" class="text-action">
          استكمل <ArrowLeft size={16} aria-hidden="true" />
        </button>
      </aside>

      <section aria-labelledby="continue-reading-title">
        <div class="section-heading">
          <h2 id="continue-reading-title">تابع القراءة</h2>
          <span class="demo-label">بيانات توضيحية</span>
        </div>
        <ol class="book-list">
          {demoBooks.map((book, index) => (
            <li class={`book-row book-row--${book.coverTone}`} key={book.title}>
              <div class="book-cover" aria-hidden="true">
                <span>{index + 1}</span>
              </div>
              <div class="book-row__content">
                <h3>{book.title}</h3>
                <p>
                  {book.goal} · {book.pageRange ? <>ص <bdi dir="ltr">{book.pageRange}</bdi></> : book.detail}
                </p>
                {book.progress !== undefined ? (
                  <>
                    <div
                      class="progress-track"
                      role="progressbar"
                      aria-label={`التقدم في ${book.title}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={book.progress}
                    >
                      <span style={{ width: `${book.progress}%` }} />
                    </div>
                    <div class="book-row__footer">
                      <span>التقدم <bdi dir="ltr">{book.progress}%</bdi></span>
                      <button type="button" class="text-action">
                        <Play size={14} fill="currentColor" aria-hidden="true" /> ابدأ جلسة
                      </button>
                    </div>
                  </>
                ) : (
                  <button type="button" class="text-action book-row__link">
                    عرض التقدم <ArrowLeft size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <button class="primary-button primary-button--with-icon" type="button">
        <BookPlus size={20} aria-hidden="true" />
        أضف كتابًا
      </button>
    </main>
  );
}
