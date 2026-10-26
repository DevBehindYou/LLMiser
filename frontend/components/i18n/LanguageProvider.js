'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DEFAULT_LOCALE, LANGUAGE_KEY, validLocale, isBlogPath, translateMessage } from '../../lib/i18n/core';
import { I18nContext, EMPTY_MESSAGES as EMPTY } from './I18nContext';

const loaders = {
  de: () => import('../../lib/i18n/messages/de.json'),
  ja: () => import('../../lib/i18n/messages/ja.json'),
  es: () => import('../../lib/i18n/messages/es.json'),
  ru: () => import('../../lib/i18n/messages/ru.json'),
  'zh-CN': () => import('../../lib/i18n/messages/zh-CN.json'),
};

export default function LanguageProvider({ children }) {
  const pathname = usePathname();
  const blog = isBlogPath(pathname);
  const [requested, setRequested] = useState(DEFAULT_LOCALE);
  const [loaded, setLoaded] = useState({ locale: DEFAULT_LOCALE, messages: EMPTY });
  useEffect(() => {
    try { setRequested(validLocale(localStorage.getItem(LANGUAGE_KEY))); } catch { /* Preferences remain usable without storage. */ }
    const changed = event => { if (event.key === LANGUAGE_KEY || event.key === null) setRequested(validLocale(event.newValue)); };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);
  useEffect(() => {
    let active = true;
    if (blog || requested === DEFAULT_LOCALE) { setLoaded({ locale: DEFAULT_LOCALE, messages: EMPTY }); return () => { active = false; }; }
    loaders[requested]().then(module => { if (active) setLoaded({ locale: requested, messages: module.default }); })
      .catch(() => { if (active) { setRequested(DEFAULT_LOCALE); setLoaded({ locale: DEFAULT_LOCALE, messages: EMPTY }); } });
    return () => { active = false; };
  }, [requested, blog]);
  const setLocale = useCallback(value => {
    const locale = validLocale(value); setRequested(locale);
    try { localStorage.setItem(LANGUAGE_KEY, locale); } catch { /* In-memory selection still works. */ }
  }, []);
  const locale = blog ? DEFAULT_LOCALE : loaded.locale;
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => {
    if (blog) return;
    const title = pathname === '/privacy' ? 'Privacy Policy' : pathname === '/terms' ? 'Terms of Service' : pathname === '/llmiser-controller' ? 'LLMiser controller' : pathname === '/usecase' ? 'Optimize LLM Costs with AI-Ready Documents' : 'LLMiser: Free LLM Cost Optimizer for Documents';
    document.title = translateMessage(loaded.messages, title) + (pathname === '/' ? '' : ' | LLMiser');
  }, [pathname, blog, loaded]);
  const value = useMemo(() => ({ locale, messages: blog ? EMPTY : loaded.messages,
    pending: !blog && requested !== loaded.locale, requested: blog ? DEFAULT_LOCALE : requested, setLocale, blog }), [locale, loaded, requested, setLocale, blog]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
