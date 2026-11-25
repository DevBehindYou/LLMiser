export function isControllerPath(pathname) {
  return /^\/(?:llmiser|mdify)-controller(?:\/|$)/i.test(pathname);
}

export function recordPixelView(origin, pathname) {
  if (origin !== 'https://llmiser.devbehindyou.com' || !pathname || isControllerPath(pathname)) return;

  // Request the pixel afresh on client-side navigation without disclosing the page URL.
  return fetch('https://um2.us/p/sp7kC2aQv', {
    mode: 'no-cors',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    cache: 'no-store',
  }).catch(() => {}); // A blocked analytics request must not interrupt navigation.
}
