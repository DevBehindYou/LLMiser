'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { TIP_PROMPT } from '../../lib/models/tipPrompt';
import styles from './TipSupportCard.module.css';

const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

/** Lift the card above any visible export controls it would otherwise cover. */
function placeCard(card) {
  card.style.removeProperty('--tip-offset');
  const area = card.getBoundingClientRect();
  const controls = Array.from(document.querySelectorAll('[data-tip-export]'))
    .map(control => control.getBoundingClientRect())
    .filter(rect => rect.width && rect.height && rect.bottom > 0 && rect.top < window.innerHeight)
    .sort((a, b) => b.top - a.top);
  let shift = 0;
  for (const control of controls) {
    if (overlaps({ left: area.left, right: area.right, top: area.top - shift, bottom: area.bottom - shift }, control)) {
      shift = Math.max(shift, area.bottom - control.top + 8);
    }
  }
  if (area.top - shift < 8) return false;
  card.style.setProperty('--tip-offset', `${shift}px`);
  return true;
}

export default function TipSupportCard({ markShown, cancel, dismiss }) {
  const { uiText } = useI18n();
  const ref = useRef(null);
  const claimed = useRef(false);
  const [visible, setVisible] = useState(false);
  useLayoutEffect(() => {
    const card = ref.current;
    if (!placeCard(card) || (!claimed.current && !markShown())) { cancel(); return; }
    claimed.current = true;
    setVisible(true);
    const reposition = () => { if (!placeCard(card)) cancel(); };
    const observer = new ResizeObserver(reposition);
    observer.observe(card);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [markShown, cancel]);

  useEffect(() => {
    const escape = event => { if (event.key === 'Escape' && !event.defaultPrevented) dismiss('dismiss'); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [dismiss]);

  return (
    <aside ref={ref} aria-labelledby="tip-support-title" className={styles.card} style={{ visibility: visible ? 'visible' : 'hidden' }}>
      <div className={styles.content}>
        <picture>
          <source media="(prefers-reduced-motion: reduce)" srcSet="/support/llmiser-tip-banner-static@2x.png" />
          {/* The animated GIF is already sized for this card. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/support/llmiser-tip-banner.gif" srcSet="/support/llmiser-tip-banner.gif 1x, /support/llmiser-tip-banner@2x.gif 2x" alt="" width="360" height="120" className={styles.banner} />
        </picture>
        <div className={styles.heading}>
          <h2 id="tip-support-title">{uiText('Glad that worked!')}</h2>
          <button type="button" aria-label={uiText('Close')} className={styles.close} onClick={() => dismiss('dismiss')}>×</button>
        </div>
        <p>{uiText('LLMiser is free and runs on a server I pay for. If it saved you time, a small tip helps keep it online.')}</p>
        <div className={styles.actions}>
          <a className="aurora-btn" href={TIP_PROMPT.url} target="_blank" rel="noopener noreferrer" onClick={() => dismiss('support')}>{uiText('Support on Ko-fi')}</a>
          <button type="button" onClick={() => dismiss('dismiss')}>{uiText('Maybe later')}</button>
        </div>
        <button type="button" className={styles.already} onClick={() => dismiss('already-supported')}>{uiText('I already did')}</button>
      </div>
    </aside>
  );
}
