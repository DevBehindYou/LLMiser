---
title: "Use Word Heading Styles Before Markdown Conversion"
slug: "word-heading-styles-markdown"
description: "Word heading styles Markdown can read: inspect each style, apply one hierarchy, and check heading levels. A look-alike custom style came out as plain text."
excerpt: "Two Word headings can look identical and convert completely differently. In our test, a custom heading style became plain text and a bold line became bold."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["Word", "DOCX", "Markdown", "Document structure", "AI context"]
primaryKeyword: "Word heading styles Markdown"
secondaryKeywords: ["Word Title style conversion", "custom heading styles Word"]
banner: "/blog/word-heading-styles-markdown/banner.svg"
bannerAlt: "LLMiser banner reading Looks like a heading. Isn't one. A paper card shows four Word headings that look alike, styled Heading 2, Section Heading, bold Normal and Title, converting to a Markdown heading, plain text, bold text and plain text."
featured: false
draft: true
---

**TL;DR:** A Word heading converts to a Markdown heading only when it uses one of Word's built-in Heading styles. Check the style name of every heading, apply one consistent hierarchy from Heading 1 down, and count the `#` marks in the converted text. In our test, a custom style that looked exactly like Heading 2 came out as plain text.

Bold, large text and a real heading can look the same on the page. The difference is stored in the paragraph's style, and that's what a conversion reads.

We wrote one synthetic onboarding guide twice: once with the mixed habits real documents pick up, and once with a clean hierarchy. Then we converted both with LLMiser's own code. This guide shows which **Word heading styles Markdown** conversion actually recognized, and how to make every section title count.

## Inspect Word styles

Click each section title and check its style name, not its look. A paragraph's style decides whether it converts as a heading, while font size, bold and color decide nothing.

Word gives you two quick views. The Styles gallery on the Home tab highlights the style of the paragraph your cursor is in. Microsoft's guide to the [Navigation pane](https://support.microsoft.com/en-us/word/use-the-navigation-pane-in-word) shows the outline: open it with Ctrl+F or from the View tab, and headings that use heading styles appear in a list. It also notes that headings inside tables, text boxes, headers and footers don't appear there.

Our original guide used seven ways of marking a title, which is a typical mix for a document several people have edited:

![Seven look-alike section titles with their actual formatting: the title in Word's Title style, Overview in Heading 1, Before your first day in Heading 2, Accounts and access as bold 16-point Normal text, Your first week in a custom style named Section Heading based on Heading 2, Policies as Normal text with an outline level, and a sentence styled Heading 3 for emphasis.](/blog/word-heading-styles-markdown/style-inventory.svg "The original synthetic guide and how each title was formatted. Illustration of the fixture.")

Here's what each one became in Markdown:

![A comparison table. Title style: plain text, and a title made from the file name was added. Heading 1: a level-one heading. Heading 2: a level-two heading. Bold 16-point Normal: bold text. Custom Section Heading based on Heading 2: plain text. Normal with an outline level: plain text. A sentence in Heading 3: a level-three heading. An empty Heading 2: nothing.](/blog/word-heading-styles-markdown/style-results.svg "Each formatting choice and its converted result, local run of LLMiser's conversion code, 9 November 2026.")

Only the built-in Heading styles became headings. The custom "Section Heading" style was the surprise. It was based on Heading 2 and looked exactly like it, but it came out as a plain line of text, without even the bold of the fake heading.

The Title style didn't become a heading either. Because the converted text didn't open with a level-one heading, LLMiser added one made from the file name, so the output started with "Guide Original" instead of "Northwind Onboarding Guide."

## Apply a consistent hierarchy

Use Heading 1 once for the document title, Heading 2 for each main section and Heading 3 for subsections. Keep body text in Normal, and don't skip a level on the way down.

Microsoft's guide to [making Word documents accessible](https://support.microsoft.com/en-us/accessibility/word/make-your-word-documents-accessible-to-people-with-disabilities) gives the same rule for screen readers: use the built-in heading styles in logical order and don't skip levels, for example Heading 1, Heading 2 and then Heading 3. A model reading Markdown benefits from the same order.

Fix the original in a few passes:

1. Put the title in Heading 1. Then the converted file opens with your title instead of one made from the file name.
2. Restyle every fake heading, whether bold Normal text or a paragraph with only an outline level, with the right Heading style.
3. Replace custom heading styles with the built-in ones in the copy you'll convert. If your template's "Section Heading" must stay, change the paragraphs to Heading 2 in a sharing copy.
4. Remove heading styles from anything that isn't a title. Our emphasized sentence, "Badges must be worn at all times," became a section of its own.
5. Delete empty heading paragraphs. Ours vanished in conversion, but in Word it still sat in the outline.

![A before and after outline. Before, from the converted original: Guide Original, then Overview at level one, Before your first day at level two, Equipment at level three, Contacts at level one, Helpdesk at level three and Badges must be worn at all times at level three. After, from the reviewed copy: Northwind Onboarding Guide at level one, then Overview, Accounts and access, Your first week, Policies and Contacts at level two, with Before your first day, Equipment and Helpdesk at level three.](/blog/word-heading-styles-markdown/outline-before-after.svg "The heading outline of each converted version, local run, 9 November 2026.")

The reviewed copy used the same words with a consistent hierarchy. Every section title converted to a heading, the levels never skipped, the emphasized sentence went back to being a sentence and the document opened with its real title.

## Check Markdown heading levels

After conversion, list every line that starts with `#` and read that list as an outline. It should match the document's sections in order, with one `#` title, `##` sections and `###` subsections, and nothing missing in between.

A text editor's search makes this quick: search for lines starting with `#` and read the matches top to bottom. In LLMiser, you can read the converted Markdown before you copy or download it.

Look for four problems, each of which our original showed:

- **A missing section.** "Accounts and access," "Your first week" and "Policies" weren't in the heading list at all. Their text was still there, but it ran on as part of the previous section.
- **A skipped level.** "Contacts" at `#` was followed directly by "Helpdesk" at `###`, because the original jumped from Heading 1 to Heading 3.
- **A false section.** "Badges must be worn at all times." appeared as a `###` heading, splitting a sentence off as if it were a topic.
- **A title from the file name.** The original opened with "# Guide Original," since its real title was in the Title style.

These matter beyond appearance. Tools that split Markdown into chunks often cut at headings, and LLMiser's RAG-ready profile adds its chunk markers before `##` lines. A section that isn't a heading gets merged into its neighbor, and a sentence styled as a heading gets a chunk of its own.

![A checklist: every section title uses a built-in Heading style, no custom or look-alike heading styles in the sharing copy, Heading 1 used once for the title, no skipped levels, no sentences styled as headings, the converted heading list matches the document outline. Limitation: one synthetic document, other templates may name styles differently.](/blog/word-heading-styles-markdown/heading-checklist.svg "A heading pass before conversion. Illustration.")

These results come from one synthetic document made with python-docx's default template. Company templates can add their own styles, so test one converted page from yours. For what LLMiser does with Word files, see the [use cases page](/usecase).

## Frequently Asked Questions

### Why did my custom heading style come out as plain text?

In our test, LLMiser's Word conversion turned only the built-in Heading styles into Markdown headings. A custom style based on Heading 2 looked identical in Word but converted as a plain paragraph. Restyle those titles with the built-in Heading styles in a sharing copy.

### Should I use Word's Title style for the document title?

Not if you want it as the top heading. Our Title-style line came out as plain text, and LLMiser added a heading made from the file name above it. Heading 1 for the title kept the real title at the top.

### Does a heading in the Navigation pane always convert as a heading?

Not necessarily. The pane is a good outline check, but conversion depends on the style itself. Check the style name of each title, and then check the converted heading list.

### What about headings inside tables or text boxes?

Microsoft notes that the Navigation pane doesn't show headings in tables, text boxes, headers or footers. Keep section titles in the main body as normal paragraphs with heading styles, and check the converted output for any you had placed elsewhere.

### Do heading levels below Heading 3 matter?

They convert too. Our Heading 3 became `###`, and LLMiser's conversion maps Heading 4, 5 and 6 to `####`, `#####` and `######`. Keep deep levels rare, though. Two or three levels are easier for a person or a model to follow than six.

Headings styled and checked? [Convert it with LLMiser](/) and read the `#` lines as your outline.
