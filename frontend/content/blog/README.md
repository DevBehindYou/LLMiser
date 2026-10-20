# Blog posts

One Markdown file per post: `{slug}.md` with the YAML frontmatter that `lib/blog.mjs`
validates (`title`, `slug`, `description` up to 170 characters, `excerpt`, `date`, `author`,
`category`, `tags`, `primaryKeyword`, optional `banner` and `bannerAlt`). The body starts
with a `**TL;DR:**` line. Banners and figures are SVG files in `public/blog/{slug}/`.
Run `npm run blog:index` after any change. The Blog dialog and `/blog/{slug}` show every
post with `draft: false`. This README is not a post.
