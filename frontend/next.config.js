/** @type {import('next').NextConfig} */
const SITE_URL = 'https://llmiser.devbehindyou.com';
const LEGACY_HOSTS = ['mdify.devbehindyou.com', 'mdify-app.vercel.app'];
const PUBLIC_PATHS = ['/', '/usecase', '/privacy', '/terms', '/blog/:path*', '/sitemap.xml', '/robots.txt', '/llms.txt', '/og-card.png', '/favicon.ico', '/favicon.svg', '/site.webmanifest', '/mdify-icon.png', '/mdify-icon-dark.svg', '/mdify-icon-light.svg'];
module.exports = {
  output: 'standalone',
  async redirects() {
    return [
      // Applies only when these domains are attached to the LLMiser deployment.
      // Preserve paths and query strings. API clients keep their existing origin.
      ...LEGACY_HOSTS.flatMap(host => PUBLIC_PATHS.map(source => ({
        source, has: [{ type: 'host', value: host }],
        destination: SITE_URL + source, permanent: true,
      }))),
      { source: '/mdify-controller', destination: '/llmiser-controller', permanent: true },
    ];
  },
  async headers() {
    return [
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] },
      { source: '/llmiser-controller/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] },
      { source: '/mdify-controller/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] },
    ];
  },
};
