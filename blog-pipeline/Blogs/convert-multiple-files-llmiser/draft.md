---
title: "How to Convert Multiple Files With LLMiser"
slug: "convert-multiple-files-llmiser"
description: "LLMiser batch conversion step by step: check limits, add up to 20 files, choose a profile, read each file's outcome and retry failures without redoing the rest."
excerpt: "A batch isn't one job, it's up to 20 separate ones. Here's how to add files, read each outcome and recover the ones that fail."
date: "2026-11-08"
author: "DevBehindYou"
category: "GUIDE"
tags: ["LLMiser", "Batch conversion", "Markdown", "Document conversion", "Workflow"]
primaryKeyword: "LLMiser batch conversion"
secondaryKeywords: ["convert multiple files to Markdown", "batch document conversion"]
banner: "/blog/convert-multiple-files-llmiser/banner.svg"
bannerAlt: "LLMiser banner reading One batch, many outcomes. A queue of six files on a paper card, five marked done and one marked with an error and a retry link."
featured: false
draft: true
---

**TL;DR:** LLMiser converts up to 20 files per batch, but each file is its own job with its own result. Check the limits first, add files by picker or drag-and-drop, pick a profile, press Convert all, then read each file's status. One failed file doesn't stop the others, so retry or remove it without converting the rest again.

A batch looks like one action and behaves like many. That's good news when something goes wrong, because one bad file doesn't sink the other nineteen.

This guide walks through **LLMiser batch conversion** from start to finish. We fed the real queue code an awkward selection of 27 files and ran a mixed batch of six files through LLMiser's converters, so each step shows what actually happens rather than what should.

## 1. Choose supported files and check limits

Pick files LLMiser can read and that fit its limits: up to 20 files per batch, 15 MB per document or ZIP and 10 MB per image. Files that break a rule are skipped before upload, with a short notice.

Supported documents are PDF, DOCX, PPTX, XLSX, XLS, EPUB, HTML, CSV, TSV, JSON, XML, TXT and Markdown. Images can be PNG, JPG, WebP, TIFF, BMP or GIF. A ZIP of a project or folder is one file in the queue and becomes one combined result.

Older Office formats like .doc and .ppt aren't supported. Save them as .docx or .pptx first. Empty files are rejected too, and so are files whose content doesn't match their extension, though that last check happens on the server.

![A six-step flow: choose supported files, add them by picker or drag-and-drop, pick a profile and press Convert all, read each file's status, review and download results, handle failures by retry or remove.](/blog/convert-multiple-files-llmiser/batch-flow.svg "The batch workflow, step by step. Illustration.")

## 2. Add files through the picker or drag-and-drop

Drop files onto the converter or choose them with the file picker. LLMiser checks each file as it joins the queue, adds the ones that pass and tells you how many it skipped and why.

We tested the queue code with 27 files at once. It added 20. It rejected four: a .doc file, an empty text file, a 16 MB PDF and an 11 MB photo. It skipped one file whose name was already in the queue, and two more because the queue was full.

![What the queue code did with 27 selected files: 20 added, four rejected with their reasons (unsupported .doc, empty file, PDF over 15 MB, image over 10 MB), one duplicate name skipped, two over the 20-file limit.](/blog/convert-multiple-files-llmiser/queue-intake.svg "Local run of LLMiser's queue code with 27 file entries, 8 November 2026. No files were uploaded.")

The notice summarized it in one line: four files skipped as unsupported or too large, one already in the queue, two over the limit. It didn't name the four files or say that one was simply empty. Compare the queue with your selection whenever a notice appears.

## 3. Choose a profile and start conversion

Pick an output profile, then press Convert all. LLMiser converts two files at a time in queue order, and each file uses the profile that's selected when its own conversion starts.

The four profiles are Standard, Clean, Compact and RAG-ready. Standard keeps a source note under the title, Clean removes it and extra blank lines, Compact also removes divider lines and RAG-ready adds a chunk marker before each section heading.

Because the profile is read per file, changing it partway through a batch affects only the files that haven't started yet. Set it before you press Convert all if you want one profile across the whole batch.

## 4. Read each file's outcome

Watch each row, not the batch as a whole. Every file ends as done or failed on its own, and a failed row keeps its error message so you can see what went wrong.

Our mixed batch held a Word document, a slide deck, a CSV, an invoice image, a project ZIP and a text file renamed to report.pdf. Five converted. The renamed file failed with "File content does not match the .pdf extension," and the other five weren't affected at all.

![A table of the six-file batch: refund-policy.docx done, q3-review.pptx done, quoted.csv done, invoice-clean.png done through text recognition, invoice-tool-sharing.zip done as one combined result, mislabeled-report.pdf failed because its content didn't match the extension.](/blog/convert-multiple-files-llmiser/batch-outcomes.svg "Local run of LLMiser's conversion code on six synthetic files, 8 November 2026.")

Different files take different routes. Documents are read directly, images go through text recognition and ZIPs are unpacked into one combined result with a project index. A long scan can take noticeably longer than a short text file in the same batch.

## 5. Review and download results

Open each result before you use it. Every converted file becomes its own Markdown document in the reader, so you can check, edit and export them one at a time or together.

Select a file in the list to show its result. Copy and the .md download act on the result you're viewing, while the .zip download packs every result in the batch. A ZIP you uploaded comes back as one combined document for the whole project.

Editing, previews and the difference between the converted original and your edits have their own details. For this guide, the rule is simple: read each result before it goes into a prompt, because a file can convert successfully and still need fixes.

## 6. Handle failures without assuming all succeeded

Count the done rows before you move on. A batch that finished isn't a batch that succeeded, and LLMiser lets you retry or remove a failed file without converting the others again.

Hover over a failed row's retry link to read its error message, then fix the cause. A mismatched extension needs the right file, an oversized file needs splitting and a network error usually just needs another try. The row's retry link sends that one file again.

![A decision diagram. Start: the batch has finished. Question: is every file marked done? Yes: review each result. No: read the failed row's message. Then fix and retry, or remove the file.](/blog/convert-multiple-files-llmiser/failure-decision.svg "Treat each failed row on its own. Illustration.")

If a file can't be fixed, remove it so the batch's results match what you actually have. Uploaded files are kept for 48 hours by default, as the [privacy policy](/privacy) explains, so convert what you need and keep your own copies.

For a quick overview of what LLMiser does and doesn't do, see the [use cases page](/usecase).

## Frequently Asked Questions

### How many files can I convert at once with LLMiser?

Up to 20 files per batch. Documents and ZIP files can be up to 15 MB each, and images up to 10 MB. Files over the limits, empty files and unsupported formats are skipped when you add them.

### Does one failed file stop the whole batch?

No. Each file converts as its own job. In our test, a renamed text file failed while the other five files in the batch converted normally.

### Can I use different profiles for different files?

Yes, indirectly. Each file uses the profile selected when its conversion starts, so you can convert some files, change the profile and convert the rest. For one consistent profile, set it before pressing Convert all.

### Why were some of my files not added?

They were unsupported, empty, too large, already in the queue under the same name or over the 20-file limit. The notice gives counts, not always names, so compare the queue with your selection.

### Do I get one Markdown file per document?

Yes. Each file becomes its own result. A ZIP is the exception in a useful way: it becomes one combined result with a project index, and you can download every result in a batch as one .zip.

### Can I retry a file without converting the others again?

Yes. A failed row has its own retry link that sends only that file. Fix the cause first, such as a wrong extension or an oversized file, or remove the row if the file can't be converted.

Ready to try it? [Open the converter](/) and drop in your first batch.
