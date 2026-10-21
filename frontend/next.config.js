/** @type {import('next').NextConfig} */
const SITE_URL = 'https://llmiser.devbehindyou.com';
const ALIAS_HOSTS = ['mdify.devbehindyou.com', 'mdify-app.vercel.app', 'llmiser.vercel.app'];
// The exact blog index must precede the optional catch-all, which otherwise
// produces /blog/ and an extra redirect back to /blog.
const PUBLIC_PATHS = ['/', '/usecase', '/privacy', '/terms', '/blog', '/blog/:path*', '/sitemap.xml', '/robots.txt', '/llms.txt', '/og-card.png', '/favicon.ico', '/favicon.svg', '/site.webmanifest', '/apple-touch-icon.png', '/favicon-:asset.png', '/icon-:asset.png', '/llmiser-:asset.svg', '/llmiser-icon.png', '/mdify-icon.png', '/mdify-icon-dark.svg', '/mdify-icon-light.svg'];
module.exports = {
  output: 'standalone',
  async redirects() {
    return [
      // Applies only when these domains are attached to the LLMiser deployment.
      // Preserve paths and query strings. API clients keep their existing origin.
      ...ALIAS_HOSTS.flatMap(host => PUBLIC_PATHS.map(source => ({
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
