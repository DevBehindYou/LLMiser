---
title: "Verify Numbers and Identifiers in OCR Output"
slug: "verify-ocr-numbers"
description: "How to verify numbers in OCR output: find the fields that matter, compare every character and separator with the page, and log each correction you make."
excerpt: "Recognized text can read perfectly and still carry the wrong ID. We checked 24 fields on one synthetic receipt, character by character, across four copies."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["OCR", "Scanned documents", "Data quality", "Invoices", "AI context"]
primaryKeyword: "verify numbers in OCR output"
secondaryKeywords: ["OCR letter O and zero", "check OCR identifiers"]
banner: "/blog/verify-ocr-numbers/banner.svg"
bannerAlt: "LLMiser banner reading Check the digits, one by one. A paper card compares printed values with recognized ones: a receipt number matches, while a reference with a letter O, a dotted date and a total come back changed or missing."
featured: false
draft: true
---

**TL;DR:** Recognized text can read perfectly and still carry the wrong ID or amount. Mark the fields that matter on the original, compare each one character by character, including separators and signs, and log every correction. In our test, a letter O came back as a zero in all four copies of one receipt, even the clean one.

Scanned text usually fails in a quiet way. The sentence reads fine, the layout looks right, and one character in an order number is different.

We made one synthetic receipt with 24 fields that matter, saved it four ways and ran each copy through LLMiser's own text recognition code. Then we compared every field with the printed value. This guide shows how to **verify numbers in OCR output** the same way, and what our sample got wrong.

## Locate high-impact fields

Before you read the output, mark the fields on the original page that someone will act on. Identifiers, amounts, quantities, dates, percentages and signs come first, because a single wrong character there changes the meaning.

On our receipt that meant 24 fields: a receipt number and an account with leading zeros, an order number and a reference that mix the letter O with zero, three dates in different formats, a four-row table, a minus sign on a credit, four totals including one written with a decimal comma, and a line of small print.

![An annotated receipt. Marked fields: leading zeros in RCT-000418 and 0045-1170, a letter O in PO 10O5-B and O0-2207, separators in 17.04.2026 and 1.250,00, a quantity of 1 in the Seal kit row, a minus sign on -12.40 and the total 4,154.18.](/blog/verify-ocr-numbers/high-impact-fields.svg "The synthetic receipt used in this test, with its high-impact fields marked. Illustration of the fixture.")

Then find each field in the output. Search for its label first, then check that the value sits on the same line. In our runs, every value that came back stayed next to its label, so a label with nothing after it, or a missing label, is a strong signal.

Tables need one more check. Count the values in each row and compare that with the number of columns. Two of our copies returned "Seal kit 0.75 0.75" for a row that printed "Seal kit 1 0.75 0.75." The row still looked complete. Only the count showed that the quantity was gone.

Finally, check the end of the page. Our phone-photo-style copy stopped after the credit row. The subtotal, tax, total, the euro amount and the terms line were simply not there, and nothing in the output said so.

## Compare exact characters and separators

Compare the printed value with the output one character at a time, including letters, separators, spaces and signs. Don't clean or normalize either side first, because that step hides exactly the differences that change meaning.

Here's what came back across the four copies: a clean 200 dpi scan, a smaller JPEG like a typical office scan, a black-and-white fax-style copy and a blurred, unevenly lit phone-photo-style copy.

![A table of ten fields across four copies. Leading zeros and the minus sign came back exactly in all four. PO 10O5-B came back as PO 1005-B and O0-2207 as 00-2207 in all four. The fax copy changed 17.04.2026 to 17,04.2026. The Seal kit quantity went missing in the JPEG and fax copies and came back as the letter i in the photo, which also read the credit quantity as zt. The photo copy lost the euro amount and the total.](/blog/verify-ocr-numbers/receipt-results.svg "Field-by-field comparison, local run of LLMiser's recognition code on one synthetic receipt, 9 November 2026. The letter O is underlined.")

The letter O was the most consistent problem. "PO 10O5-B" came back as "PO 1005-B" and "O0-2207" as "00-2207" in every copy, including the clean one. Both wrong values look like perfectly valid identifiers, which is why nobody notices them by reading.

Separators were next. The fax-style copy read the delivery date 17.04.2026 as 17,04.2026, with a comma for the first dot. A date or amount with a changed separator can still look normal at a glance.

That's why a digits-only check, which strips everything but the numbers before comparing, is a trap. It would have accepted that fax date, because the digits match. The separator that changed is the part it threw away.

![Two panels. Digits only: printed 17.04.2026, output 17,04.2026, both reduced to 17042026, so the check passes. Exact characters: the same two values compared character by character, which shows that the third character changed from a dot to a comma, so the check fails.](/blog/verify-ocr-numbers/digits-only-trap.svg "A digits-only comparison accepted the changed date from the fax-style copy. Same local run.")

Some things held. Leading zeros survived in every copy. So did the minus signs on the credit row, the slashed and ISO dates, and the decimal comma in 1.250,00 wherever its line came back. That's encouraging, but it describes one page. Your fonts, paper and scanner may break different characters.

A few habits make the comparison faster:

- Zoom the original to 200% or more, since look-alike characters blur together at normal size.
- Watch the classic pairs: the letter O and zero, lowercase l, capital I and the digit 1, S and 5, B and 8, comma and period. In our clean copy, the header "Item" came back as "ltem," with a lowercase L.
- Paste the printed value and the output value one above the other in a plain text editor, so the characters line up.
- Read long identifiers in small groups, such as RCT, then 000, then 418.

Dates need a second look even when they come back exactly. Our "03/04/2026" was recognized correctly, but the text can't tell anyone whether it means March 4 or April 3. Note the format the document uses before an AI model has to guess.

## Record corrections

Write down every field you checked, what the output said, what the page said and what you changed. A short correction log lets someone else trust the corrected text, and shows them which values were checked and which weren't.

![A correction log with four rows from the phone-photo-style copy. Order: PO 1005-B corrected to PO 10O5-B. Reference: 00-2207 corrected to O0-2207. Seal kit quantity: i corrected to 1. Total: missing, added as 4,154.18.](/blog/verify-ocr-numbers/correction-log.svg "Four corrections from the phone-photo-style copy, local run, 9 November 2026. The letter O is underlined.")

Keep the log simple. A useful one needs about seven columns: the field, the value printed on the page, the value in the output, the problem (changed or missing), the corrected value, what you checked it against and who checked it. A spreadsheet or a few lines at the end of your notes both work.

Then fix the text itself before you send it anywhere. LLMiser lets you edit the converted Markdown before you copy or download it. Keep the log outside LLMiser, though, because edits aren't saved in its recent sessions list.

If a copy needs many corrections, rescan it instead. Our photo-style copy had nine fields wrong or missing, which is more work to fix by hand than a new scan. The clean 200 dpi copy had two, both caused by the same look-alike letter.

When you share the corrected text with an AI model, say which fields you verified. A note like "Order and reference numbers checked against the original" tells the model, and anyone who reads its answer, which values to rely on.

![A checklist: high-impact fields marked on the original, each value found next to its label, values per table row counted, last lines of the page found, every character and separator compared, corrections logged with the source. Limitation: one synthetic receipt, results vary by page, font and scan.](/blog/verify-ocr-numbers/number-checklist.svg "A number and identifier pass for recognized text. Illustration.")

Our results come from one clean, synthetic receipt in English, LLMiser's only recognition language. Real documents add stamps, handwriting and creases. Treat the pattern as a reason to check every high-impact field, not as an error rate. For what LLMiser does with images, see the [use cases page](/usecase).

## Frequently Asked Questions

### Can I just compare the digits to save time?

No. A digits-only comparison would have passed our fax-style copy's date, 17,04.2026, because the digits match the printed 17.04.2026. Separators, signs and letters change meaning too, so compare the whole value as printed.

### Does a high confidence score mean the numbers are right?

Not in our test. LLMiser's recognition code measured an average word confidence between 92.4 and 95.2 on all four copies, including the one that lost its totals. Confidence describes how sure the reader was about the words it found, not whether every field was found.

### Will a better scan fix letter O and zero mix-ups?

Not always. Our clean 200 dpi copy still read both identifiers with a letter O as zeros. A better scan helped with missing values, since the clean copy kept every quantity and total, but look-alike characters need a human check.

### Should I let an AI model fix OCR errors for me?

Not for identifiers and amounts. A model reading "PO 1005-B" has no way to know the page said "PO 10O5-B," and both look valid. Correct high-impact fields against the original yourself, then let the model work with text you've checked.

### Which fields should I check every time?

Anything someone will act on, copy into another system or calculate with: identifiers, amounts, totals, quantities, dates, percentages and signs. Spot-check ordinary sentences, but compare those fields one by one on every page.

Scan ready to check? [Convert it with LLMiser](/) and compare each high-impact field with the page.
