'use client';
import { useI18n } from '../i18n/I18nContext';

export default function QuotaIndicator({ quota, error, onRefresh }) {
  const { uiText, locale } = useI18n();
  if (!quota?.enabled && !error) return null;
  const next = quota?.nextSlotAvailableAt;
  const nextLabel = next && Number.isFinite(Date.parse(next))
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(next)) : null;
  return <section aria-label={uiText('File allowance')} className="mb-3 rounded-lg border border-[var(--border-3)] bg-[var(--surface)] px-4 py-3 text-sm">
    <div role="status" aria-live="polite" aria-atomic="true">
      {quota?.enabled && <>
        <p className="font-semibold">{uiText('{used} of {limit} files used in the last 24 hours', { used: quota.used, limit: quota.limit })}</p>
        <p>{uiText('{reserved} reserved · {remaining} remaining', { reserved: quota.reserved, remaining: quota.remaining })}</p>
        {quota.remaining <= 5 && <p className="mt-1">{uiText(quota.remaining === 0 ? 'No file slots remain. Your existing results are still available.' : 'Your file allowance is nearly used. Check the remaining count before uploading.')}</p>}
        {nextLabel && <p>{uiText('Next slot release scheduled for {time} (your local time).', { time: nextLabel })}</p>}
        <p className="mt-1 text-[var(--muted)]">{uiText('Up to 20 files per batch. Your rolling allowance is separate; slots return individually.')}</p>
      </>}
      {error && <p className="mt-1">{uiText(error)}</p>}
    </div>
    <button type="button" onClick={onRefresh} className="mt-2 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{uiText('Refresh file allowance')}</button>
  </section>;
}
