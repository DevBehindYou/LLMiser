'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { DEFAULT_LOCALE, translateMessage } from '../../lib/i18n/core';

export const EMPTY_MESSAGES = Object.freeze({});
export const I18nContext = createContext({ locale: DEFAULT_LOCALE, messages: EMPTY_MESSAGES, pending: false, setLocale: () => {}, blog: false });

export function useI18n() {
  const context = useContext(I18nContext);
  const uiText = useCallback((text, params) => translateMessage(context.messages, text, params), [context.messages]);
  const number = useCallback((value, options) => new Intl.NumberFormat(context.locale, options).format(value), [context.locale]);
  return { ...context, uiText, number };
}

export function EnglishContent({ children }) {
  const value = useMemo(() => ({ locale: DEFAULT_LOCALE, messages: EMPTY_MESSAGES, pending: false, blog: true, setLocale: () => {} }), []);
  return <I18nContext.Provider value={value}><div lang="en-US" className="contents">{children}</div></I18nContext.Provider>;
}
