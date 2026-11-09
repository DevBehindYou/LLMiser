---
title: "Keep Slide Titles and Order Clear in Markdown"
slug: "slide-order-markdown"
description: "Keep the PowerPoint slide order Markdown readers depend on: map the sequence, check each title sits above its own text, and fix repeated or missing titles."
excerpt: "Our step labels printed above the wrong heading, one slide lost its title entirely and the deck's sections vanished. Every slide was still there, in order."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["PowerPoint", "PPTX", "Markdown", "Document structure", "AI context"]
primaryKeyword: "PowerPoint slide order Markdown"
secondaryKeywords: ["repeated slide titles", "slide title placeholder"]
banner: "/blog/slide-order-markdown/banner.svg"
bannerAlt: "LLMiser banner reading Step 2 landed under step 1. A paper card shows a slide with a Step 2 of 3 label above its Cause title, and the converted Markdown where the label prints before the Cause heading, inside the previous slide's section."
featured: false
draft: true
---

**TL;DR:** A converted deck keeps the slide order and numbers every slide, but anything that tells the sequence through layout can slip. Map the sequence, check that each slide's title heading sits directly above its own text, and make repeated or missing titles unique. In our test, step labels placed above titles printed before their headings, a slide without a title placeholder got no heading, and PowerPoint section names disappeared.

A deck explains things in order. Step 1 sets up step 2, a divider says which part you're in, and a slide can say "as the previous slide shows." On screen, layout and position carry that order. In converted text, headings carry it.

We built a six-slide synthetic troubleshooting deck where the meaning depends on order, then converted it and a reviewed copy with LLMiser's own code. This guide shows how to keep the **PowerPoint slide order Markdown** readers depend on.

## Map slide sequence

Write down the sequence the way the presenter tells it: each slide's number, its title and the step or section it belongs to. That map is what you'll compare the Markdown against, and it shows where the order carries meaning.

The conversion keeps the file's slide order and marks each slide with a comment such as `<!-- Slide number: 3 -->`. That's a good anchor. It doesn't keep PowerPoint's sections, though. Our deck grouped its slides into sections named "Diagnosis" and "Resolution." "Diagnosis" appeared only because a divider slide used it as a title, and "Resolution" appeared nowhere.

![A sequence map of the test deck. Section Diagnosis: slide 1 title, slide 2 divider Diagnosis, slide 3 Symptoms with a Step 1 of 3 label above the title, slide 4 Symptoms again, slide 5 Cause with a Step 2 of 3 label above the title. Section Resolution: slide 6 Fix, built without a title placeholder, with a Step 3 of 3 label and a sentence pointing to the previous slide.](/blog/slide-order-markdown/sequence-map.svg "The synthetic troubleshooting deck and the order its explanation depends on. Illustration of the fixture.")

Mark three things on your map: slides that continue the previous one, slides that refer to another slide, and section boundaries. Those are the places where a reader who sees the slides out of context, or a tool that splits the text, loses the thread.

## Check title-to-body association

In the converted text, each slide title becomes a heading, and readers and tools treat everything below a heading as belonging to it. Check that every slide's own text sits under its own title, not above it or under another slide's title.

LLMiser's conversion orders the text on a slide by position, top to bottom, then left to right. So anything placed above the title prints before the title's heading. Our "Step 1 of 3" and "Step 2 of 3" labels sat at the top of their slides. In the output, each printed just above its heading, which put it at the end of the previous slide's section.

![The converted original, with problems marked. Slide 3: Step 1 of 3 printed above the Symptoms heading. Slide 4: a second Symptoms heading. Slide 5: Step 2 of 3 printed above the Cause heading. Slide 6: no heading at all, so Step 3 of 3, Fix and the fix itself appear under the Cause heading.](/blog/slide-order-markdown/original-output.svg "Converted text of the original deck, slides 3 to 6, with two body lines omitted, local run of LLMiser's conversion code, 9 November 2026.")

Slide 6 was worse. Its title was a large text box rather than the layout's title placeholder, so "Fix" came out as a plain line with no heading. Anyone reading by headings would find the fix, and the label "Step 3 of 3," inside the section called "Cause."

Even our first repair fell into the same trap. We typed a short description into the divider slide's text box. In the default template's Section Header layout we used, that text box sits above the title, 3.2 inches from the top against the title's 4.8 inches. The description printed before the heading it was meant to explain, so the reviewed copy put it in the title instead.

Two PowerPoint features help with the check. Microsoft's guide to [accessible presentations](https://support.microsoft.com/en-us/accessibility/powerpoint/make-your-powerpoint-presentations-accessible-to-people-with-disabilities) recommends giving every slide a unique title and using the Accessibility Checker to find slides without one. It also describes Reset, on the Home tab, which restores a slide's placeholders and can help you find the title placeholder.

The same guide describes the Reading Order pane, which sets the order a screen reader follows. That order doesn't control this conversion, which goes by position. To move text below a title in the output, move it below the title on the slide.

## Verify rearranged or repeated titles

Search the converted text for headings that appear more than once, slides with no heading, and sentences that point at another slide. Each one marks a place where the reader needs the order to understand the text.

Our original had all three. Two slides shared the heading "Symptoms," so the second looked like a separate topic rather than a continuation. Slide 6 had no heading. And its sentence "As the previous slide shows, timing is the cause" only works if the reader knows which slide came before it.

Write those references out. "As the previous slide shows" became "Because the token expires early (step 2)." That sentence still makes sense if the slides are reordered for another talk, or if the converted text is split into pieces.

![Two outlines of converted headings. Original: Fix the Login Error, Diagnosis, Symptoms, Symptoms, Cause, and no heading for slide 6. Reviewed copy: Fix the Login Error, Diagnosis: steps 1 and 2 find the cause, Step 1: Symptoms of error 4012, Step 1, continued: Mobile app only, Step 2: Cause, Step 3: Fix.](/blog/slide-order-markdown/headings-before-after.svg "Every heading in each converted deck, local run, 9 November 2026.")

The reviewed copy converted cleanly. Every slide had a heading, every heading was unique, each step number sat inside its title and the fix explained itself. The section names still didn't come through, which is why the divider's title now says what the section does.

![A checklist: the slide sequence mapped with steps and sections, every slide using its layout's title placeholder, labels such as Step 2 of 3 inside the title, no repeated headings in the output, references like the previous slide written out, section names repeated in divider titles. Limitation: PowerPoint sections and reading order don't carry into the converted text.](/blog/slide-order-markdown/order-checklist.svg "A sequence pass for converted decks. Illustration.")

These results come from one synthetic deck built with python-pptx and its default layouts. Your template's layouts may place text boxes differently, so check where each one lands in the output. For what LLMiser does with presentations, see the [use cases page](/usecase).

## Frequently Asked Questions

### Does the converted text keep my slide order?

Yes. In our test, slides came through in file order, each marked with a slide number comment. PowerPoint's section names didn't come through, so repeat them in divider slide titles.

### Why does my step label appear above the wrong heading?

The conversion orders a slide's text by position, and the label sat above the title. It printed before the title's heading, at the end of the previous slide's section. Put the label inside the title, such as "Step 2: Cause."

### Why doesn't one of my slides have a heading?

It probably has no title placeholder. Our slide 6 used a large text box as its title, and the conversion treated it as ordinary text. Switch the slide to a layout with a title, or use Reset if its title placeholder was deleted.

### Will the Reading Order pane fix the order in the output?

Not for this conversion. The Reading Order pane sets what a screen reader follows, while LLMiser's conversion orders text by its position on the slide. Move the shape on the slide instead.

### Does the RAG-ready profile split a deck by slide?

Not in our test. RAG-ready marks chunks before second-level headings, and slide titles convert as first-level headings, so our deck got no chunk markers. Use the slide number comments as split points if you need them.

Deck titled and in order? [Convert it with LLMiser](/) and read the headings as your outline.
