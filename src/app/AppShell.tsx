import type { ComponentChildren } from 'preact';

interface AppShellProps {
  children?: ComponentChildren;
  isLoading?: boolean;
  statusMessage?: string | null;
}

export function AppShell({ children, isLoading = false, statusMessage = null }: AppShellProps) {
  return (
    <main
      class={`app-shell${isLoading ? ' app-shell--centered' : ''}`}
      aria-busy={isLoading || undefined}
      aria-label={isLoading ? 'جارٍ تحميل مرافق القراءة' : undefined}
    >
      {isLoading ? (
        <>
          <span class="loading-mark" aria-hidden="true" />
          <p class="supporting-text">نستعيد مساحتك المحلية…</p>
        </>
      ) : (
        <>
          {statusMessage ? <p class="navigation-status" role="status">{statusMessage}</p> : null}
          {children}
        </>
      )}
    </main>
  );
}
