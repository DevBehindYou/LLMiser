---
title: "Check Nested Word Lists in Markdown Output"
slug: "nested-word-lists-markdown"
description: "Check nested Word lists Markdown output keeps: outline each list, compare every item's parent and number, then repair a copy. A step after a note became step 1."
excerpt: "All the words were there. But a sub-step had become a step, a lettered step had become a number, and step 3 had quietly become step 1 again."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["Word", "DOCX", "Markdown", "Lists", "AI context"]
primaryKeyword: "nested Word lists Markdown"
secondaryKeywords: ["Word multilevel list conversion", "list numbering restarts Markdown"]
banner: "/blog/nested-word-lists-markdown/banner.svg"
bannerAlt: "LLMiser banner reading Step 3 became step 1. A paper card shows a Word list with steps 1, 2 and 3 and a note between steps 2 and 3, converted to Markdown where the last step restarts at 1."
featured: false
draft: true
---

**TL;DR:** A converted list can keep every word and still change what belongs to what. Write down each list's levels and numbering before you convert, compare every item's position, parent and number in the Markdown, then fix the structure in a copy and convert again. In our test, a step that followed a note restarted at 1, lettered sub-steps became numbers and a template's sub-bullets lost their parent.

Lists carry rules in their shape. A sub-step belongs to its step, an example belongs to its category, and step 3 comes after step 2. When conversion changes the shape, a reader can follow the wrong instruction without any word being wrong.

We built a synthetic equipment-return procedure with the list habits Word documents pick up, converted it with LLMiser's own code and compared each item. This guide shows how to check the **nested Word lists Markdown** conversion hands back, and how to repair them.

## Identify list levels

Before converting, write a short outline of each list: which items are steps, which are sub-steps under them, and where numbering should continue or start over. That outline is what you'll compare the Markdown against.

Read the lists in Word itself, not in the converted text. Note each item's number or letter as Word shows it and how far it's indented. Pay attention to anything between two items of the same list, such as a note or an image, because it splits the list in two.

Also find out how the levels were made. Microsoft's screen reader guide to [creating lists in Word](https://support.microsoft.com/en-us/accessibility/word/use-a-screen-reader-to-create-bulleted-or-numbered-lists-with-word) describes the usual way: press Enter for a new item, then Tab, and Word indents it and makes it part of a nested list. Some templates instead use separate styles for each level, such as List Number for steps and List Bullet 2 for sub-points. Click a sub-item and look at its style name to tell them apart.

![An outline of the test procedure as a word processor displayed it. Return your equipment: 1. Pack the device, with a. Remove the SIM card and b. Wipe personal files, which has bullets Photos and Downloads. 2. Print the return label. A note paragraph. 3. Drop off the parcel. After drop-off: a new list, 1 and 2. Items we can't take back: 1. Final-sale items with bullets Clearance labels and Opened bundles, made with List Bullet 2, then 2. Gift cards.](/blog/nested-word-lists-markdown/list-outline.svg "The original synthetic procedure as displayed in a word processor. Illustration of the fixture.")

Our procedure had three lists. The first was a real multilevel list, with numbered steps, lettered sub-steps and bullets under one sub-step, plus a note between steps 2 and 3. The second list restarted at 1 on purpose. The third used List Number for its items and List Bullet 2 for the examples under "Final-sale items."

## Compare item order and nesting

Put the converted list beside your outline and check three things for every item: its position, its parent and its number. Every word can be present while a sub-step has turned into a step or step 3 has turned into step 1.

Here's how our original converted, item by item:

![A comparison table. Real multilevel list: nesting kept, but sub-steps a and b became 1 and 2. Bullets under Wipe personal files: kept under their parent. Step 3 after the note: became 1. Second list restarting at 1: correct. Clearance labels and Opened bundles from List Bullet 2: lost their parent and became top-level bullets. Gift cards: became 1 instead of 2.](/blog/nested-word-lists-markdown/list-results.svg "Displayed numbering compared with the converted Markdown, local run of LLMiser's conversion code, 9 November 2026.")

The real multilevel list kept its shape. "Remove the SIM card" and "Wipe personal files" stayed indented under "Pack the device," and the two bullets stayed under "Wipe personal files." Their letters didn't survive, though: a and b became 1 and 2, because Markdown numbered lists use numbers. A sentence elsewhere that says "see step 1b" now points at nothing.

The note did more damage. In Word, the step after it was still step 3. In the Markdown, the note ended the list, and the next item started a new list at 1. A reader, or a model, would now see "1. Drop off the parcel" as the first step of something new.

The second list's restart was correct, because it was meant to start over. A restart is only a problem where the numbering should continue, which is why the outline records which lists should do which.

The template-style list fared worst. "Clearance labels" and "Opened bundles" lost their indent and sat as top-level bullets between two numbered lists. "Gift cards," item 2 in Word, became item 1. The examples of final-sale items now read like a separate list.

## Repair a working copy and recheck

Fix the structure in a copy of the Word file, then convert again and repeat the comparison. A fix in the source survives every later conversion, while a hand edit in the Markdown has to be redone each time you convert.

Four repairs covered everything our original got wrong:

1. **Fold interrupting notes into their step.** We moved "Labels expire after 7 days" into step 2's own text, so nothing split the list.
2. **Rebuild template-style levels as one multilevel list.** Microsoft's guide to [defining multilevel lists](https://support.microsoft.com/en-us/word/define-new-bullets-numbers-and-multilevel-lists) starts from the Multilevel List button on the Home tab. Apply one list to all the items, then indent the examples under their parent.
3. **Indent one level at a time.** In a separate test, bullets indented two levels under their parent came out as `* + Clearance labels`, an empty bullet wrapped around the real one.
4. **Replace letter references.** If any text says "step 1b," name the step instead, since letters become numbers.

![Two columns of converted Markdown. Original: 2. Print the return label, the note, then 1. Drop off the parcel, and later 1. Final-sale items, top-level bullets Clearance labels and Opened bundles, then 1. Gift cards. Reviewed copy: 2. Print the return label. Labels expire after 7 days. 3. Drop off the parcel, and 1. Final-sale items with indented bullets Clearance labels and Opened bundles, then 2. Gift cards.](/blog/nested-word-lists-markdown/before-after.svg "Converted Markdown from the original and the reviewed copy, local run, 9 November 2026.")

The reviewed copy converted the way the outline said it should. Step 3 kept its number, the final-sale examples sat indented under their parent and "Gift cards" was item 2. The lettered sub-steps still came out as 1 and 2, which is the one change no Word fix can avoid.

For a one-off share, you can also fix nesting in the converted Markdown itself. LLMiser lets you edit the text before you copy or download it: indent a sub-item under its parent and check the result in the rendered view. Keep a note of the change, though, since edits aren't saved in LLMiser's recent sessions list.

![A checklist: each list outlined before converting, interruptions between items noted, template-style levels identified by style name, every item's parent and number compared in the output, lettered references rewritten, the reviewed copy converted and compared again. Limitation: Markdown numbered lists use numbers only.](/blog/nested-word-lists-markdown/lists-checklist.svg "A list pass for Word documents. Illustration.")

These results come from one synthetic document built with python-docx and displayed with LibreOffice for the expected numbering. Word may number some edge cases differently, so compare against what your own Word shows. For what LLMiser does with Word files, see the [use cases page](/usecase).

## Frequently Asked Questions

### Why did my sub-steps change from a and b to 1 and 2?

Markdown numbered lists only use numbers. In our test, the nesting survived, but the letters became 1 and 2 under their parent step. Refer to sub-steps by their text rather than by letter.

### Why does a numbered list restart after a note?

The note splits the list in two. In our test, the step after a note paragraph came out as 1 instead of 3. Fold the note into the step it belongs to, then convert again.

### Why are my sub-bullets at the top level?

They were probably made with a separate list style, such as List Bullet 2, rather than by indenting within one list. Our template-style bullets lost their parent. Rebuilding them as one multilevel list kept them nested.

### Can I fix list nesting directly in LLMiser?

Yes, for a single share. Edit the converted Markdown so each sub-item is indented under its parent, check it in the rendered view, then copy or download. The Word copy is still the better place for a fix you'll need again.

### Is a restarted list always a mistake?

No. Our second list was meant to start at 1 and came out correctly. A restart matters only where the numbering should continue, which is why the outline records it.

List outlined and compared? [Convert it with LLMiser](/) and check each item's parent and number.
