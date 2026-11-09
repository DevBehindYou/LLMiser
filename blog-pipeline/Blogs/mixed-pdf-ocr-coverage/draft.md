---
title: "Check OCR Coverage in a Mixed PDF"
slug: "mixed-pdf-ocr-coverage"
description: "Check mixed PDF OCR coverage page by page: list each page's type, find its first and last line in the output, and trace every gap or repeat to its cause."
excerpt: "We converted an eight-page PDF of typed and scanned pages. Two pages were never read, one appeared twice, and nothing in the output said so."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["OCR", "Scanned PDF", "Data quality", "PDF", "AI context"]
primaryKeyword: "mixed PDF OCR coverage"
secondaryKeywords: ["scanned pages in a PDF", "PDF pages missing after conversion"]
banner: "/blog/mixed-pdf-ocr-coverage/banner.svg"
bannerAlt: "LLMiser banner reading Every page, accounted for. A paper card shows eight PDF pages in a row, with ticks under most, a cross under a stamped scan and a small photo, and a double mark under one page."
featured: false
draft: true
---

**TL;DR:** To check a PDF that mixes typed and scanned pages, list every page's type, find each page's first and last line in the output, and trace every gap or repeat to its cause. In our eight-page test, two pages were never read, one page came out twice and two blank pages left no trace. Nothing in the output flagged any of it.

A PDF that mixes typed pages with scanned ones is harder to check than either kind alone. Each page is read one of two ways, and a page that goes the wrong way can vanish without a sound.

We built an eight-page synthetic returns packet and ran it through LLMiser's own PDF code. This guide shows how to check **mixed PDF OCR coverage** page by page, using what that packet got right and wrong.

## Inventory page types

List every page in the PDF with its type: text page, scanned page, photo on a page or blank. The type decides how a page is read, and so where its text can go missing.

LLMiser reads a page's text layer directly when it has one. It sends a page to text recognition only when that page has fewer than 20 selectable characters and pictures cover at least 30% of it. Every page is checked on its own, so one PDF can take both routes.

You can sort pages without any tools. Open the PDF, try to select text on each page or search for a word you can see. If the search finds it, the page has a text layer. If nothing can be selected, it's a picture.

Watch for two in-between cases, because they look like scans but aren't treated as scans. One is a scanned page with a small line of real text added on top, such as a date stamp, a scanner name or a page number. The other is a small picture on an otherwise empty page, like a phone photo of a receipt.

![Eight page thumbnails with their types: 1 text page, 2 scanned page, 3 blank, 4 text page, 5 scanned page with a small text stamp, 6 small receipt photo, 7 text page with an invisible second copy of its text, 8 blank.](/blog/mixed-pdf-ocr-coverage/packet-pages.svg "The synthetic eight-page packet used in this test. Illustration of the fixture.")

Our packet had all of these on purpose. Pages 1, 4 and 7 were typed text. Page 2 was a full-page scan of a delivery note. Page 5 was a full-page scan of a return form with a scanner stamp added as real text. Page 6 held a receipt photo covering about a fifth of the page. Pages 3 and 8 were blank. Page 7 also carried an invisible second copy of its own text, as can happen when a page goes through recognition twice.

## Locate each page in output

For every page in your inventory, take its first and last line and search for both in the output. A page counts as represented only when both lines appear, in the right order and exactly once.

Scanned pages are easy to find, because LLMiser marks each one with a comment such as `<!-- page 2: text recognition -->`. Text pages and blanks get no marker. Consecutive text pages are joined into one passage, so the output doesn't show where one ends and the next begins.

In our output, page 2's last line, "End of delivery note," ran straight into page 4's first line, "Inspection notes." Only the landmarks from the original told us where page 4 started.

![A page map. Page 1: found. Page 2: found, with its recognition marker. Page 3: no trace, as expected for a blank page. Page 4: found. Page 5: only the scanner stamp came back. Page 6: missing. Page 7: found twice. Page 8: no trace, blank.](/blog/mixed-pdf-ocr-coverage/page-map.svg "Where each page landed in the output, local run of LLMiser's PDF code on the synthetic packet, 9 November 2026.")

Here's how the eight pages came out. Pages 1, 2 and 4 were complete. Page 5 returned one line, "Scanned 2026-04-18 09:14 by FrontDesk-02," and none of the return form under it. Page 6 returned nothing. Page 7's approval appeared twice. Pages 3 and 8 left no trace.

Blank pages don't always behave the same way. In an earlier three-page test with the same code, a blank last page that followed a scanned page added the line "No extractable text found in this document." In this packet, both blanks sat next to text pages and simply disappeared.

So record blank pages in your inventory. Then a missing blank is expected, and a notice about a blank page doesn't send you looking for a problem in the rest of the file.

## Investigate missing or duplicate text

When a page's lines are missing or appear twice, find out why before you fix anything. In our packet, every gap and repeat traced back to how the page was built, not to a misread character.

![Four cause and fix cards. Scan with a text stamp: treated as a text page, so only the stamp came back. Fix: export the page as an image. Small photo: too little of the page was picture, so it wasn't read. Fix: export it as an image. Invisible copy of text: the passage appears twice. Fix: delete the repeat. Blank page: no trace or a notice. Fix: note it in the inventory.](/blog/mixed-pdf-ocr-coverage/gap-causes.svg "What caused each gap or repeat in the synthetic packet, and the fix that worked in our local run.")

**A scan with a text stamp.** Page 5 looked like a scan, but its 40-character stamp gave it a text layer, so it was read as a text page. The stamp came back. The return form under it, with an account number and an authorization, never reached text recognition.

**A small photo.** Page 6's receipt covered about 19% of the page, under the 30% that marks a page as scanned. It was treated as a text page with no text, so it added nothing to the output.

The fix for both was the same. We exported each page as an image and converted the images on their own, since LLMiser reads images with text recognition directly. Page 5 then came back complete, stamp and form, and page 6 returned the receipt with its total of 6.95.

![Two panels. Page 5 inside the PDF output: one line, the scanner stamp. Page 5 exported as an image and converted: the stamp, then the return form title RA-2207, two return lines, the reason, the account 0045-1170 and the authorizer.](/blog/mixed-pdf-ocr-coverage/page5-export.svg "Page 5 before and after exporting it as an image, local run of LLMiser's recognition code, 9 November 2026.")

Many PDF viewers can export a page as an image, and a full-page screenshot works too. Paste the recognized text into the right place in the converted file, or keep it as a separate file and say which page it belongs to.

**An invisible copy of text.** Page 7's hidden second layer produced the approval twice: once with blank lines between sentences, once without. A repeat like that wastes context and can read as two separate approvals.

Compare the two copies, and if they match, delete one in LLMiser's editor before you copy or download the result. If the source document is available, exporting a fresh PDF from it is cleaner.

**A blank page.** There's nothing to fix. Mark it as blank in your inventory and move on.

None of these four cases produced a warning. LLMiser does warn in two situations: a scanned page that returns no text gets a warning line naming that page, and scanned pages beyond its 100-page limit are listed. A page read as text, even when it holds only a stamp, raises nothing.

![A checklist: every page listed with its type, stamped scans and small photos flagged, first and last line of each page found in the output, no passage repeated, blank pages recorded, unread pages exported as images and converted. Limitation: one synthetic packet, real PDFs vary.](/blog/mixed-pdf-ocr-coverage/coverage-checklist.svg "A coverage pass for PDFs that mix typed and scanned pages. Illustration.")

These results come from one synthetic packet built to contain each problem once. Real PDFs mix these cases in less tidy ways, and recognized text still needs its own accuracy check. For what LLMiser does with PDFs and images, see the [use cases page](/usecase).

## Frequently Asked Questions

### Why wasn't my scanned page read?

Most likely it had a little real text on it, such as a stamp, a page number or scanner details. Twenty characters is enough for LLMiser to treat a page as text. A picture covering less than 30% of a page isn't read either. Export the page as an image and convert that.

### Does LLMiser tell me when a page was skipped?

Only in two cases. Scanned pages past the 100-page limit are listed in a warning, and a scanned page that returns no text gets a warning line. A page treated as text, even one holding only a stamp, raises no notice, so the inventory is your check.

### Why does a blank page sometimes add "No extractable text found"?

It depends on where the blank sits. A blank page is grouped with any text pages right next to it and then leaves no trace. When it has none, such as a blank last page after a scanned page, it's converted alone, and that empty result adds the notice.

### How can I tell where one text page ends in the output?

You can't from the output alone, since only scanned pages get a page marker. Use the last line of each page from your inventory as a landmark. For pages that must stay separate, convert them as separate files.

### Should I convert every page as an image to be safe?

Only the problem pages. A text layer gives exact characters, while recognition can misread them, such as a letter O read as a zero. Images are limited to 10 MB each and 20 files per batch, so exporting a long PDF page by page is slow anyway.

Mixed PDF to check? [Convert it with LLMiser](/) and match every page to its place in the output.
