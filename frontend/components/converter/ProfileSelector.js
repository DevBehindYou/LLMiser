'use client';
import { useI18n } from '../i18n/I18nContext';


import React, { memo } from 'react';
import { PROFILES } from '../../lib/formats';

const PROFILE_HINTS = {
  Standard: 'Clean · Compact · RAG-ready',
  Clean: 'Stripped of metadata & extra line breaks',
  Compact: 'Token-compressed, single line breaks',
  'RAG-ready': 'Heading-aligned chunks for vector embeddings',
};

function ProfileSelector({ profile, onChange }) {
  const { uiText } = useI18n();

  return (
    <div className="border border-[var(--border-3)] rounded-lg p-2.5 text-[12px] text-[var(--muted)] bg-[var(--surface-2)] flex flex-col gap-1.5 font-sans">
      <div className="flex items-center justify-between">
        <span className="font-tech text-[10px] uppercase text-[var(--faint)]">{uiText("Profile:")}</span>
        <div className="flex gap-1">
          {PROFILES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-pressed={profile === p}
              className={`tap-target border-[1.5px] rounded-full px-2 py-0.5 text-[10.5px] font-tech cursor-pointer transition-colors ${
                profile === p
                  ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)] font-semibold'
                  : 'border-[var(--border-3)] text-[var(--muted)] hover:border-[var(--text)] bg-[var(--surface)]'
              }`}
            >
              {uiText(p)}
            </button>
          ))}
        </div>
      </div>
      <div className="text-[11px] text-[var(--faint)]">{uiText(PROFILE_HINTS[profile])}</div>
    </div>
  );
}

export default memo(ProfileSelector);
