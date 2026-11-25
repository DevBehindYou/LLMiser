'use client';

import { Analytics } from '@vercel/analytics/next';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isControllerPath, recordPixelView } from '../lib/pageViews';

// Page views are counted by the host's cookie-free web analytics (Privacy
// Policy §2–4). The admin area is never counted, and query strings and
// fragments are dropped so no parameter ever leaves the page.
function beforeSend(event) {
  const url = new URL(event.url);
  if (isControllerPath(url.pathname)) return null;
  url.search = '';
  url.hash = '';
  return { ...event, url: url.toString() };
}

export default function SiteAnalytics() {
  const pathname = usePathname();
  const lastPath = useRef(null);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    recordPixelView(window.location.origin, pathname);
  }, [pathname]);

  return <Analytics beforeSend={beforeSend} />;
}
