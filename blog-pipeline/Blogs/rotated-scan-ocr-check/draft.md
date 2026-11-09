---
title: "Check Rotated Scans Before Running OCR"
slug: "rotated-scan-ocr-check"
description: "A rotated scan OCR check on one sample: quarter turns were corrected, a camera tag was honored, but an 8-degree tilt lost almost the whole page. Straighten first."
excerpt: "We fed the same page to LLMiser's text recognition seven ways. Sideways and upside down were fine. A slight tilt was the one that wrecked it."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["OCR", "Scanned documents", "Image preparation", "Data quality", "AI context"]
primaryKeyword: "rotated scan OCR check"
secondaryKeywords: ["skewed scan OCR", "fix scan orientation"]
banner: "/blog/rotated-scan-ocr-check/banner.svg"
bannerAlt: "LLMiser banner reading A tilt hurt more than a turn. A scanned page on a paper card at four orientations with check marks, and one slightly tilted page with a cross."
featured: false
draft: true
---

**TL;DR:** In our test, LLMiser's text recognition handled pages turned a quarter or half turn and honored a camera's orientation tag. A page tilted just 8 degrees lost almost all its text. Check orientation before you upload, straighten tilted scans, and compare the recognized fields with the original.

Most advice about scans worries about pages that are sideways or upside down. Our test suggests the small tilts deserve more worry.

We ran one synthetic invoice through LLMiser's own text recognition code seven ways: upright, turned in quarter steps, tilted slightly and saved as a phone-style photo with an orientation tag. This **rotated scan OCR check** shows how each orientation came out on that one page, and what to do before you upload your own.

## Inspect orientation

Look at each page before uploading and sort it into one of three groups: upright, turned by a quarter or half turn, or tilted by a few degrees. They behave differently, so they need different handling.

LLMiser prepares every image the same way. It applies the orientation tag that cameras store, boosts contrast and reads the page. If that first read looks weak, it checks the orientation and tries a corrected copy, keeping it only when it reads clearly better.

![A flow of four steps in LLMiser's image preparation: apply the camera orientation tag, read the page, check orientation only if the read looks weak, keep a turned copy only if it reads clearly better.](/blog/rotated-scan-ocr-check/orientation-steps.svg "How LLMiser's recognition code handles orientation. Based on the code, not a guarantee for every page.")

That correction works in quarter turns. A page tilted by a few degrees isn't a quarter turn, so it goes through as it is. That's the gap our test found.

## Compare original and corrected copy

Run the same page in different orientations and compare the text with the upright result. On our sample, quarter and half turns came back intact, while tilt cost accuracy quickly.

![A table of seven runs. Upright: reference. Turned 90 degrees: read correctly with no correction needed. Turned 180 and 270: corrected automatically. Camera tag: honored. Tilted 3 degrees: mostly right with one ID misread. Tilted 8 degrees: almost all text lost.](/blog/rotated-scan-ocr-check/orientation-results.svg "Local run of LLMiser's recognition code on one synthetic page, 9 November 2026. Similarity compares each run with the upright text.")

Upside-down and 270-degree copies triggered the orientation check, were turned back and matched the upright text exactly. The 90-degree copy read correctly without any correction. A JPEG saved sideways with a camera orientation tag came out identical to upright, because the tag was applied before reading.

The tilted copies were different. At 3 degrees, most of the page survived, but the customer ID `C0O1-7781` came back as `C001-7781`, a letter O turned into a zero that the upright read had kept. At 8 degrees, the page fell apart.

## Check output against both

Compare the recognized text with the original page, field by field, especially for anything that was turned or tilted. A confident-looking result can still be incomplete, so check what's missing as well as what's wrong.

The 8-degree copy returned one line: "Terms. net 30. 4 late Fee of 15% per Month applies after 2026 05-17." Everything above it, including the invoice number, the table and the totals, was missing. The one line that did come back changed a 1.5% fee into 15%.

![Two excerpts. Upright page: the invoice header, number, customer, order, dates, table and totals, about two dozen lines. Tilted 8 degrees: a single line of small print with 1.5 percent read as 15 percent, and nothing else.](/blog/rotated-scan-ocr-check/tilt-output.svg "Exact recognized text from the tilted copy, local run, 9 November 2026.")

The orientation check didn't step in, because the tilted read's average confidence stayed above the threshold that triggers it. And it only turns pages in quarter steps anyway. Nothing in the output warned that most of the page was gone.

So straighten tilted pages before you upload them. Rescan with the page flat against the glass, use your scanner's straighten or deskew option, or rotate the image in an editor until the text lines are level. Then compare the output's first and last lines with the page, which catches a missing block fast.

In a long scan, compare how much text each page produced. A page that returns one line where its neighbors return dozens has almost certainly lost something, whatever the reason.

![A decision diagram. Start: a scanned page. Question: is it tilted by a few degrees rather than turned? Yes: straighten it before upload. No: upload it, since quarter and half turns were corrected in our test. Then compare key fields with the original.](/blog/rotated-scan-ocr-check/tilt-decision.svg "Turns and tilts need different handling. Illustration.")

Phone photos are their own case. Our tagged JPEG worked because the orientation tag was still there. If an app strips photo metadata before you upload, a sideways photo becomes a plain sideways image, which still gets the quarter-turn check.

![A checklist: every page upright or turned in quarter steps, tilted pages straightened, phone photos keep their orientation tag, first and last lines of each page found in the output, IDs and amounts compared with the original. Limitation: one synthetic page, results vary by page, font and resolution.](/blog/rotated-scan-ocr-check/orientation-checklist.svg "A quick orientation pass before and after recognition. Illustration.")

These results come from one clean, synthetic page. Real scans add noise, shadows and handwriting, so treat the pattern as a reason to check, not as a rule. For what LLMiser does and doesn't do with images, see the [use cases page](/usecase).

## Frequently Asked Questions

### Does LLMiser fix rotated scans automatically?

Partly. It applies camera orientation tags, and when a first read looks weak it tries quarter and half turns, keeping one only if it reads clearly better. In our test that fixed 180 and 270-degree pages. It doesn't straighten small tilts.

### Why did a slightly tilted page do worse than an upside-down one?

Upside down is a clean half turn that the orientation check recognizes and reverses. A tilt of a few degrees isn't, so the page is read at an angle and text lines break apart. In our test, 8 degrees lost almost the whole page.

### How do I straighten a scan before uploading?

Rescan with the page flat and aligned, or use your scanner's straighten or deskew setting. An image editor's rotate tool works too: turn the image until the text lines are level, then save a copy.

### Will LLMiser tell me if text was lost?

Not reliably. Our 8-degree page returned one line without any warning that the rest was missing. Compare the first and last lines of each page with the output to catch gaps.

### Do phone photos come out the right way up?

In our test, yes, when the photo kept its orientation tag. LLMiser applies that tag before reading. If the tag was stripped, the photo is treated like any other image and gets the same orientation check.

Have a scan to check? [Convert it with LLMiser](/) and compare the first and last lines with your page.
