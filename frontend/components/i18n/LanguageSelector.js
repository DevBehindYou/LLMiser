'use client';

import { LANGUAGES } from '../../lib/i18n/core';
import { useI18n } from './I18nContext';

export default function LanguageSelector({ compact = false }) {
  const { locale, requested, setLocale, pending, blog, uiText } = useI18n();
  if (blog) return null;
  return <label className="inline-flex min-h-[44px] max-w-full shrink-0 items-center gap-1 text-[var(--text)]" aria-busy={pending}>
    <span aria-hidden="true">◎</span><span className="sr-only">{uiText('Language')}</span>
    <select aria-label={uiText('Language')} value={requested || locale} onChange={event => setLocale(event.target.value)}
      className={`${compact ? 'max-w-[100px]' : 'max-w-[155px]'} min-h-[36px] rounded-md border border-[var(--border-3)] bg-[var(--surface)] px-1 text-[11px] text-[var(--text)] font-sans`}>
      {LANGUAGES.map(language => <option key={language.code} value={language.code} lang={language.code}>{language.name}</option>)}
    </select>
    <span className="sr-only" role="status">{pending ? uiText('Loading language…') : ''}</span>
  </label>;
}
