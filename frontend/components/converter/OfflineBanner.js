'use client';
import { useI18n } from '../i18n/I18nContext';


import React, { memo } from 'react';

function OfflineBanner({ queueCount, onRetry }) {
  const { uiText } = useI18n();

  return (
    <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-300 dark:border-rose-900/60 px-4 py-2 flex items-center justify-between text-[12.5px] font-sans">
      <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
        <span>✕</span>
        <span>{uiText('Cannot reach the converter. Files safe in your queue: {v0}.', { v0: queueCount })}</span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="border-[1.5px] border-rose-400 dark:border-rose-700 rounded-full px-3 py-0.5 text-rose-800 dark:text-rose-200 font-tech text-[11px] hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer bg-transparent"
      >{uiText("Retry")}</button>
    </div>
  );
}

export default memo(OfflineBanner);
