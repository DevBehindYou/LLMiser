export const TIP_PROMPT = Object.freeze({
  enabled: true,
  url: 'https://ko-fi.com/devbehindyou',
  firstShowAt: 3,
  showDelayMs: 1500,
  supportDays: 90,
  alreadySupportedDays: 7,
});

const KEY = 'llmiser_tip_prompt_v1';
const SESSION_KEY = 'llmiser_tip_prompt_shown';

function read(storage) {
  const state = JSON.parse(storage.getItem(KEY) || '{}');
  return {
    successes: Number.isSafeInteger(state.successes) ? Math.max(0, state.successes) : 0,
    shownAt: Number.isFinite(state.shownAt) ? state.shownAt : null,
    hiddenUntil: Number.isFinite(state.hiddenUntil) ? state.hiddenUntil : 0,
  };
}

const day = time => new Date(time).toDateString();

/** Store only a count and timestamps. Both stores must be available to show. */
export function createTipPrompt({ storage, session, now = Date.now, config = TIP_PROMPT }) {
  function eligible(state, time) {
    return config.enabled && !session.getItem(SESSION_KEY) && state.successes >= config.firstShowAt &&
      state.hiddenUntil <= time && (state.shownAt === null || day(state.shownAt) !== day(time));
  }
  return {
    recordSuccess() {
      if (!config.enabled) return false;
      try {
        const state = read(storage);
        state.successes = Math.min(config.firstShowAt, state.successes + 1);
        storage.setItem(KEY, JSON.stringify(state));
        return true;
      } catch { return false; }
    },
    canShow() {
      try { return eligible(read(storage), now()); } catch { return false; }
    },
    markShown() {
      try {
        const state = read(storage), time = now();
        if (!eligible(state, time)) return false;
        session.setItem(SESSION_KEY, '1');
        storage.setItem(KEY, JSON.stringify({ ...state, shownAt: time }));
        return true;
      } catch { return false; }
    },
    snooze(action) {
      if (!config.enabled) return;
      try {
        const state = read(storage), time = now();
        const until = new Date(time);
        if (action === 'dismiss') {
          until.setDate(until.getDate() + 1);
          until.setHours(0, 0, 0, 0);
        } else {
          until.setDate(until.getDate() + (action === 'support' ? config.supportDays : config.alreadySupportedDays));
        }
        storage.setItem(KEY, JSON.stringify({ ...state, hiddenUntil: until.getTime() }));
      } catch { /* The card still closes when storage becomes unavailable. */ }
    },
  };
}
