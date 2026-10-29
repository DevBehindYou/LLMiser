# Bundled app fonts

Inter, JetBrains Mono and Patrick Hand are self-hosted here under the accompanying SIL Open Font License files. `app/fonts.css` retains the original 25 face declarations, Unicode ranges, font-display settings, weights and fallback metrics; only family names and local asset URLs changed. The 16 WOFF2 files are byte-identical to those emitted by the successful Next.js 14.2.35 build of `2f2afb029cfb138288f4c1ccde7913c3f4b76f08`. `manifest.json` records their SHA-256 digests.

There are three Latin preloads (93,996 bytes combined). Other subsets load on demand through Unicode ranges, as before. Japanese and Chinese retain the existing system-font fallback rules. Builds and visitors do not need Google's font endpoints. Do not replace these files silently or change subsets/metrics without reviewing typography and multilingual coverage.

`/fonts/v1/` is immutable and cached for one year, matching the previous generated static-font caching. Any future changed font bytes must use a new version directory and matching CSS/preload URLs; never overwrite a cached `v1` asset.

Official license texts are pinned from Google Fonts revision `6157dfaa640ca5738b4d1a7070fe389c3036d7fc`:

- [Inter](https://github.com/google/fonts/tree/6157dfaa640ca5738b4d1a7070fe389c3036d7fc/ofl/inter)
- [JetBrains Mono](https://github.com/google/fonts/tree/6157dfaa640ca5738b4d1a7070fe389c3036d7fc/ofl/jetbrainsmono)
- [Patrick Hand](https://github.com/google/fonts/tree/6157dfaa640ca5738b4d1a7070fe389c3036d7fc/ofl/patrickhand)

Reason: the controller pagination preview exposed a Google-font URL that Next.js 14.2.35's loader could not parse (`loader.js` extension regex returned null). Bundling the existing files removes that build-time network/URL-format dependency without upgrading the framework or changing the app's fonts.
