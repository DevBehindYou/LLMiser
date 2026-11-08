# M01 outline (final, as drafted 2026-11-08)

Title (owner-selected, exact): 7 Things to Remove Before Sharing a Codebase With AI
Angle: build a task-focused sharing copy; a test run shows what name-based skipping misses.
Listicle count: 7 numbered H2 sections. Intro, the two framing sections, FAQ and CTA sit outside the count.

1. TL;DR (three sentences)
2. Intro (100 words): no take-backs, sharing copy, fixture teaser
3. H2 Start with a sharing copy, not your working folder: name the task, why .gitignore and git archive are not the tool, figure seven-removals, E08 link
4. H2 1. Secrets and local credentials: name rules versus renamed config, .env.example side effect, rotate first (GitHub)
5. H2 2. Private data and identifying logs: log, CSV, screenshot through text recognition, privacy policy
6. H2 3. Installed dependency directories: listed not converted, still count toward limits, keep manifests and lockfiles
7. H2 4. Generated build output: stale generated copy, folder-name matching skips real bin/out/env folders
8. H2 5. Caches and temporary files: caches skipped, tmp notes converted
9. H2 6. Irrelevant large binaries: binary skip, upload limits, images become text
10. H2 7. Duplicate or obsolete copies: copies and one nested ZIP level converted with an old fake key
11. H2 Check the copy before you send it: figure keep-or-remove, tests, search, skipped list, figure fixture-comparison, numbers, figure final-check, /usecase
12. FAQ (6): automatic secret removal, .gitignore, tests, lockfiles, already shared a key, ZIP limits
13. CTA (one line)

## Scope exclusions (kept out deliberately)

- Step-by-step secret review of a sharing copy: M01-S1.
- Choosing dependency files for version questions: M01-S2.
- Tracing the minimal source and tests for a bug: M01-S3.
- Field-by-field reading of PROJECT_INDEX.md and manifest.json: M10.
- IDE assistant ignore files (.cursorignore and similar): separate observed intent, not covered.
- No claims about token savings in general. The only numbers are the toy fixture's measured word counts.
