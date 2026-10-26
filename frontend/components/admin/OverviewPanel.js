'use client';
import { useI18n } from '../i18n/I18nContext';


import React from 'react';
import { adminApi } from '../../lib/models/adminApi';
import { formatBytes, formatMs } from '../../lib/models/adminFormat';
import { useAdminResource } from '../../viewmodels/useAdminViewModel';
import { Button, Card, ErrorLine, Stat } from './ui';

export default function OverviewPanel({ handleError }) {
  const { uiText , locale } = useI18n();

  const { data, loading, error, reload } = useAdminResource(adminApi.overview, { handleError, refreshMs: 30_000 });
  const k = data?.kpis || {};
  const s = data?.storage || {};
  const usedPct = s.used_bytes != null && s.budget_bytes ? Math.min(100, Math.round((s.used_bytes / s.budget_bytes) * 100)) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-[12px] text-[var(--faint)]">{uiText("Refreshes every 30 s while this tab is open.")}</p>
        <Button onClick={reload} busy={loading}>{uiText("Refresh")}</Button>
      </div>
      <ErrorLine error={error} onRetry={reload} />

      <Card title={uiText("Jobs today")}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Stat label={uiText("Started")} value={k.jobs?.today} />
          <Stat label={uiText("Completed")} value={k.jobs?.completed_today} />
          <Stat label={uiText("Failed")} value={k.jobs?.failed_today} tone={k.jobs?.failed_today ? 'bad' : undefined} />
          <Stat label={uiText("Partial results")} value={k.jobs?.partial_today} tone={k.jobs?.partial_today ? 'warn' : undefined} hint={uiText("skipped or failed parts")} />
          <Stat label={uiText("Processing now")} value={k.jobs?.processing} />
          <Stat label={uiText("Queued now")} value={k.jobs?.queued} />
          <Stat label={uiText("Avg time")} value={formatMs(k.performance?.avg_processing_ms_today, locale)} />
          <Stat label={uiText("p95 time")} value={formatMs(k.performance?.p95_processing_ms_today, locale)} />
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title={uiText("Work mix today")}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Stat label={uiText("Documents")} value={k.workloads?.normal_today} />
            <Stat label={uiText("Images (OCR)")} value={k.workloads?.ocr_today} />
            <Stat label="PDFs" value={k.workloads?.pdf_today} />
            <Stat label={uiText("Scanned PDFs")} value={k.workloads?.hybrid_pdf_today} hint={uiText("with OCR pages")} />
            <Stat label={uiText("ZIP files")} value={k.workloads?.archive_today} />
            <Stat label={uiText("Files per ZIP")} value={k.nodes?.avg_per_archive} />
            <Stat label={uiText("Parts done")} value={k.nodes?.processed_today} />
            <Stat label={uiText("OCR parts")} value={k.nodes?.ocr_today} />
            <Stat label={uiText("Skipped parts")} value={k.nodes?.skipped_today} />
          </div>
        </Card>

        <Card title={uiText("Queue and instances")}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Stat label={uiText("Items queued")} value={k.queue?.queued} />
            <Stat label={uiText("Items running")} value={k.queue?.running} />
            {Object.entries(k.queue?.by_pool || {}).map(([pool, n]) => (
              <Stat key={pool} label={uiText("{v0} pool", { v0: pool })} value={n} hint={uiText("queued + running")} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(k.instances_today || {}).length ? (
              Object.entries(k.instances_today).map(([inst, n]) => (
                <span key={inst} className="font-tech text-[11px] px-2 py-1 rounded border border-[var(--border)] bg-[var(--panel)]">
                  {inst.toUpperCase()}: {n}
                </span>
              ))
            ) : (
              <span className="text-[12px] text-[var(--faint)]">{uiText("No jobs handled by an instance yet today.")}</span>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card title={uiText("Storage")}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Stat label={uiText("Bucket in use")} value={formatBytes(s.used_bytes, locale)} hint={uiText("budget {v0}", { v0: formatBytes(s.budget_bytes, locale) })} tone={usedPct >= 90 ? 'bad' : usedPct >= 70 ? 'warn' : undefined} />
            <Stat label={uiText("Input files")} value={k.storage?.input_files} />
            <Stat label={uiText("Result files")} value={k.storage?.output_files} />
          </div>
          {usedPct !== null ? (
            <div className="mt-3">
              <div className="h-2 rounded-full bg-[var(--panel)] border border-[var(--border)] overflow-hidden" aria-label={uiText("{v0}% of the storage budget used", { v0: usedPct })}>
                <div className={`h-full ${usedPct >= 90 ? 'bg-rose-500' : usedPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${usedPct}%` }} />
              </div>
              <p className="m-0 mt-1 text-[11px] text-[var(--faint)]">
                {usedPct}{uiText("% of the budget. New uploads wait when a job would pass it.")}</p>
            </div>
          ) : null}
        </Card>

        <Card title={uiText("Retention")}>
          <div className="grid grid-cols-2 gap-2">
            <Stat label={uiText("Deleted within 6 h")} value={k.retention?.expiring_6h} />
            <Stat label={uiText("Deleted within 24 h")} value={k.retention?.expiring_24h} />
            <Stat label={uiText("Kept (no auto delete)")} value={k.retention?.kept} />
            <Stat label={uiText("Cleanup errors")} value={k.retention?.cleanup_errors} tone={k.retention?.cleanup_errors ? 'bad' : undefined} />
          </div>
        </Card>
      </div>
    </div>
  );
}
