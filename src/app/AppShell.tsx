import type { ComponentChildren } from 'preact';
import type { MigrationState } from '../storage/indexedDb/migrations';
import { downloadDomainBackup, exportDomainData } from '../storage/indexedDb/dataExport';

interface AppShellProps {
  children?: ComponentChildren;
  isLoading?: boolean;
  statusMessage?: string | null;
  migrationState?: MigrationState | null;
}

export function AppShell({ children, isLoading = false, statusMessage = null, migrationState = null }: AppShellProps) {
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
          {migrationState?.mode === 'read-only' ? (
            <aside class="migration-banner" role="alert" aria-label="وضع القراءة فقط">
              <strong>بياناتك في وضع القراءة فقط</strong>
              <span>تعذر تطبيق تحديث آمن على البيانات الحالية. يمكنك تصدير نسخة احتياطية، ولن نكتب فوق بياناتك.</span>
              <button class="text-action" type="button" onClick={async () => { try { downloadDomainBackup(await exportDomainData()); } catch { /* The banner remains available when export is unavailable. */ } }}>صدّر نسخة احتياطية</button>
            </aside>
          ) : null}
          {children}
        </>
      )}
    </main>
  );
}
