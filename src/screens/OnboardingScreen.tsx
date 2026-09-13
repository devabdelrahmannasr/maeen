import { BookOpen, Check, LockKeyhole } from 'lucide-preact';
import { useState } from 'preact/hooks';

interface OnboardingScreenProps {
  onStart: () => Promise<void>;
}

export function OnboardingScreen({ onStart }: OnboardingScreenProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleStart() {
    setIsSaving(true);
    setSaveError(null);

    try {
      await onStart();
    } catch {
      setSaveError('تعذر حفظ البداية محليًا. لم تتغير بياناتك؛ حاول مرة أخرى.');
      setIsSaving(false);
    }
  }

  return (
    <div class="screen-root onboarding-screen">
      <header class="app-bar">
        <div>
          <p class="brand-name">مرافق القراءة</p>
          <p class="brand-subtitle">رفيق محلي بجانب كتابك</p>
        </div>
        <span class="privacy-status">
          <span class="privacy-status__dot" aria-hidden="true" />
          محلي
        </span>
      </header>

      <section class="onboarding-hero" aria-labelledby="onboarding-title">
        <div class="book-mark" aria-hidden="true">
          <BookOpen size={76} strokeWidth={1.35} />
          <span class="book-mark__check"><Check size={19} strokeWidth={3} /></span>
        </div>
        <div>
          <h1 id="onboarding-title">اقرأ بهدف واضح</h1>
          <p>اختر لماذا تقرأ، وسنرتّب لك جلسة واحدة تساعدك على الفهم والاسترجاع والتطبيق.</p>
        </div>
      </section>

      <section class="privacy-note" aria-labelledby="privacy-title">
        <span class="privacy-note__icon" aria-hidden="true"><LockKeyhole size={20} /></span>
        <div>
          <h2 id="privacy-title">بياناتك تبقى على جهازك</h2>
          <p>لا حساب، لا سحابة، ولا قراءة لمحتوى PDF. يمكنك تصدير بياناتك أو حذفها متى شئت.</p>
        </div>
      </section>

      <div class="onboarding-screen__spacer" />

      {saveError ? <p class="save-error" role="alert">{saveError}</p> : null}
      <button
        class="primary-button"
        type="button"
        onClick={handleStart}
        disabled={isSaving}
        aria-busy={isSaving}
      >
        {isSaving ? 'جارٍ تجهيز مساحتك…' : 'ابدأ محليًا'}
      </button>
      <p class="compatibility-note">متوافق مع Chrome وEdge</p>
    </div>
  );
}
