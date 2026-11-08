---
title: "7 Things to Remove Before Sharing a Codebase With AI"
slug: "prepare-codebase-for-ai"
description: "Prepare a codebase for AI review by removing secrets, private data, dependencies, build output and stale copies while keeping the source, tests and manifests."
excerpt: "Zip a sharing copy, not your working folder. Here are the seven things to take out first, and what a test run showed slipping past name-based rules."
date: "2026-11-08"
author: "DevBehindYou"
category: "GUIDE"
tags: ["Code review", "AI context", "Secrets", "ZIP to Markdown", "Sharing code"]
primaryKeyword: "prepare codebase for AI"
secondaryKeywords: ["share code with AI", "codebase sharing copy", "what to exclude from AI context"]
banner: "/blog/prepare-codebase-for-ai/banner.svg"
bannerAlt: "LLMiser banner reading Share the code, not the .env. A project file tree on a paper card has a .env file, a log and a backup ZIP crossed out, while source, tests and manifests are kept and packed into a small sharing copy."
featured: false
draft: true
---

**TL;DR:** Before you zip a project for an AI assistant, build a separate sharing copy and remove seven things: secrets, private data, installed dependencies, build output, caches, large binaries and stale duplicates. Keep the source, tests and manifests the task needs. LLMiser skips some of these by name, but a renamed secret file still gets through, so check the copy yourself.

You can't take a file back once an AI tool has read it. That's why the safest way to **prepare a codebase for AI** is to never upload your working folder at all. You build a sharing copy for one task and remove what the reviewer doesn't need.

To see what slips through, we zipped a small synthetic project with fake keys, a log, a customer export and the usual clutter, then ran it through LLMiser's own archive code. Its name-based rules caught the obvious files. A renamed config, a log and an old backup still landed in the output.

## Start with a sharing copy, not your working folder

A sharing copy is a fresh folder that holds only what one task needs. You build it by copying, removing and checking, so your real project, its history and your local files never leave your machine.

Name the task first, because it decides what stays. Ours was "fix the rounding bug in invoice totals." That needs the totals module, the command that calls it, its test, the manifests and a README. Nothing else.

Don't lean on `.gitignore` for this. Git's own documentation says a [gitignore file specifies intentionally untracked files](https://git-scm.com/docs/gitignore) that Git should ignore, and that files already tracked are not affected. It shapes commits. It has no say over what you drag into a ZIP. `git archive` is closer, since it [creates an archive of files from a named tree](https://git-scm.com/docs/git-archive), but anything that was ever committed to that tree comes along, secrets included.

![Seven numbered cards: secrets, private data and logs, installed dependencies, build output, caches and temp files, large binaries and old copies, each with its example file, plus a card listing what to keep.](/blog/prepare-codebase-for-ai/seven-removals.svg "The seven removals, each with the file that represented it in our synthetic test project. Illustration.")

Designing a full ingestion flow instead of a one-off review? Our [document to LLM pipeline](/blog/document-to-llm-pipeline) guide covers that bigger picture.

## 1. Secrets and local credentials

Remove every file that holds a password, token or key, including copies with unusual names. Treat any credential that reaches an AI tool as exposed. The only reliable fix after that is to replace it.

The usual suspects are `.env` files, private keys, cloud credential files and a token pasted into a Git remote URL. LLMiser's ZIP mode lists files named like credentials, such as `.env`, private keys and `credentials.json`, without reading them. It never converts the `.git` folder either.

That rule looks at names, not contents. In our test, `config/settings.local.yaml` held the same fake payment key as `.env`, and it went straight into the Markdown. The same rule also skipped `.env.example`, so list your variable names in the README if the reviewer needs them.

If a real secret was ever shared, rotate it before anything else. GitHub's guidance on [removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) says the first step is to revoke or rotate the secret, because a rotated secret can no longer be used.

## 2. Private data and identifying logs

Take out logs, data exports and screenshots that identify people. They rarely help with a code question, and they carry exactly the details you'd never paste into a chat on purpose, like names, email addresses and IP addresses.

Our fixture had three of them. The log held two customer email addresses and an IP address, and a CSV export listed names, emails and cities. LLMiser converted both, the CSV into a tidy Markdown table.

Screenshots are the sneaky one. When you upload a ZIP to LLMiser, images inside it go through text recognition, up to 50 per archive. We ran the fake checkout screenshot through LLMiser's text recognition code on its own, and it returned the customer's name, email address and invoice total as plain text.

If the bug depends on data, write a tiny synthetic sample instead. LLMiser's [privacy policy](/privacy) asks the same thing: documents can contain personal data about other people, so upload only what you need converted.

## 3. Installed dependency directories

Remove `node_modules`, virtual environments and vendored package folders, but keep the manifests and lockfiles that describe them. The reviewer needs to know which versions you run, not read the source of every package.

Installed packages can run to thousands of files. LLMiser lists folders such as `node_modules`, `.venv`, `venv` and `vendor` in its project index without converting them. They still count toward the upload, though, and a ZIP is capped at 15 MB and 2,000 files.

Keep `package.json`, `pyproject.toml` and their lockfiles. In our reviewed copy, both lockfiles were converted as text, showing the exact versions of `left-pad` and `babel` without one installed file. Asking about a patched vendored package? Keep that one folder and say why.

## 4. Generated build output

Delete build folders, compiled bundles and packaged releases from the copy. They're produced from your source, so they add size without adding information, and a stale build can contradict the code you're asking about.

Think `dist`, `build`, `out`, `target`, `bin` and `obj`. Our fixture's `build/lib` folder held an older generated copy of the totals module, the kind of file that sends a reviewer chasing a bug you already fixed. LLMiser skipped it because it sat under `build`.

Watch the reverse case too. These rules match folder names anywhere in the path, so a real source folder called `bin`, `out` or `env` gets skipped as well. Rename it in the copy or confirm the gap is deliberate.

## 5. Caches and temporary files

Clear tool caches, test artifacts and scratch notes before you zip. Caches are noise. Temporary files are where people paste things they'd never commit, like a key they were testing or a customer's email.

LLMiser skipped `__pycache__` and `.pytest_cache` by folder name. It did not skip `tmp/debug-notes.txt`, because a text file in a folder called `tmp` looks like any other note. That file held the fake key and a customer's email, and both went into the output.

Sweep up editor swap files, `.DS_Store` files and coverage reports while you're there.

## 6. Irrelevant large binaries

Leave out videos, datasets, archives and design files unless the task is about them. They can't be read as code, they eat into upload limits, and images may turn into text you never meant to share.

LLMiser skipped our fake screen recording as a binary file, so it added nothing to the Markdown. It still had to be uploaded first, and every ZIP has to fit within 15 MB. LLMiser also stops converting entries once the unpacked contents pass 100 MB.

Images are different. In an uploaded ZIP they go through text recognition, so a folder of UI screenshots becomes pages of recognized text. Keep a screenshot only when it shows the actual problem.

## 7. Duplicate or obsolete copies

Keep one version of each file. Old copies, "(copy)" files and backup archives make the model guess which code is current, and backups often hold secrets you already removed from the main tree.

Our fixture had `totals_old.py`, `totals (copy).py` and a September backup ZIP. LLMiser converted both copies. Because it also opens one level of ZIP files nested inside an upload, it converted the backup's `settings.old.yaml`, older fake key and all.

Delete the extra copies. If history matters, add one line to the README, like "the old version rounded a float total once."

## Check the copy before you send it

Removal is a judgment call, so finish with a check rather than a hope. Run the tests in the copy, search it for secrets, then read the conversion's skipped list to confirm every gap is one you meant.

![A decision diagram. Start: a file in the project folder. Question: would the reviewer need it to understand or run this task? Yes leads to keep it, then scan it. No leads to leave it out of the sharing copy.](/blog/prepare-codebase-for-ai/keep-or-remove.svg "Keeping a file isn't the end of the review. Kept config can still hold a secret. Illustration.")

Run the tests inside the copy first. Ours failed for the right reason, the rounding bug, which proved the copy had everything needed to reproduce it. Then search the copy for words like `key`, `token`, `password` and `secret`, and for the `@` of an email address.

After converting, open the project index. Its skipped table shows every file LLMiser listed but didn't convert, and why. Each entry should be one you expected.

![Two columns. Original folder: credential and dependency files skipped by name, but a renamed config, the log, the customer CSV, debug notes, old copies and a backup converted. Reviewed copy: 13 files with no fake values.](/blog/prepare-codebase-for-ai/fixture-comparison.svg "Local run of LLMiser's archive code on a synthetic project, 8 November 2026. All keys and addresses are fake.")

The comparison was clear on this small project. The original's Markdown carried four lines with fake credentials, two customer rows and three more lines with email addresses. The reviewed copy carried none of them, and it fell from 484 words to 289. Real projects will differ, so measure your own.

![Checklist: run the tests in the copy, search for secret words and at signs, keep one version of each file, read the skipped list, stay under 15 MB and 2,000 files. Rotate any secret that leaked.](/blog/prepare-codebase-for-ai/final-check.svg "A final pass before you send the copy anywhere. Illustration.")

LLMiser's [use cases](/usecase) cover where conversion helps and where it doesn't. The review stays yours.

## Frequently Asked Questions

### Does LLMiser remove secrets from my code automatically?

No. Its ZIP mode skips files named like credentials, such as `.env` files and private keys, and never converts the `.git` folder. It doesn't scan the contents of other files, so a key inside a renamed config or a note still gets converted.

### Isn't .gitignore enough to keep secrets out?

No. It tells Git which untracked files to ignore. It doesn't affect tracked files or a ZIP you build from the folder.

### Should I remove tests before I share code with AI?

Keep the tests that cover the code you're asking about. A failing test is often the clearest description of a bug, and it lets the reviewer check a fix. Drop unrelated suites and fixtures with real data.

### Should I keep lockfiles in a sharing copy?

Usually yes. A lockfile pins the exact versions you run, which matters when a bug depends on a library's behavior. It's text, so it's cheap compared with the installed packages it describes.

### What should I do if I already shared a real API key?

Revoke or rotate it first, then clean up. GitHub's guidance puts rotation first because a rotated secret can no longer be used. Deleting the chat afterwards doesn't undo the exposure.

### How large can a project ZIP be in LLMiser?

An uploaded ZIP can be up to 15 MB and hold at most 2,000 files. LLMiser converts up to 100 MB of unpacked content, opens one level of nested ZIP files and reads text from up to 50 images per archive. Entries past those limits are listed with a reason instead of converted.

When your sharing copy is ready, [convert the ZIP with LLMiser](/) and read the skipped list before you paste anything.
