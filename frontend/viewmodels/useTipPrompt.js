'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createTipPrompt, TIP_PROMPT } from '../lib/models/tipPrompt';

function browserPrompt() {
  try { return createTipPrompt({ storage: window.localStorage, session: window.sessionStorage }); }
  catch { return null; }
}

export function useTipPrompt(blocked) {
  const [pending, setPending] = useState(false);
  const freshResults = useRef(new Set());
  const timer = useRef(null);
  const cancel = useCallback(() => { clearTimeout(timer.current); setPending(false); }, []);
  const recordSuccess = useCallback(id => {
    if (freshResults.current.has(id)) return;
    if (browserPrompt()?.recordSuccess()) freshResults.current.add(id);
  }, []);
  const onDownloaded = useCallback(ids => {
    if (!ids.some(id => freshResults.current.has(id)) || !browserPrompt()?.canShow()) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (document.hasFocus() && !blocked.current && !document.querySelector('[aria-modal="true"], dialog[open]')) setPending(true);
    }, TIP_PROMPT.showDelayMs);
  }, [blocked]);
  const dismiss = useCallback(action => {
    browserPrompt()?.snooze(action);
    cancel();
  }, [cancel]);
  const markShown = useCallback(() => browserPrompt()?.markShown() === true, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { pending, recordSuccess, onDownloaded, cancel, dismiss, markShown };
}
