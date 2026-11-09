---
title: "Keep Leading Zeros When Preparing Excel Data for AI"
slug: "excel-leading-zeros-ai"
description: "Keep the Excel leading zeros AI models need: sort ID columns from quantities, check what each cell stores and compare the output. A CSV export kept every zero."
excerpt: "We stored account numbers as text, formatted others to show zeros, and built a third set with a formula. All three lost their zeros in one conversion route."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["Excel", "Spreadsheets", "Data quality", "CSV", "AI context"]
primaryKeyword: "Excel leading zeros AI"
secondaryKeywords: ["Excel ID column leading zeros", "stored value vs displayed value Excel"]
banner: "/blog/excel-leading-zeros-ai/banner.svg"
bannerAlt: "LLMiser banner reading 00123 is not 123. A spreadsheet column of account numbers on a paper card, stored as text with leading zeros, turns into a Markdown column without them, while a CSV path keeps them."
featured: false
draft: true
---

**TL;DR:** Sort every column into identifiers and quantities, check what each ID cell actually stores, and compare the converted ID columns with the sheet. In our test, digit-only ID columns lost their leading zeros when the workbook was converted, even when stored as text. Exporting the sheet to CSV and converting that kept every zero.

An account number of 00123 and one of 123 can name two different customers. A spreadsheet keeps that difference only if the zeros are stored, and only if the conversion keeps them.

We built a small workbook with ten columns of identifiers and quantities, stored in the ways spreadsheets usually hold them, and converted it with LLMiser's own code. This guide shows how to keep the **Excel leading zeros AI** models need to tell records apart, and what each storage choice did in our test.

## Identify identifier columns

Before you convert, decide which columns are identifiers and which are quantities. An identifier names a record, a quantity measures something, and only quantities should ever be treated as numbers.

A quick test helps: would you ever add, average or round the values in this column? If not, it's an identifier, even when every value is made of digits. Account and customer numbers, ZIP and postal codes, SKUs, invoice and order numbers, member numbers and phone numbers all belong here.

Three signs point to an identifier. The values have a fixed width, such as five digits. Some of them start with zero. Or they're longer than 15 digits, which a spreadsheet can't hold exactly as a number.

![Ten columns sorted into identifiers and quantities. Identifiers: Account, Account with a blank, SKU, Formatted, Text formula, Member 16 digits, Ref 20 digits and Phone. Quantities: Qty and Unit price. Each identifier is labeled with how it was stored: text, number with a format, or formula.](/blog/excel-leading-zeros-ai/id-columns.svg "The ten columns of the synthetic test workbook and how each was stored. Illustration of the fixture.")

Our workbook had eight identifier columns and two quantities. The identifiers covered the usual cases: text IDs, a text column with one blank, a mix of digits and letters, numbers formatted to show zeros, a formula that builds a padded ID, 16 and 20-digit IDs stored as text, and phone numbers with spaces.

## Inspect stored value versus formatting

Click an ID cell and read the formula bar, not the grid. The grid shows a cell's formatted value, while the formula bar shows what the cell actually stores, and conversion starts from what's stored.

There are three common ways a cell can show 00123:

- **Stored as text.** The formula bar shows 00123. The cell was formatted as Text before typing, or the value was typed with an apostrophe first.
- **A number with a format.** The formula bar shows 123. A custom format such as 00000 pads it for display. Our Formatted column worked this way.
- **A formula result.** The formula bar shows something like `=TEXT(D2,"00000")`, which turns the number into padded text.

![A decision diagram. Start: an ID cell that shows 00123. Question: does the formula bar show 00123? Yes: stored as text, the zeros are real but can still be dropped. No: the zeros come from a format or a formula, so the stored value is 123. Either way, compare the converted column with the sheet.](/blog/excel-leading-zeros-ai/stored-vs-shown.svg "Read the formula bar to see what a cell stores. Illustration.")

Knowing which one you have tells you where the real ID lives. If the zeros are only formatting, the stored number is 123, and anything that reads stored values will see 123.

Long IDs need one more check. Microsoft's guide on [keeping leading zeros and large numbers](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers) explains that Excel keeps only 15 significant digits of a number and replaces later digits with zeros. If a 16-digit ID was ever entered as a number, the formula bar already shows the changed digits. No conversion can restore them, so retype or re-export those IDs as text from the system they came from.

## Compare converted output

Convert the workbook, then put each ID column from the output next to the same column in the sheet. Check a value that starts with zero, the longest value and any blank cell in every identifier column.

Here's what our workbook's conversion produced, column by column:

![A comparison table. Account stored as text: 00123 became 123. Account with a blank: 123.0, and the blank became NaN. SKU mixing digits and letters: 00123 kept. Formatted number: 123. Text formula result: 123. 16-digit member ID: 0099123400005679 became 99123400005679. 20-digit reference: leading zeros dropped. Phone with spaces: kept. Qty: 12 kept.](/blog/excel-leading-zeros-ai/xlsx-results.svg "Converted workbook columns compared with the sheet, local run of LLMiser's conversion code, 9 November 2026.")

Every column made only of digits lost its leading zeros. It didn't matter whether the cells were stored as text, formatted as numbers or built with the TEXT formula. The 16 and 20-digit IDs kept their other digits but lost the zeros in front.

One blank cell made things worse. In the Account column with a gap, every ID came out as a decimal, such as 123.0, and the empty cell came out as "NaN." A model reading that table sees numbers with decimal places and a value that looks like data, not a gap.

Two columns came through intact. The SKU column kept 00123 because it also held values like A-0456, and the phone numbers kept their zeros because they contained spaces. LLMiser's Excel conversion decides each column's type from its values. A column where every filled cell looks like a number is read as numbers, whatever the cell format says.

Don't rely on a stray letter to protect a column. The fix that worked in our test was a different route: save the sheet as CSV and convert the CSV.

![Two panels for the Account column. Workbook converted: 123, 456, 1789, 10001. Sheet saved as CSV, then converted: 00123, 00456, 01789, 10001. The CSV route also kept the formatted and formula columns as 00123 and left the blank cell empty.](/blog/excel-leading-zeros-ai/csv-route.svg "The same sheet through the workbook route and the CSV route, local run, 9 November 2026. The CSV was exported with LibreOffice Calc.")

Our CSV export, made with LibreOffice Calc, wrote each cell as it was displayed. After conversion, every ID kept its zeros, the formatted and formula columns showed 00123, and the blank stayed blank. Prices kept their dollar signs and separators too.

Three cautions apply. Microsoft notes in its guide to [importing and exporting text files](https://support.microsoft.com/en-us/excel/get-started/import-or-export-text-txt-or-csv-files) that saving as CSV saves only the current worksheet, so repeat it for each sheet you need. The same guide recommends its import wizard when leading zeros must survive opening a CSV, so don't reopen and resave the file before you upload it. And check your own app's CSV in a plain text editor, since we tested one export, not every spreadsheet app.

Then compare again. Open the converted CSV output next to the sheet and check the same three values in each ID column.

![A checklist: every column marked as identifier or quantity, formula bar checked for each ID column, IDs longer than 15 digits stored as text, ID-heavy sheets exported to CSV, a zero-led value, the longest value and blanks compared in the output. Limitation: one synthetic workbook, one CSV export app.](/blog/excel-leading-zeros-ai/zeros-checklist.svg "A leading-zero pass before a model reads the data. Illustration.")

These results come from one synthetic workbook converted with LLMiser's current code. Other files may mix types differently, so keep comparing the output rather than trusting the format. For what LLMiser does with spreadsheets, see the [use cases page](/usecase).

## Frequently Asked Questions

### Why did my Text-formatted ID column still lose its zeros?

Because every value in it looked like a number. In our test, LLMiser's Excel conversion read that column as numbers even though each cell was stored as text. Exporting the sheet to CSV and converting that file kept the zeros.

### Why does my ID column show 123.0 and NaN?

A blank cell in a digit-only column did that in our test. The whole column came out as decimals, and the blank came out as NaN. The CSV route avoided both: the IDs kept their zeros and the blank stayed empty.

### Can LLMiser restore digits Excel already changed?

No. If an ID longer than 15 digits was stored as a number, Excel already replaced its later digits, and the file no longer contains them. Get the original IDs from the system they came from and store them as text.

### Do quantity columns need the same care?

Not for zeros. Our Qty column came through unchanged. Prices kept their values but lost the dollar sign and the thousands separator in the workbook route, so mention the currency in your prompt or use the CSV route.

### Will an AI model notice that 123 should be 00123?

It has no way to know. The converted text says 123, and nothing tells the model that the ID has five digits. Fix the data first, and if IDs follow a fixed width, say so in your prompt as a second safeguard.

Workbook ready to check? [Convert it with LLMiser](/) and compare every ID column with the sheet.
