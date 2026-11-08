---
title: "LLMiser Profiles: Standard, Clean, Compact, RAG-ready"
slug: "llmiser-processing-profiles"
description: "LLMiser processing profiles compared on one file: what Standard, Clean, Compact and RAG-ready actually change, where Compact breaks tables, and how to choose."
excerpt: "We ran one Markdown file through all four profiles and compared every line. Clean was the smallest. Compact broke a table. RAG-ready marked a line inside code."
date: "2026-11-08"
author: "DevBehindYou"
category: "GUIDE"
tags: ["LLMiser", "Output profiles", "Markdown", "RAG", "Document conversion"]
primaryKeyword: "LLMiser processing profiles"
secondaryKeywords: ["Markdown output profiles", "clean Markdown for AI"]
banner: "/blog/llmiser-processing-profiles/banner.svg"
bannerAlt: "LLMiser banner reading Four profiles, real differences. Four small output cards labeled Standard, Clean, Compact and RAG-ready on a paper card, with the Compact card's table marked broken."
featured: false
draft: true
---

**TL;DR:** LLMiser's four profiles change the converted Markdown in small, specific ways. Standard adds a source note, Clean removes it, Compact deletes blank lines and every triple hyphen, and RAG-ready adds chunk markers before `##` headings. In our test, Clean was the smallest output, Compact broke a table and RAG-ready put a marker inside a code block.

Profiles sound like compression levels, as if each one squeezed a little harder. They aren't. Each applies a few text rules after conversion, and those rules interact with tables, code and dashes in ways the names don't tell you.

So we tested the **LLMiser processing profiles** on one file and compared every line. Here's what each profile really does, what it costs, and how to pick one.

## 1. Use one source for a fair comparison

Compare profiles on the same input, because the differences are small and depend on the content. A file with tables, code blocks and dividers shows far more than a plain page of prose does.

Our test file was a short synthetic field guide written in Markdown. It had a title, three `##` sections, an `###` subsection, three extra blank lines, a `---` divider, a pipe table, the phrase "March---April" and a Python code block containing a line that starts with `##`.

![A comparison table of the four profiles across eight features: source note, extra blank lines, divider line, table separator row, triple hyphen in text, blank line in code, chunk markers and word count. Standard and Clean keep the table and code intact, Compact removes the separator row and changes text and code, RAG-ready adds markers including one inside code.](/blog/llmiser-processing-profiles/profile-diff.svg "Local run of LLMiser's profile code on one synthetic Markdown file, 8 November 2026.")

We ran it through LLMiser's own profile code once per profile. The conversion itself is identical in every case. Only the final text rules differ.

## 2. Standard output

Standard is the full result with a short source note. It keeps the converted Markdown as it is, adds the title as a heading if the document lacks one and places a quoted line under it naming the file, size and engine.

Our Standard output began with "# Field Guide," then a quoted line naming `field-guide.md` and its size. Everything else matched the converted text, including the table, the divider and the code block exactly as written.

That source note is useful when you paste several documents into one prompt, since each one says where it came from. It costs a few words per document, 98 words in total here.

## 3. Clean output

Clean removes the source note and collapses runs of blank lines. It doesn't touch tables, dividers, dashes or code, which makes it the safest way to trim a result.

On our file, Clean differed from Standard by exactly one line, the source note. The extra blank lines had already been tidied during conversion. The result was 90 words and 469 bytes, the smallest of the four profiles.

For most AI use, Clean is the sensible default. It drops the one line you rarely need and keeps everything that carries meaning.

## 4. Compact output

Compact removes every blank line and deletes every occurrence of three hyphens, anywhere in the text. That's more than removing divider lines, and it can break tables, alter text and change code.

Our divider line disappeared, as intended. So did the hyphens in the table's separator row, which turned `| --- | --- |` into `|  |  |`. The GitHub Flavored Markdown spec says the [delimiter row](https://github.github.com/gfm/#tables-extension-) consists of hyphens, so without them the rows stop being a table.

![Two excerpts. Standard keeps the pipe table with its separator row of hyphens. Compact turns the separator row into empty cells, so the rows no longer form a table, and changes March---April into MarchApril.](/blog/llmiser-processing-profiles/compact-table.svg "Exact lines from the Standard and Compact outputs of the same file, local run, 8 November 2026.")

The phrase "March---April" became "MarchApril." The blank line inside our Python code block vanished too. Compact also kept the source note, so on this file it came out larger than Clean, at 95 words.

Use Compact only on plain prose you've checked, never on documents with tables, code or meaningful dashes. It's also applied to ZIP results, where code is the whole point.

## 5. RAG-ready output

RAG-ready adds a comment at the top of the document and a `<!-- chunk-boundary -->` marker before every line that starts with `##`. It keeps the source note and leaves all other text as it is.

The markers landed before "Setup," "Results" and "Next steps," as you'd want. A fourth landed inside the Python code block, in front of the line `## a comment inside code`. The [CommonMark spec](https://spec.commonmark.org/0.31.2/) says code fence content is literal text, so that marker now changes the code itself.

![The RAG-ready output with chunk markers before the Setup, Results and Next steps headings, and one marker inside a fenced Python block before a comment line. No marker appears before the H1 title or the H3 Notes heading.](/blog/llmiser-processing-profiles/rag-markers.svg "Exact RAG-ready output, local run, 8 November 2026.")

The H1 title and the `###` subsection got no markers, so sections only split at `##`. RAG-ready also had the most words, 118, because each marker adds text. It prepares split points. It doesn't create embeddings, run retrieval or store anything in a vector database.

## 6. Choose from actual differences, then inspect

Pick a profile from what your document contains, then read the result. The safest choices are Clean and Standard, and the other two need a document they can't damage.

![A decision diagram. Start: a converted document. Question: does it contain tables, code or triple hyphens? Yes: use Clean, or Standard if you want the source note. No: Compact can work, but read the output. Then, if you split at level-two headings, RAG-ready adds markers, so check code blocks.](/blog/llmiser-processing-profiles/choose-profile.svg "Choose from the content, not from the profile name. Illustration.")

Use Clean when you want the leanest faithful text. Use Standard when several documents share one prompt and each should name its source. Use Compact only on plain prose you've checked. Use RAG-ready when your own splitter cuts at the marker, then check every code block for a stray marker.

Whichever you pick, the token count LLMiser shows is an estimate, not a provider's billing count. For the bigger picture of where profiles fit in a pipeline, see the [document to LLM pipeline](/blog/document-to-llm-pipeline) guide, and the [use cases page](/usecase) for what LLMiser does and doesn't do.

## Frequently Asked Questions

### Which LLMiser profile uses the fewest tokens?

On our test file, Clean, because it removes the source note and nothing that carries meaning. Compact kept the source note and came out larger. Results vary by document, so compare the estimates on your own file.

### Does the Compact profile remove the source note?

No. In our test, Compact kept the source note and removed blank lines and every triple hyphen instead. Clean is the profile that removes the source note.

### Is Compact safe for tables and code?

No. It deletes every `---`, which empties a Markdown table's separator row and stops the rows rendering as a table. It also removes blank lines inside code blocks. Use Clean or Standard for those documents.

### What does the RAG-ready profile add?

A comment at the top naming the profile and file, and a chunk-boundary marker before every line starting with `##`. Markers can land inside code blocks. It doesn't embed, index or retrieve anything.

### Can I change the profile after converting?

The profile is applied during conversion. To get another one, remove the file from the queue, add it again, select the new profile and convert. In a batch, each file uses the profile selected when its conversion starts.

### Do profiles change what the conversion extracts?

No. Every profile starts from the same converted text and only applies its final rules to it. A table or heading that the conversion missed is missing in all four.

Want to see the difference on your own file? [Convert it with LLMiser](/) in Clean first, then compare.
