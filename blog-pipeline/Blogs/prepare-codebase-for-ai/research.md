# M01 research: prepare-codebase-for-ai

Researched 8 November 2026 (UTC) for the draft dated 2026-11-08. Observations are kept separate from conclusions.

## Access and method limits

| Source type | Status on 2026-11-08 |
| --- | --- |
| Google, Bing, Brave, DuckDuckGo result pages | NOT ACCESSED. Direct requests from this cloud session were refused by the environment proxy (HTTP 403 on CONNECT) for all four engines. Automated SERP scraping was not attempted by other means. No named-engine audit exists for M01. |
| Semrush, Ahrefs, Google Keyword Planner | NOT AVAILABLE. No credentials or supplied export. Volume and difficulty stay null and UNMEASURED. |
| Web search tool | USED. Claude Code WebSearch tool, provider not specified by the tool, US results. Labelled "unspecified-provider web search" below. It is not a Google or Bing audit. |
| AI answer inspection | NOT PERFORMED. |
| Primary documentation | Read directly after the owner-approved LLMiser environment allowed git-scm.com, docs.github.com and cheatsheetseries.owasp.org. |
| Product evidence | Repository code at 06261c1 (application code identical to 8eb8c509) plus a local code-level run of the archive and OCR backends on a synthetic fixture. Not a live production conversion. |

## Query observations (unspecified-provider web search, 2026-11-08, US)

| Query | Observed result URLs (selection, in returned order) | Observed intent |
| --- | --- | --- |
| `prepare codebase for AI` | thericestack.substack.com/p/building-ai-first-codebases; learn.ryzlabs.com/ai-coding-assistants/how-to-prepare-your-codebase-for-ai-coding-assistants-in-2-hours; speakeasy.com/blog/making-ai-control-plane-ai-friendly; dev.to/137foundry/how-to-prepare-a-legacy-codebase-for-ai-assisted-refactoring-18k5; buildwithdc.substack.com/p/your-code-base-isnt-ready-for-ai; hackernoon.com/how-to-make-your-repository-ready-for-ai-coding-agents | Mostly "make a repository AI-agent ready": structure, AGENTS.md or CLAUDE.md files, tests, docs, one check command. Few results discuss removing files before sharing. |
| `what files to remove before sharing code with ChatGPT or Claude secrets node_modules` | techhub.iodigital.com/articles/cursorignore-file; levelup.gitconnected.com/keeping-your-git-repositories-safe-and-clean-...; itbrief.co.uk/story/claude-code-can-leak-secrets-in-public-npm-packages; dev.to/rentierdigital/...; theneuralbase.com (Copilot/Cursor/Claude Code sensitive-file pages); playbook.sparkfabrik.com/ai-development/security | Exclusion of .env, keys and credential files, node_modules as size/noise, history still holding secrets, scanners. Mostly blogs and vendor-style guides. |
| `exclude files from AI coding assistant context .env secrets ignore file` | kiro.dev/docs/kiroignore; cursor.com/help/customization/ignore-files; dev.to/subprime2010/claude-code-claudeignore-...; sourcecraft.dev/.../codeassistantignore; fast.io/resources/cline-clineignore-guide | Tool-specific ignore files (.cursorignore, .kiroignore, .clineignore and similar) for IDE assistants. |

## Conclusions for the draft

1. The reserved primary phrase "prepare codebase for AI" shows a mixed intent in this one observation: many results are about restructuring a repository for coding agents, not about building a sharing copy. The title and outline are owner-selected, so the article keeps them and states its angle in the first two sentences (a sharing copy for one task). The phrase stays a hypothesis. Search Console data after release should decide whether the primary needs revisiting. Logged against R05 and R08.
2. IDE ignore-file configuration is a separate task with its own tool documentation. It is excluded from scope and not used as a secondary keyword.
3. The "remove before sharing" result set supports the seven-item outline: secrets, node_modules, logs and history recur. No result showed a test of what a converter does with renamed secrets, so the original fixture adds information the observed pages did not.
4. Nearest owners: M10 (reading the index and manifest after conversion) and E08 (full pipeline). The draft mentions the skipped list in one paragraph and links E08 once. No duplicate ZIP-to-Markdown guide.

## Product facts checked in code (revision 06261c1)

- `backendZ/app/archive.py` `SKIP_DIRS`: node_modules, .git, .hg, .svn, dist, build, out, vendor, .venv, venv, env, __pycache__, .pytest_cache, .mypy_cache, coverage, .next, .nuxt, .idea, .vscode, target, bin, obj, .gradle, .terraform, bower_components. Entries under these names are listed with "dependency or build folder (smart project mode)" and not converted. Matching is by any folder segment name.
- `SENSITIVE` regex: `.env` and `.env.*`, id_rsa/dsa/ecdsa/ed25519, *.pem/key/p12/pfx/kdbx/keystore/jks, .npmrc, .pypirc, .netrc, .git-credentials, credentials(.json), secret(s).json/yaml/yml/toml. Name only. Listed as "may contain credentials, not converted".
- Limits: 2,000 files (archive rejected above it), 100 MB uncompressed (entries beyond are skipped), 15 MB per entry, 10 MB per image, ratio 100:1, one nested ZIP level (max 10), 50 images for text recognition, 40 MB output, 100 s. Upload size: 15 MB for documents and ZIPs (`frontend/lib/formats.js`, UI says MB, code is 15 MiB).
- Production archive processing calls `process_archive(..., ocr_available=True)` (`backendZ/app/archive_tasks.py` line 210): images inside an uploaded ZIP become OCR work items. The local multipart fallback lists them without OCR.
- Privacy: uploads go to the service, default 48-hour deletion, documented exceptions; the policy asks users to "upload only what you need converted" (`frontend/lib/legal/policies.js`).
