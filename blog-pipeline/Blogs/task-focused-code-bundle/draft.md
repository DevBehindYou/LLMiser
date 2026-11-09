---
title: "Build a Task-Focused Code Bundle With Tests"
slug: "task-focused-code-bundle"
description: "Build a task focused code bundle: start from one failing test, trace its imports to the code it needs, then run the test inside the bundle to prove it's enough."
excerpt: "Too few files and the reviewer can't run anything. Too many and the question gets lost. Trace from the failing test, then prove the bundle works."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["Code review", "Testing", "AI context", "Sharing code", "Python"]
primaryKeyword: "task focused code bundle"
secondaryKeywords: ["minimal reproducible example", "trace imports from a test"]
banner: "/blog/task-focused-code-bundle/banner.svg"
bannerAlt: "LLMiser banner reading Start from the failing test. A failing test file on a paper card links to the caller, the helper and the config it imports, while unrelated modules sit outside the bundle."
featured: false
draft: true
---

**TL;DR:** To build a task-focused code bundle, name one question, start from the test that shows it, follow that test's imports to every file they reach, and add the project manifest. Then run the test inside the bundle. If it fails for the reason you're asking about, the bundle is enough. If it fails to run at all, something is missing.

Sending a whole repository to answer one question costs context and buries the question. Sending two files often leaves the reviewer staring at an import they can't see.

A **task focused code bundle** sits between those extremes, and you can test whether it's right. We built three bundles for one synthetic bug and ran its test in each. One couldn't run at all. One reproduced the bug in six files.

## Define the question

Write the question as one sentence about observable behavior, and find or write a test that shows it. The test becomes your starting point and your proof, so a vague question produces a vague bundle.

Our toy project calculates library fines. The question: "Why is a book due Friday and returned Monday charged 0.00 instead of 0.25?" A test already captured it, `test_friday_due_monday_return`, asserting that the fee is 0.25.

Compare that with "Why are fines wrong?" The vague version names no input, no output and no expectation, so it can't tell you which files matter. The specific version points straight at one function and one test.

If no test exists, write the smallest one that shows the behavior. Three lines that call the function with real inputs and assert the expected output do more for a reviewer than three paragraphs of description.

![A flow of five steps: name the question, find or write the failing test, trace its imports, add the manifest and run the test in the bundle, check that it fails for the right reason.](/blog/task-focused-code-bundle/bundle-flow.svg "Build from the test outward, then prove the bundle with the same test. Illustration.")

## Trace relevant imports and tests

Start at the test file and follow every import into your own code, then follow the imports in those files too. Stop at third-party packages, which the manifest and lockfile cover.

Our test imported `late_fee` from `fines/fines.py`. That file imported `business_days_between` from `fines/calendar.py`, plus a rate and a holiday list from `fines/config.py`. Neither of those imported anything else in the project. Adding `pyproject.toml` and the package's `__init__.py` gave six files.

![A dependency tree starting from tests/test_fines.py, leading to fines/fines.py, which leads to fines/calendar.py and fines/config.py. report.py, emailer.py, test_report.py and docs/history.md sit outside the traced set.](/blog/task-focused-code-bundle/import-trace.svg "The traced set for one failing test in the synthetic project, 9 November 2026.")

The other four files never appeared in the trace. A report module, an email helper, a second test and a page of release notes had nothing to do with the question. Leaving them out halved the converted text, from 367 words for the whole project to 164 for the traced bundle.

You can trace by hand for a small project. For a larger one, a short script that reads each file's import statements does the same job. Ours used Python's `ast` module and followed only imports of the project's own package.

Sometimes a trace pulls in a big shared module, like a utilities file imported everywhere. Keep the whole file rather than cutting it down, since a partial file raises more questions than a long one. Then name the function that matters in your question.

## Review omissions

Run the test inside the bundle before you share it. That one step proves the bundle is complete enough, and it shows the reviewer the exact failure you're asking about.

We tried an incomplete bundle first: the test and the file it imported, nothing more. The test didn't fail with the bug. It failed to start, with `ModuleNotFoundError: No module named 'fines.calendar'`. A reviewer given that bundle would spend their first answer asking for the missing file.

The traced bundle failed the right way: `assert 0.0 == 0.25`. That's the bug, reproduced in six files. The full project failed identically, which confirmed the other four files added nothing to the question.

Paste that test output into your message along with the bundle. The reviewer then starts from the same failure you saw, instead of running the code to find out what you meant.

![A comparison of three bundles. Incomplete, four files: the test can't run, a module is missing. Traced, six files: the test fails with 0.0 instead of 0.25. Whole project, ten files: the same failure with more than twice the text.](/blog/task-focused-code-bundle/bundle-results.svg "Test results in each bundle, local run on the synthetic project, 9 November 2026.")

Imports aren't the only dependencies, though. A file read at runtime, an environment variable, a fixture in a separate folder or a value loaded from a database won't appear in an import trace. If the test reads data files, add them. If it needs a setting, describe it in a README, with a placeholder instead of a real value.

When the bundle passes this check, zip it and convert it with LLMiser. The project index will list exactly the files you chose, which makes it easy to confirm nothing extra slipped in. For what conversion does and doesn't do, see the [use cases page](/usecase).

![A checklist: one question in one sentence, a failing test that shows it, every imported project file included, data files and settings added or described, test run inside the bundle, failure matches the question. Limitation: an import trace misses runtime data, settings and dynamic imports.](/blog/task-focused-code-bundle/bundle-checklist.svg "Prove the bundle before you share it. Illustration.")

## Frequently Asked Questions

### How many files should a code bundle for AI include?

As many as the failing test needs, and no more. Our example needed six of ten. There's no universal number, so let the test decide by running it inside the bundle.

### What if my bug has no test?

Write the smallest test that shows the behavior, even if it only calls one function and checks one value. It gives the reviewer something runnable and gives you a way to prove the bundle is complete.

### Should I include tests that pass?

Include the ones that cover the code in question, since they show what already works. Leave out unrelated suites. Our second test, for a report module, had nothing to do with the bug.

### Can an import trace miss files?

Yes. It finds files reached through import statements, but not data files opened at runtime, environment settings, dynamic imports or plugins loaded by name. Running the test inside the bundle is how you catch those gaps.

### Does LLMiser build the bundle for me?

No. LLMiser converts the ZIP you give it and lists every entry in a project index. Choosing which files go in, and checking that the test runs, are steps you do before uploading.

Bundle ready and test failing for the right reason? [Convert it with LLMiser](/) and share the result.
