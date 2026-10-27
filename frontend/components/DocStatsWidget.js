'use client';
import { useI18n } from './i18n/I18nContext';


import React, { memo, useMemo } from 'react';

import { calculateDocStats } from '../lib/documentStats';
export { calculateDocStats } from '../lib/documentStats';

/**
 * DocStatsWidget
 * A small status widget for the reader or header displaying live statistics
 * for the processed document.
 */
function DocStatsWidget({ content = '', tokensEst = null, compact = false }) {
  const { uiText, locale } = useI18n();

  const stats = useMemo(() => calculateDocStats(content), [content]);
  const displayTokens = tokensEst != null ? tokensEst : stats.tokens;

  if (!content) {
    return (
      <div className="font-tech text-[10.5px] text-[var(--faint)] flex items-center gap-2">
        <span className="opacity-60">{uiText("0 tokens")}</span>
        <span>·</span>
        <span className="opacity-60">{uiText("0 chars")}</span>
        <span>·</span>
        <span className="opacity-60">{uiText("0 min read")}</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--border-3)] bg-[var(--surface-2)] font-tech text-[10.5px] text-[var(--muted)] shadow-xs select-none"
        title={uiText("{v0} words · {v1} lines", { v0: stats.words.toLocaleString(locale), v1: stats.lines.toLocaleString(locale) })}
      >
        <span className="text-amber-500 font-bold">⚡</span>
        <span className="text-[var(--text)] font-semibold">
          {displayTokens.toLocaleString(locale)}
        </span>
        <span className="text-[var(--faint)]">{uiText("tok (est.)")}</span>
        <span className="text-[var(--border-3)]">|</span>
        <span>{stats.characters.toLocaleString(locale)}{uiText(" ch")}</span>
        <span className="text-[var(--border-3)]">|</span>
        <span className="text-emerald-500 dark:text-emerald-400">⏱ {uiText(stats.readingTime)}</span>
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-3)] bg-[var(--surface)] font-tech text-[11px] text-[var(--muted)] select-none shadow-2xs"
      title={uiText("{v0} words · {v1} lines", { v0: stats.words.toLocaleString(locale), v1: stats.lines.toLocaleString(locale) })}
    >
      <div className="flex items-center gap-1 text-[var(--text)] font-medium">
        <span className="text-amber-500">⚡</span>
        <span>{displayTokens.toLocaleString(locale)}</span>
        <span className="text-[var(--faint)] text-[9.5px]">{uiText("tokens (est.)")}</span>
      </div>

      <span className="text-[var(--border-3)]">·</span>

      <div className="flex items-center gap-1">
        <span>{stats.characters.toLocaleString(locale)}</span>
        <span className="text-[var(--faint)] text-[9.5px]">{uiText("chars")}</span>
      </div>

      <span className="text-[var(--border-3)]">·</span>

      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <span>⏱</span>
        <span>{uiText(stats.readingTime)}</span>
      </div>

      <div className="hidden sm:flex items-center gap-1 ml-auto text-[var(--faint)] text-[9.5px]">
        <span>{stats.words.toLocaleString(locale)}{uiText(" words")}</span>
      </div>
    </div>
  );
}

export default memo(DocStatsWidget);
