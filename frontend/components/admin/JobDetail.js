'use client';
import { useI18n } from '../i18n/I18nContext';


import React, { useEffect, useRef } from 'react';
import { formatBytes, formatDate, formatMs, relativeTime, shortId } from '../../lib/models/adminFormat';
import { EXTEND_OPTIONS, useAdminJobDetailViewModel } from '../../viewmodels/useAdminViewModel';
import ContentTreeView from './ContentTreeView';
import { Badge, Button, ErrorLine } from './ui';

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="font-tech text-[10px] uppercase tracking-wider text-[var(--faint)]">{label}</dt>
      <dd className="m-0 text-[12.5px] truncate">{children}</dd>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="m-0 text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">{title}</h3>
      {children}
    </section>
  );
}

/** Side panel (full screen on phones) with one job's details and actions. */
export default function JobDetail({ jobId, onClose, handleError, notify, onChanged }) {
  const { uiText , locale } = useI18n();

  const vm = useAdminJobDetailViewModel(jobId, { handleError, notify, onChanged: () => onChanged?.() });
  const panel = useRef(null);
  const job = vm.detail?.job;
  const files = vm.detail?.files || [];
  const stored = files.filter((f) => f.storage_status === 'ACTIVE');
  const filesGone = Boolean(job?.files_deleted_at);

  useEffect(() => {
    panel.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const act = (action, hours) => vm.act(action, hours).then(() => action === 'DELETE_JOB' && onClose());

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label={uiText("Close job details")} onClick={onClose} className="absolute inset-0 bg-black/40 cursor-default" />
      <aside
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={uiText("Job {v0}", { v0: shortId(jobId) })}
        className="relative w-full sm:w-[640px] h-full overflow-y-auto bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl focus:outline-none"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="min-w-0">
            <div className="font-tech text-[11px] text-[var(--faint)]">{uiText("Job ")}{jobId}</div>
            <div className="text-[14px] font-semibold truncate">{job?.original_filename || (job ? uiText("(name removed after deletion)") : uiText("Loading…"))}</div>
          </div>
          <Button onClick={onClose} aria-label={uiText("Close")}>
            ✕
          </Button>
        </header>

        <div className="p-4 flex flex-col gap-5">
          <ErrorLine error={vm.error} onRetry={vm.reload} />

          {job ? (
            <>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 m-0">
                <Field label={uiText("Status")}>
                  <Badge status={job.status} />
                </Field>
                <Field label={uiText("Type")}>
                  {job.source_type || '—'} {job.source_extension ? `(.${job.source_extension})` : ''}
                </Field>
                <Field label={uiText("Profile")}>{job.profile || '—'}</Field>
                <Field label={uiText("Created")}>{formatDate(job.created_at, locale)}</Field>
                <Field label={uiText("Finished")}>{formatDate(job.completed_at, locale)}</Field>
                <Field label={uiText("Processing")}>{formatMs(job.processing_ms, locale)}</Field>
                <Field label={uiText("Instance")}>{job.backend_instance?.toUpperCase() || '—'}</Field>
                <Field label={uiText("Engine")}>{job.engine || '—'}</Field>
                <Field label={uiText("Parts")}>
                  {job.items_done}/{job.items_total}{uiText(" done")}{job.items_failed ? uiText(", {v0} failed", { v0: job.items_failed }) : ''}
                  {job.items_skipped ? uiText(", {v0} skipped", { v0: job.items_skipped }) : ''}
                </Field>
              </dl>
              {job.error_message ? <ErrorLine error={`${job.error_code || 'Error'}: ${job.error_message}`} /> : null}
              {job.warnings?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {job.warnings.map((w) => (
                    <Badge key={w} status="PENDING">
                      {w}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <Section title={uiText("Retention")}>
                <p className="m-0 text-[12.5px] text-[var(--muted)]">
                  {filesGone
                    ? uiText("Files deleted {v0}.", { v0: relativeTime(job.files_deleted_at, Date.now(), locale) })
                    : job.retention_mode === "KEEP"
                      ? uiText("Kept: not deleted automatically.")
                      : uiText("Files are deleted {v0} ({v1}).", { v0: relativeTime(job.retention_extended_until || job.auto_delete_at, Date.now(), locale), v1: formatDate(job.retention_extended_until || job.auto_delete_at, locale) })}
                  {job.cleanup_state === "PARTIAL" || job.cleanup_state === "ERROR" ? uiText(" Cleanup problem: {v0}.", { v0: job.cleanup_last_error || job.cleanup_state }) : ''}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => act('KEEP')} busy={vm.working === 'KEEP'} disabled={filesGone || job.retention_mode === 'KEEP'}>{uiText("Keep")}</Button>
                  {EXTEND_OPTIONS.map((o) => (
                    <Button key={o.hours} onClick={() => act('EXTEND', o.hours)} busy={vm.working === 'EXTEND'} disabled={filesGone}>
                      +{uiText(o.label)}
                    </Button>
                  ))}
                  <Button onClick={() => act('AUTO')} busy={vm.working === 'AUTO'} disabled={filesGone || job.retention_mode === 'AUTO'}>{uiText("Back to 48 h")}</Button>
                  {job.cleanup_state === "PARTIAL" || job.cleanup_state === "ERROR" ? (
                    <Button onClick={() => act('RETRY_CLEANUP')} busy={vm.working === 'RETRY_CLEANUP'}>{uiText("Retry cleanup")}</Button>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button tone="danger" onClick={() => act('DELETE_NOW')} busy={vm.working === 'DELETE_NOW'} disabled={filesGone}>{uiText("Delete files now")}</Button>
                  <Button tone="danger" onClick={() => act('DELETE_JOB')} busy={vm.working === 'DELETE_JOB'}>{uiText("Delete job and files")}</Button>
                </div>
              </Section>

              <Section title={uiText("Files ({v0} stored)", { v0: stored.length })}>
                {files.length ? (
                  <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
                    {files.map((f) => {
                      const name = f.object_path.split('/').pop();
                      const active = f.storage_status === 'ACTIVE';
                      return (
                        <li key={f.file_id} className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--panel)] px-2.5 py-1.5">
                          <Badge status={f.kind === 'INPUT' ? undefined : 'DONE'}>{f.kind.toLowerCase()}</Badge>
                          <span className="font-tech text-[12px] truncate min-w-0 flex-1">{name}</span>
                          <span className="font-tech text-[11px] text-[var(--faint)]">{formatBytes(f.size_bytes, locale)}</span>
                          {!active ? <Badge status={f.storage_status} /> : null}
                          {active && f.kind !== "INPUT" ? (
                            <Button onClick={() => vm.showPreview(f)} className="h-7">{uiText("Preview")}</Button>
                          ) : null}
                          {active ? (
                            <Button onClick={() => vm.download(f)} className="h-7">{uiText("Download")}</Button>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="m-0 text-[12.5px] text-[var(--faint)]">{uiText("No files registered.")}</p>
                )}
                {stored.length > 1 ? (
                  <div>
                    <Button onClick={vm.downloadAll} busy={vm.working === 'ZIP'}>{uiText("Download all as ZIP")}</Button>
                  </div>
                ) : null}
                {vm.preview ? (
                  <div className="rounded-md border border-[var(--border)] bg-[var(--bg)]">
                    <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-[var(--border)]">
                      <span className="font-tech text-[11.5px] truncate">
                        {vm.preview.name}
                        {vm.preview.truncated ? uiText(" (first 200,000 characters)") : ''}
                      </span>
                      <Button onClick={vm.closePreview} className="h-7">{uiText("Close")}</Button>
                    </div>
                    {vm.preview.loading ? (
                      <p className="m-0 p-3 text-[12px] text-[var(--faint)]">{uiText("Loading preview…")}</p>
                    ) : vm.preview.error ? (
                      <div className="p-2">
                        <ErrorLine error={vm.preview.error} />
                      </div>
                    ) : (
                      <pre className="m-0 p-3 max-h-[420px] overflow-auto whitespace-pre-wrap break-words font-tech text-[11.5px] leading-5 text-[var(--md-body)]">
                        {vm.preview.text}
                      </pre>
                    )}
                  </div>
                ) : null}
              </Section>

              <Section title={uiText("Content")}>
                <ContentTreeView tree={vm.tree} />
              </Section>

              <Section title={uiText("Work items ({v0})", { v0: vm.detail.items.length })}>
                <div className="overflow-x-auto rounded-md border border-[var(--border)]">
                  <table className="w-full text-[12px] border-collapse">
                    <thead className="bg-[var(--panel)] text-[var(--faint)] font-tech text-[10px] uppercase">
                      <tr>
                        <th className="text-left px-2 py-1.5 font-normal">{uiText("Task")}</th>
                        <th className="text-left px-2 py-1.5 font-normal">{uiText("Pool")}</th>
                        <th className="text-left px-2 py-1.5 font-normal">{uiText("Status")}</th>
                        <th className="text-left px-2 py-1.5 font-normal">{uiText("Tries")}</th>
                        <th className="text-left px-2 py-1.5 font-normal">{uiText("Backend")}</th>
                        <th className="text-left px-2 py-1.5 font-normal">{uiText("Time")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vm.detail.items.map((w) => (
                        <tr key={w.work_item_id} className="border-t border-[var(--border)]">
                          <td className="px-2 py-1 font-tech whitespace-nowrap">{w.task_type}</td>
                          <td className="px-2 py-1">{w.pool}</td>
                          <td className="px-2 py-1">
                            <Badge status={w.status} title={w.error_message || undefined} />
                          </td>
                          <td className="px-2 py-1 tabular-nums">{w.attempt_count}</td>
                          <td className="px-2 py-1">{w.assigned_backend?.toUpperCase() || '—'}</td>
                          <td className="px-2 py-1 whitespace-nowrap">{formatMs(w.duration_ms, locale)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title={uiText("Events")}>
                <ol className="list-none m-0 p-0 flex flex-col gap-1">
                  {vm.detail.events.map((e) => (
                    <li key={e.event_id} className="flex flex-wrap items-center gap-2 text-[12px]">
                      <span className="font-tech text-[11px] text-[var(--faint)] w-[110px] shrink-0">{formatDate(e.created_at, locale)}</span>
                      <span className="font-medium">{e.event_type}</span>
                      {e.stage ? <span className="text-[var(--faint)]">{e.stage}</span> : null}
                      {e.message ? <span className="text-[var(--muted)] truncate">{e.message}</span> : null}
                    </li>
                  ))}
                </ol>
              </Section>
            </>
          ) : vm.loading ? (
            <p className="m-0 text-[12.5px] text-[var(--faint)]">{uiText("Loading…")}</p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
