---
title: "How to Read LLMiser's ZIP Index and Manifest"
slug: "llmiser-zip-index-manifest"
description: "Read the LLMiser ZIP manifest and project index: what each output holds, how paths and statuses work, and how to account for every skipped or missing file."
excerpt: "A converted ZIP returns three files, and the two small ones tell you what the big one left out. Here's how to read them, field by field."
date: "2026-11-08"
author: "DevBehindYou"
category: "GUIDE"
tags: ["LLMiser", "ZIP to Markdown", "Project index", "Manifest", "Codebase"]
primaryKeyword: "LLMiser ZIP manifest"
secondaryKeywords: ["project index", "ZIP conversion results"]
banner: "/blog/llmiser-zip-index-manifest/banner.svg"
bannerAlt: "LLMiser banner reading Every file, accounted for. A ZIP on a paper card fans out into three outputs: combined Markdown, PROJECT_INDEX.md and manifest.json, with the index showing converted and skipped counts."
featured: false
draft: true
---

**TL;DR:** When LLMiser converts a ZIP, it returns combined Markdown, a project index and a manifest. The index lists every file with its status and the reason anything was skipped. The manifest holds the same inventory as data. Read them to confirm what reached the Markdown, and what didn't, before you use it.

A ZIP conversion gives you one long Markdown document, and that's the part most people read. The two smaller files are where the useful truth lives: they say what was converted, what was left out and why.

This guide explains how to read the **LLMiser ZIP manifest** and project index, using a synthetic archive built to trip every rule. It had duplicates, a nested ZIP, images, a symbolic link, an unsafe path and a credentials file. We converted it with LLMiser's own archive and text recognition code.

## 1. Identify the returned artifacts

A converted ZIP produces three outputs: the combined Markdown, PROJECT_INDEX.md and manifest.json. The reader shows the combined Markdown, and all three original files are listed under "Original output files" for download.

The combined Markdown puts every converted file under its own heading, written as its path in backticks. Above 4 MB it's saved in numbered parts, which the reader joins automatically for preview, copy and download. The index is a readable report. The manifest is the same inventory as JSON, with no file contents.

![Three cards. Combined Markdown: every converted file under a heading with its path, split into parts above 4 MB. PROJECT_INDEX.md: summary counts, a folder tree, a results table and a skipped-and-failed table. manifest.json: the same inventory as data, with no file contents.](/blog/llmiser-zip-index-manifest/three-outputs.svg "What a converted ZIP returns. Based on LLMiser's archive code.")

The original output files are the conversion as it came from the service. If you edit the Markdown in the reader, use the .md or .zip export to save your edits, since the originals don't include them.

## 2. Read paths in the project index

Use paths, not file names, to identify files. The index lists every entry by its full path inside the archive, so two files with the same name in different folders stay distinct, and nested archives show their inner paths too.

Our archive had `src/config.txt` and `docs/config.txt` with different settings. Both converted, each under its own path heading, so a reader can tell "retries = 3" from "Set retries to 5." Files inside our nested `old.zip` appeared as `archive/old.zip/notes.txt`, with the outer archive in the path.

The index also labels names it won't use as paths. An entry named `../escape.txt` appeared as "(unsafe) ../escape.txt" and wasn't converted. A second file named `readme.md`, alongside `README.md`, appeared as "readme.md (duplicate)."

![An excerpt of the project index for the test archive. Summary: 16 files found, 9 converted, 2 images read with text recognition, 7 skipped, 0 failed. Results rows show docs and src config files converted, an unsafe path and a duplicate readme skipped.](/blog/llmiser-zip-index-manifest/index-excerpt.svg "Excerpt of PROJECT_INDEX.md from a local run of LLMiser's archive code, 8 November 2026.")

## 3. Inspect actual manifest fields

The manifest has three top-level parts: the source, the limits that applied and one record per entry. Each record holds the entry's path, depth, size, type, classification, status, engine, skip reason, language and an ID.

The `source` block names the uploaded file, its size in bytes and the number of entries found. The `limits` block records the rules in force, such as 2,000 files, one nested ZIP level and 50 images for text recognition. In a real job, `job_id` identifies the conversion.

![A manifest record for docs/config.txt with its fields: path, depth 0, size 41, node type TEXT_FILE, classification DIRECT_TEXT, status DONE, engine direct, skip reason null, language null and a node ID. Below, the skip reason field for the duplicate readme reads duplicate path.](/blog/llmiser-zip-index-manifest/manifest-record.svg "Fields from manifest.json, local run on a synthetic archive, 8 November 2026.")

Status is `DONE`, `SKIPPED` or `FAILED`. When an entry is skipped, `skip_reason` says why, using the same wording as the index. The manifest never contains file content, so it's safe to share as an inventory when the Markdown itself isn't.

## 4. Account for expected and omitted files

Check that the numbers add up and that every file you expected is in the results. The summary's converted, skipped and failed counts should total the files found, and the skipped table names the reason for every gap.

Our archive held 14 entries, but the index found 16, because it also counted the two files inside the nested ZIP. Nine were converted, seven skipped and none failed, which adds up to 16. The skipped table gave a reason for each of the seven.

Those reasons were an unsafe path, a credentials file, a nested ZIP too deep, a binary file, a dependency folder, a duplicate path and a symbolic link. All seven were intentional exclusions. Removing that kind of content before you upload, on a separate sharing copy, is safer than relying on these rules.

## 5. Investigate partial results

A file can count as converted and still bring little or nothing useful. Check images, duplicates and nested archives individually, because the summary counts them in ways that are easy to misread.

The summary counted our blank photo as one of two images with recognized text. Its section in the Markdown said only "No text detected in this image." The summary looked better than the result.

The duplicate is the other trap. `readme.md` was skipped because `README.md` already existed, and the check ignores letter case. Its content was different, an older readme, and none of it reached the Markdown. On case-sensitive systems these are two real files, so rename one before zipping if both matter.

![A decision diagram. Start: a file you expected is missing from the Markdown. Question: is it in the skipped table? Yes: read the reason, then rename, move or unzip it if you need it. No: check the tree for its path and the results for a failed status.](/blog/llmiser-zip-index-manifest/missing-file-decision.svg "Every missing file is either skipped with a reason or failed with a status. Illustration.")

Nested archives open only one level deep. Our `old.zip` was opened, but the `deeper.zip` inside it was skipped as "nested archive too deep." Unzip deeper archives before uploading if their contents matter.

## 6. Select context for the next task

Use the index to choose what to send next, not to send everything. Pick the paths your question needs, copy those sections of the combined Markdown and leave the rest out.

Each converted file starts with a heading like ``## `docs-bundle/docs/config.txt` ``, which makes sections easy to find and cut in the reader's editor. A question about the batch importer needs `docs/config.txt` and maybe `src/config.txt`, not the whole bundle.

Keep the index nearby when you share part of a result. If someone asks whether a file was included, the index answers in one line. For what LLMiser does and doesn't change during conversion, see the [use cases page](/usecase).

## Frequently Asked Questions

### What is PROJECT_INDEX.md in an LLMiser ZIP result?

It's a readable report of the conversion: summary counts, a folder tree, a table with every entry's type, status and engine, and a table of skipped and failed entries with reasons. It doesn't contain file contents.

### Does the manifest include my file contents?

No. manifest.json lists each entry's path, size, type, classification, status, engine, skip reason, language and ID, plus the source file and limits. File contents are only in the combined Markdown.

### Why does the index count more files than my ZIP had?

Files inside a nested ZIP are counted as entries too. In our test, 14 top-level entries plus two files inside a nested ZIP made 16. LLMiser opens nested ZIPs one level deep.

### Why was one of my files marked as a duplicate?

Two paths that differ only in letter case, like README.md and readme.md, count as the same path. Only the first is converted. Rename one before zipping if both files matter.

### Are images in a ZIP converted?

Yes. Images go through text recognition, up to 50 per archive. Check each image's section in the Markdown. An image with no readable text still counts as converted and shows "No text detected in this image."

### Where do I download the index and manifest?

In the reader, open "Original output files" under the result. It lists the combined Markdown, PROJECT_INDEX.md and manifest.json as the service produced them. Server copies are deleted after 48 hours by default.

Ready to see your own project's inventory? [Convert a ZIP with LLMiser](/) and open the index first.
