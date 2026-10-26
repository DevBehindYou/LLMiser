'use client';
import { useI18n } from './i18n/I18nContext';


import React, { useState } from 'react';
import Link from 'next/link';
import AppIcon from './AppIcon';
import { RETENTION_HOURS } from '../lib/legal/policies';

export default function LLMiserFooter({
  onOpenBlog,
  onOpenApi,
  onOpenLegal,
  activeResult = null,
  totalConverted = 0,
  onDownloadMd,
  onCopyMd,
  copied = false,
  onDownloadZip,
  onToggleRecentSidebar,
  recentSessionsCount = 0,
}) {
  const { uiText } = useI18n();

  const [openSection, setOpenSection] = useState(null);

  const toggle = (sec) => {
    setOpenSection(openSection === sec ? null : sec);
  };

  return (
    <footer className="w-full bg-[var(--surface)] text-[var(--muted)] border-t border-[var(--border)] transition-colors select-none">
      {/* 2.5px Aurora Hairline */}
      <div className="aurora-hairline w-full" />

      {/* ── Export Action Banner in Footer Area ── */}
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)]/60 py-3.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 max-w-full lg:flex-1">
            <div className="w-8 h-8 flex-none rounded-lg border border-[var(--border-3)] bg-[var(--surface)] flex items-center justify-center font-tech text-[13px] text-amber-500 shadow-2xs">
              ↓
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-tech text-[10px] tracking-wider uppercase text-[var(--faint)]">
                <span>{uiText("EXPORT AREA")}</span>
                {activeResult && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{uiText("· READY")}</span>
                )}
              </div>
              <div className="text-[13px] font-medium text-[var(--text)] font-sans">
                {activeResult ? (
                  <span className="flex items-baseline gap-1 min-w-0">
                    <span className="truncate" title={activeResult.filename || uiText("{v0}.md", { v0: activeResult.original_name })}>
                      {activeResult.filename || uiText("{v0}.md", { v0: activeResult.original_name })}
                    </span>
                    <span className="flex-none text-[11px] font-tech text-[var(--muted)] font-normal">
                      ({activeResult.content?.length?.toLocaleString() || 0}{uiText(" chars)")}</span>
                  </span>
                ) : (
                  <span className="text-[var(--muted)] text-[12.5px]">{uiText("No document converted yet. Choose or drop a file to export.")}</span>
                )}
              </div>
            </div>
          </div>

          {/* Export & Quick Access Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:flex-none">
            {onToggleRecentSidebar && (
              <button
                onClick={onToggleRecentSidebar}
                className="px-3 py-1.5 rounded-full border border-[var(--border-3)] hover:border-[var(--text)] text-[var(--text)] text-[12px] font-tech cursor-pointer bg-[var(--surface)] transition-colors flex items-center gap-1.5"
                title={uiText("Open recent conversion sessions sidebar")}
              >
                <span className="text-amber-500">⏱</span>
                <span>{uiText("Recent Items (")}{recentSessionsCount}/5)</span>
              </button>
            )}

            <button
              onClick={onCopyMd}
              disabled={!activeResult}
              className={`px-3.5 py-1.5 rounded-full border text-[12px] font-tech cursor-pointer transition-all flex items-center gap-1.5 ${
                copied
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'border-[var(--border-3)] hover:border-[var(--text)] text-[var(--text)] bg-[var(--surface)] disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
              title={uiText("Copy converted Markdown to clipboard (Cmd+C)")}
            >
              <span>{copied ? '✓' : '⧉'}</span>
              <span>{copied ? uiText("Copied to Clipboard") : uiText("Copy to Clipboard")}</span>
            </button>

            <button
              onClick={onDownloadMd}
              disabled={!activeResult}
              className="px-4 py-1.5 rounded-full aurora-btn font-sans text-[12.5px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs flex items-center gap-1.5"
              title={uiText("Download as .md file")}
            >
              <span>↓</span>
              <span>{uiText("Download .md")}</span>
            </button>

            {totalConverted > 1 && (
              <button
                onClick={onDownloadZip}
                className="px-3 py-1.5 rounded-full border border-[var(--border-3)] hover:border-[var(--text)] text-[var(--muted)] hover:text-[var(--text)] text-[12px] font-tech cursor-pointer bg-[var(--surface)] transition-colors"
                title={uiText("Download all converted documents as .zip")}
              >{uiText("Download All (")}{totalConverted}{uiText(" .zip)")}</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop Columns (1m) ── */}
      <div className="hidden md:grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-6 max-w-6xl mx-auto px-6 py-6 text-[13px] font-sans">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-wireframe">
            <AppIcon size={26} className="rounded-[6px]" />
            <b className="text-[15px] text-[var(--text)]">LLMiser</b>
          </div>
          <p className="text-[12.5px] leading-relaxed max-w-[280px] text-[var(--muted)]">{uiText("LLM cost optimization starts with useful context. Make Every Token Count.")}</p>
        </div>

        {/* Product */}
        <div>
          <div className="font-tech text-[10px] tracking-wider text-[var(--faint)] uppercase mb-2">{uiText("PRODUCT")}</div>
          <ul className="space-y-1.5 list-none p-0 m-0">
            <li>
              <Link href="/" className="hover:text-[var(--text)] transition-colors text-inherit no-underline">{uiText("Converter")}</Link>
            </li>
            <li>
              <Link href="/usecase" className="hover:text-[var(--text)] transition-colors text-inherit no-underline">{uiText("Why Use It")}</Link>
            </li>
            <li>
              <button
                onClick={onOpenApi}
                className="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 text-[13px] text-[var(--muted)] cursor-pointer"
              >
                API
              </button>
            </li>
            {onToggleRecentSidebar && (
              <li>
                <button
                  onClick={onToggleRecentSidebar}
                  className="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 text-[13px] text-[var(--muted)] cursor-pointer flex items-center gap-1.5"
                >
                  <span>{uiText("Recent Conversions")}</span>
                  {recentSessionsCount > 0 && (
                    <span className="font-tech text-[9.5px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1 py-0.2 rounded">
                      {recentSessionsCount}
                    </span>
                  )}
                </button>
              </li>
            )}
            <li>
              <button
                onClick={onDownloadMd}
                disabled={!activeResult}
                className="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 text-[13px] text-[var(--muted)] cursor-pointer disabled:opacity-40"
              >{uiText("Export .md ")}{activeResult ? '↓' : ''}
              </button>
            </li>
            <li>
              <button
                onClick={onCopyMd}
                disabled={!activeResult}
                className="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 text-[13px] text-[var(--muted)] cursor-pointer disabled:opacity-40"
              >
                {copied ? uiText("✓ Markdown Copied") : uiText("Copy Markdown")}
              </button>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <div className="font-tech text-[10px] tracking-wider text-[var(--faint)] uppercase mb-2">{uiText("RESOURCES")}</div>
          <ul className="space-y-1.5 list-none p-0 m-0">
            <li>
              <button
                onClick={onOpenBlog}
                className="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 text-[13px] text-[var(--muted)] cursor-pointer"
              >{uiText("Blog")}</button>
            </li>
            <li>
              <a
                href="https://github.com/DevBehindYou/LLMiser"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--text)] transition-colors text-inherit no-underline"
              >{uiText("GitHub")}</a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <div className="font-tech text-[10px] tracking-wider text-[var(--faint)] uppercase mb-2">{uiText("LEGAL")}</div>
          <ul className="space-y-1.5 list-none p-0 m-0">
            <li>
              <button
                onClick={() => onOpenLegal && onOpenLegal('privacy')}
                className="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 text-[13px] text-[var(--muted)] cursor-pointer"
              >{uiText("Privacy")}</button>
            </li>
            <li>
              <button
                onClick={() => onOpenLegal && onOpenLegal('terms')}
                className="hover:text-[var(--text)] transition-colors bg-transparent border-0 p-0 text-[13px] text-[var(--muted)] cursor-pointer"
              >{uiText("Terms")}</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Monospace Attribution Sub-row */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 py-2.5 border-t border-dashed border-[var(--border)] font-tech text-[10.5px] text-[var(--faint)]">{uiText("Free · no sign-up · default ")}{RETENTION_HOURS}{uiText("-hour file retention · open source (GPL-3.0)")}</div>

      {/* ── Mobile Stacked Footer (1m Mobile) ── */}
      <div className="md:hidden px-4 pt-5 pb-6 font-sans">
        <div className="border border-[var(--border)] rounded-lg p-3.5 bg-[var(--surface-2)] space-y-3">
          <div className="flex items-center gap-2 font-wireframe">
            <AppIcon size={26} className="rounded-[6px]" />
            <b className="text-[14px] text-[var(--text)]">LLMiser</b>
          </div>

          <p className="text-[11.5px] text-[var(--muted)] leading-relaxed">{uiText("LLM cost optimization starts with useful context. Make Every Token Count.")}</p>

          <div className="space-y-1.5 text-[12.5px] pt-1">
            {/* Product toggle */}
            <div className="border-t border-[var(--border)] pt-1.5">
              <button
                onClick={() => toggle('product')}
                className="w-full flex justify-between items-center py-1 text-left text-[var(--text)] font-medium bg-transparent border-0 cursor-pointer"
              >
                <span>{uiText("Product")}</span>
                <span className="text-[11px] text-[var(--muted)]">{openSection === "product" ? '▴' : '▾'}</span>
              </button>
              {openSection === "product" && (
                <div className="pl-3 py-1 space-y-1.5 text-[12px] text-[var(--muted)]">
                  <div><Link href="/" className="no-underline text-inherit">{uiText("Converter")}</Link></div>
                  <div><Link href="/usecase" className="no-underline text-inherit">{uiText("Why Use It")}</Link></div>
                  <div><button onClick={onOpenApi} className="p-0 bg-transparent border-0 text-inherit cursor-pointer">API</button></div>
                  <div>
                    <button
                      onClick={onDownloadMd}
                      disabled={!activeResult}
                      className="p-0 bg-transparent border-0 text-inherit cursor-pointer disabled:opacity-40"
                    >{uiText("Export .md")}</button>
                  </div>
                  <div>
                    <button
                      onClick={onCopyMd}
                      disabled={!activeResult}
                      className="p-0 bg-transparent border-0 text-inherit cursor-pointer disabled:opacity-40"
                    >
                      {copied ? uiText("✓ Copied") : uiText("Copy to Clipboard")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Resources toggle */}
            <div className="border-t border-[var(--border)] pt-1.5">
              <button
                onClick={() => toggle('resources')}
                className="w-full flex justify-between items-center py-1 text-left text-[var(--text)] font-medium bg-transparent border-0 cursor-pointer"
              >
                <span>{uiText("Resources")}</span>
                <span className="text-[11px] text-[var(--muted)]">{openSection === "resources" ? '▴' : '▾'}</span>
              </button>
              {openSection === "resources" && (
                <div className="pl-3 py-1 space-y-1.5 text-[12px] text-[var(--muted)]">
                  <div><button onClick={onOpenBlog} className="p-0 bg-transparent border-0 text-inherit cursor-pointer">{uiText("Blog")}</button></div>
                  <div><a href="https://github.com/DevBehindYou/LLMiser" target="_blank" rel="noreferrer" className="no-underline text-inherit">{uiText("GitHub")}</a></div>
                </div>
              )}
            </div>

            {/* Legal toggle */}
            <div className="border-t border-[var(--border)] pt-1.5">
              <button
                onClick={() => toggle('legal')}
                className="w-full flex justify-between items-center py-1 text-left text-[var(--text)] font-medium bg-transparent border-0 cursor-pointer"
              >
                <span>{uiText("Legal")}</span>
                <span className="text-[11px] text-[var(--muted)]">{openSection === "legal" ? '▴' : '▾'}</span>
              </button>
              {openSection === "legal" && (
                <div className="pl-3 py-1 space-y-1.5 text-[12px] text-[var(--muted)]">
                  <div><button onClick={() => onOpenLegal && onOpenLegal('privacy')} className="p-0 bg-transparent border-0 text-inherit cursor-pointer">{uiText("Privacy")}</button></div>
                  <div><button onClick={() => onOpenLegal && onOpenLegal('terms')} className="p-0 bg-transparent border-0 text-inherit cursor-pointer">{uiText("Terms")}</button></div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-dashed border-[var(--border)] font-tech text-[9.5px] text-[var(--faint)] text-center">{uiText("Free · no sign-up · default ")}{RETENTION_HOURS}{uiText("-hour file retention")}</div>
        </div>
        <div className="mb-28" aria-hidden="true" />
      </div>
    </footer>
  );
}
