---
title: "Which Dependency Files Should You Keep for AI Review?"
slug: "dependency-files-ai-review"
description: "Which dependency files to keep for AI code review: manifests, lockfiles and any patched copy you import, while installed package folders stay out of the copy."
excerpt: "Drop node_modules, keep the files that say which versions you run. And if you patched a dependency, keep that copy where a converter won't skip it."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["Dependencies", "Code review", "Lockfiles", "AI context", "Sharing code"]
primaryKeyword: "dependency files for AI code review"
secondaryKeywords: ["keep lockfiles for AI", "vendored dependencies"]
banner: "/blog/dependency-files-ai-review/banner.svg"
bannerAlt: "LLMiser banner reading Keep the map, not the warehouse. A project on a paper card keeps package.json, a lockfile and a patched module, while a large node_modules folder is set aside."
featured: false
draft: true
---

**TL;DR:** When you remove installed packages from a sharing copy, keep the manifest, the lockfile and any dependency code you've patched or import directly. The manifest says what you asked for, the lockfile says what you run, and a patched copy may be the bug itself. In our test, a patched library in `vendor/` was skipped by name and never reached the converted text.

Deleting `node_modules` is the easy part of preparing code for review. The harder question is what to keep, so a reviewer still knows which versions you're running.

This guide answers that with one small synthetic project. Its bug depended on a dependency's exact behavior, and we built four sharing bundles, each keeping a little more. Choosing the right **dependency files for AI code review** decided whether the question could be answered at all.

## Separate manifests from installed packages

A project's dependencies live in two kinds of files. Manifests and lockfiles describe them in a few lines. Installed folders contain the dependencies themselves, often thousands of files. A reviewer needs the description, not the warehouse.

Our toy shop project had a `package.json` asking for `acme-money` at `^2.1.0`, a fictional library, and a `package-lock.json` pinning 2.1.4. It also had the usual `node_modules` folder with the installed copy, and a `vendor/acme-money` folder holding a locally patched copy that the code actually imported.

![Two columns. Keep: package.json for the version range, package-lock.json for the exact version, the patched copy your code imports, and a README line explaining it. Leave out: node_modules, virtual environments, package caches and build output.](/blog/dependency-files-ai-review/keep-or-leave.svg "What to keep when installed packages go. Illustration based on the test project.")

Python projects follow the same pattern. Keep `pyproject.toml` or `requirements.txt` and the lockfile, and leave out `.venv` and `site-packages`. LLMiser's ZIP mode skips common installed-package folders, such as `node_modules`, `.venv` and `vendor`, without converting them.

## Match files to the review question

Decide what the question needs, then keep the dependency files that answer it. A question about your own logic needs only the manifest, while a question about a library's behavior needs the exact version or the library's code.

Our question was why `total(2.675)` returned 2.67 instead of 2.68. The answer sits in the rounding function, and our invoice code imported it from the patched copy in `vendor/`. Without that file, a reviewer can only guess.

![A table of four bundles and what each lets a reviewer know. Source only: no version, no patch. Plus manifest: a version range, no patch. Plus lockfile: the exact version, no patch. Plus patched copy moved to patches: exact version and the code that rounds.](/blog/dependency-files-ai-review/bundle-variants.svg "Four sharing bundles built from the synthetic project, 9 November 2026.")

We built four bundles. Source and test alone said nothing about the library. Adding the manifest gave a range, `^2.1.0`, which allows any 2.x release from 2.1.0 up. Adding the lockfile gave the exact 2.1.4. Only the fourth bundle, which kept the patched rounding code, contained the line that explains the result.

That line uses JavaScript's `toFixed`, which works on the binary floating-point value, and 2.675 isn't stored exactly. We checked the behavior directly: `(2.675).toFixed(2)` returns "2.67." A reviewer with that file can see it, and one without it can't.

## Keep version context

Keep the lockfile, and keep any copy of a dependency that your code imports or that you've changed. Then make sure that copy isn't sitting in a folder your tools skip by name.

The lockfile is cheap. Ours was a few lines, and even large lockfiles are text that LLMiser converts like any other code file. If yours runs to thousands of lines, keep it anyway and quote the entries for the packages in question in your README.

Every ecosystem has its own pair. Python has `pyproject.toml` with `poetry.lock` or `uv.lock`, Ruby has `Gemfile.lock`, Rust has `Cargo.lock` and Go has `go.mod` with `go.sum`. LLMiser reads `.lock` files as text. Text files with names it doesn't recognize, like `go.sum`, convert only when they're under 1 MB, so check the index for big ones.

![A decision diagram. Start: a dependency in your project. Question: do you import or patch your own copy? Yes: keep that copy in the sharing copy, in a folder like patches rather than vendor. No: the manifest and lockfile are enough.](/blog/dependency-files-ai-review/vendor-decision.svg "A patched copy is part of your code, wherever it lives. Illustration.")

The vendored copy is the trap. When we converted the full working folder, LLMiser skipped both `node_modules` and `vendor` by folder name, so the patched `round.js` never reached the Markdown. The invoice code still imported `../vendor/acme-money/round`, pointing at a file the reader couldn't see.

In the fourth bundle, we moved the patched copy to `patches/acme-money/` and added a README line saying so. That folder name isn't on the skip list, so the patch converted with the rest of the code. Rename the folder only in the sharing copy, and say in the README where it came from.

![A checklist: manifest kept, lockfile kept, installed package folders removed, any imported or patched dependency copy kept outside skipped folders, README says where it came from and which version it patches. Limitation: LLMiser skips folders named vendor, node_modules, .venv and similar by name.](/blog/dependency-files-ai-review/dependency-checklist.svg "Check the converted output for the files your question depends on. Illustration.")

After converting, open the project index and look for your dependency files in the results. If the file your question depends on appears in the skipped table, fix the copy and convert again. For what LLMiser does and doesn't do during conversion, see the [use cases page](/usecase).

## Frequently Asked Questions

### Should I include package-lock.json when sharing code with AI?

Usually yes. It records the exact version of every dependency, which matters when a bug depends on a library's behavior. It's plain text, so it costs far less than the installed packages it describes.

### Is package.json enough without a lockfile?

Not for version questions. A manifest often holds a range like `^2.1.0`, which allows many releases. The lockfile says which one you actually installed.

### Does LLMiser skip the vendor folder?

Yes. Folders named `vendor`, `node_modules`, `.venv`, `venv`, `env` and several others are listed in the project index but not converted. If your own patched code lives there, move it in the sharing copy.

### What if my lockfile is huge?

Keep it if the question touches dependencies, since text is cheap compared with installed packages. If it's far larger than the rest of the bundle, quote the relevant entries in a README and say which file they came from.

### Should I include a library's source code?

Only when you've changed it or the question is about its internals. Otherwise the version from the lockfile and the library's public documentation are enough. Include just the files that matter, not the whole package.

Ready to build your copy? [Convert it with LLMiser](/) and check the project index for the files your question needs.
