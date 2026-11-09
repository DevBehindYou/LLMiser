---
title: "Check a Project ZIP for Secrets Before Sharing It"
slug: "project-zip-secret-review"
description: "Check a code ZIP for secrets before sharing: scan file names and file contents, look inside nested ZIPs and images, remove what you find and recheck the copy."
excerpt: "A name scan and a content scan each missed things the other caught. Here's a review routine for a sharing copy, tested on a project full of fake secrets."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["Secrets", "Code review", "ZIP", "AI context", "Sharing code"]
primaryKeyword: "check code ZIP for secrets"
secondaryKeywords: ["review a sharing copy", "find credentials in a project"]
banner: "/blog/project-zip-secret-review/banner.svg"
bannerAlt: "LLMiser banner reading Search names. Then contents. A ZIP on a paper card feeds two lists, one of suspicious file names and one of suspicious lines, with one file found only by each."
featured: false
draft: true
---

**TL;DR:** To **check a code ZIP for secrets**, review an extracted copy twice: once by file name and once by file contents, including nested ZIPs. Each pass finds things the other misses. Remove or replace what you find, zip again and repeat both passes before you share. No pattern search is complete, so rotate any real secret that may have leaked.

Most people check a ZIP by glancing at its file list. That catches a `.env` file and misses a key pasted into a config with an innocent name.

This guide is a review routine for a sharing copy, the folder you'll actually zip and send. We ran it on a synthetic project full of fake secrets and compared two simple passes, one over file names and one over file contents. Neither was enough alone.

## Locate configuration and logs

Start by listing every file in the copy, including hidden files and the contents of any ZIP inside it. Secrets cluster in configuration, logs, scratch notes and backups, so those are where you look first.

Our test project held 33 files, plus two more inside a backup ZIP. Hidden entries mattered: the `.git/config` file held a fake token inside a remote URL, and `.env` held fake keys. The backup ZIP held an old settings file that a top-level glance would never open.

Name rules are a fast first pass. Flag `.env` files, private key names, `.pem` and `.key` files, credential files, logs, data exports, temporary and backup folders, images and anything under `.git`. Our name pass flagged 13 entries.

Check the less obvious places too. CI workflow files, Docker Compose files with environment sections and notebooks that saved their output cells can all hold tokens, even in projects that keep `.env` out of the folder.

![A six-step flow: unzip a copy, list every file including hidden and nested ones, scan file names, scan file contents, remove or replace what you find and zip again, then recheck both scans and convert.](/blog/project-zip-secret-review/review-flow.svg "A two-pass review routine for a sharing copy. Illustration.")

## Inspect an extracted sharing copy

Search the contents of every text file, not just the names. Content patterns catch secrets in files with ordinary names, and they show you exactly which line to fix.

Our content pass looked for four things: assignments to names like key, token, secret or password, email addresses, private key headers and credentials inside URLs. It flagged eight entries, and one of them the name pass had missed entirely: `config/settings.local.yaml`, a renamed copy of the `.env` file holding the same fake payment key.

![A table comparing the two passes on six files. settings.local.yaml: missed by name, found by content. id_ed25519: found by name, missed by content. screenshot-checkout.png: found by name as an image, unreadable to a text search. debug-notes.txt: found by name, content found only an email. Backup settings.old.yaml: found by both, inside a nested ZIP. .git/config: found by both, a token in a URL.](/blog/project-zip-secret-review/two-scans.svg "Local run of an illustrative review script on synthetic, fake data, 9 November 2026.")

The content pass had blind spots too. It didn't flag the private key file, because our fake key had no standard header. It couldn't read the checkout screenshot, since text in an image isn't text to a search. And in `tmp/debug-notes.txt`, a fake key pasted into a sentence slipped past the assignment pattern. The file was flagged only because it also held an email address.

That's the case for doing both passes. Names catch files that shouldn't be there at all, and contents catch secrets hiding in files that should.

## Remove sensitive material and recheck

Delete files the task doesn't need, replace secrets in files it does need with placeholders, then zip the copy again and repeat both passes. A clean recheck is the only evidence that the copy changed.

For files you keep, swap the value, not the line. `payments_api_key: REPLACE_ME` tells a reviewer the setting exists without exposing it. For files you don't need, like logs, exports, screenshots, backups and the `.git` folder, delete them from the copy.

![A decision diagram. Start: a flagged file. Question: does the task need this file? Yes: replace the secret with a placeholder. No: delete it from the copy. Then zip again and rerun both scans.](/blog/project-zip-secret-review/flagged-file-decision.svg "Every flag ends in a placeholder or a deletion, then a recheck. Illustration.")

Our reviewed copy had 13 files. The recheck flagged one: `.env.example`, a template whose empty `PAYMENTS_API_KEY=` line matched the assignment pattern. That's a false alarm, but it's still worth a look, since templates sometimes end up holding real values.

After the recheck, convert the ZIP with LLMiser and read the project index. Files named like credentials are listed there without being read, and the skipped table should hold no surprises. LLMiser doesn't scan contents for secrets, so your recheck is the step that counts.

![A checklist: every file listed, including hidden and nested ones, names scanned, text contents scanned, images and PDFs looked at by a person, secrets replaced or files deleted, both scans rerun on the new ZIP. Limitation: pattern searches miss secrets in prose, images and unusual formats, so rotate anything that may have leaked.](/blog/project-zip-secret-review/recheck-checklist.svg "Rerun the whole list on the new ZIP, not the old folder. Illustration.")

If a real secret was ever in a copy you shared, rotate it. GitHub's guidance on [removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) puts revoking or rotating the secret first, because a rotated secret can no longer be used. For what conversion does and doesn't do with your files, see the [use cases page](/usecase).

## Frequently Asked Questions

### How do I check a ZIP for secrets without extracting it?

You can list and read entries directly with a ZIP library or tool, including nested ZIPs. Our test script did that. Extracting a copy is still useful for editing, as long as you rezip from the cleaned copy.

### Why scan both file names and contents?

Each finds different problems. In our test, the content scan alone found a renamed config holding a key, while the name scan alone flagged a key file, a screenshot and duplicate copies. Together they covered more than either one.

### Can a content search find every secret?

No. Our search missed a fake key written into a sentence rather than as a `key=value` line, and it couldn't read text in an image. Treat patterns as a first pass and look at flagged files yourself.

### Should I keep .env.example in a sharing copy?

Often yes, if it only lists variable names, since it shows a reviewer which settings exist. Check that every value is empty or a placeholder. LLMiser lists `.env.*` files without converting them, so describe the variables in the README too.

### Does LLMiser check my ZIP for secrets?

No. It skips files named like credentials, such as `.env` files and private keys, without reading them, and it doesn't convert the `.git` folder. It doesn't search file contents for secrets, so review the copy before you upload it.

Done reviewing? [Convert the sharing copy with LLMiser](/) and check the project index before you send anything.
