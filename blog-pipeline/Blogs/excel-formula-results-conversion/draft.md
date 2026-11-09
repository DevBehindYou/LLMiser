---
title: "Check Excel Formula Results Before Conversion"
slug: "excel-formula-results-conversion"
description: "An Excel formula results conversion check: mark formula cells, recalculate and save a dated copy, then test the converted values. Errors looked like blanks."
excerpt: "A converted workbook carries each formula's last saved result. We changed one quantity, and the old total came straight through. Re-saving didn't fix it."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["Excel", "Spreadsheets", "Formulas", "Data quality", "AI context"]
primaryKeyword: "Excel formula results conversion"
secondaryKeywords: ["stale formula values Excel", "Excel saved formula results"]
banner: "/blog/excel-formula-results-conversion/banner.svg"
bannerAlt: "LLMiser banner reading Saved is not current. A paper card shows an order row with quantity 20 and an amount of 126.00 carried into Markdown, while the quantity times the price is 210.00."
featured: false
draft: true
---

**TL;DR:** A converted workbook carries each formula's last saved result, not the formula and not a fresh calculation. Mark which cells hold formulas, force a full recalculation and save a dated copy, then check the converted values against their neighbors. In our test, a changed quantity left an old total in the output, and formula errors looked exactly like blank cells.

Every formula cell in a saved workbook holds two things: the formula, and the result from the last time the file was calculated. LLMiser's conversion reads that saved result. It doesn't recalculate anything.

We built one synthetic order sheet, saved it in five states and converted each with LLMiser's own code. This guide turns that test into an **Excel formula results conversion** check you can run before an AI model reads your numbers.

## Separate formulas from calculated values

Before you convert, find every cell that holds a formula. Typed values come through as typed, but a formula cell's output depends on when and how the file was last calculated, so those are the cells to check.

Excel can show formulas in place of results. Microsoft's guide to [showing and printing formulas](https://support.microsoft.com/en-us/excel/show-and-print-formulas) describes the Ctrl+` shortcut and the Show Formulas button on the Formulas tab. Switch it on, note which columns and totals are formulas, and switch it off again.

Our order sheet had nine formulas: three line amounts, a total, a tax line, a grand total, a price lookup, a per-unit ratio and a "days since" count. Two of them returned errors on purpose. The lookup searched for an item that wasn't there and returned #N/A. The ratio divided by an empty cell and returned #DIV/0!.

![An annotated order sheet. Typed values: item names, quantities, unit prices and the tax rate. Formula cells: Amount equals quantity times unit price, Total equals the sum of amounts, Tax, Grand total, a price lookup returning #N/A, a per-unit ratio returning #DIV/0! and Days since 1 Oct using TODAY.](/blog/excel-formula-results-conversion/formula-cells.svg "The synthetic order sheet with its formula cells marked. Illustration of the fixture.")

Pay extra attention to formulas that depend on the date, such as TODAY() and NOW(). Their saved result is the value on the day the file was last saved. Our "days since 1 October" cell came out as 39, the count on the day we saved it. Nothing in the output says which day that was.

## Save a reviewed source copy

Recalculate the whole workbook, check a few results, and save it as a dated copy that you then convert. The copy gives you a known calculation state to point to, instead of whatever state the file happened to be saved in.

A workbook's saved results can be older than its inputs. Microsoft's page on [formula recalculation](https://support.microsoft.com/en-us/excel/change-formula-recalculation-iteration-or-precision-in-excel) explains that manual calculation mode turns on "Recalculate workbook before saving," and that clearing that box can speed up saving. A file saved that way can carry results that don't match its inputs. Tools that write values into a template can leave the same mismatch.

We reproduced it. In a saved copy of our sheet, we changed the Gasket quantity from 12 to 20 inside the file without recalculating, the way such a tool might. The converted output showed a quantity of 20 next to the old amount of 126.00, and every total below it was the old one too.

![A table of five workbook states and their converted values. Saved by an app: quantity 12, amount 126.00, grand total 4167.51, correct. Input changed without recalculation: quantity 20, amount 126.00, grand total 4167.51, stale. Re-saved with default settings: still 126.00 and 4167.51, stale. Recalculated on load, then saved: 210.00 and 4257.81, correct. Written by a script: quantity 12, every formula NaN.](/blog/excel-formula-results-conversion/workbook-states.svg "One order sheet in five states, converted with LLMiser's code, local run, 9 November 2026. App saves made with LibreOffice Calc.")

Re-saving wasn't enough. We opened the stale file in LibreOffice Calc with its default settings and saved it again. The old results stayed, because the app trusted the saved values instead of recalculating them. Only when we set Calc to recalculate on load did the amount become 210.00 and the grand total 4,257.81.

So force a full recalculation before you save the reviewed copy. In Excel, Microsoft's same page lists Ctrl+Alt+F9, which checks dependent formulas and recalculates all formulas in all open workbooks, whether or not they changed. Other spreadsheet apps have their own full recalculation command.

![A flow of five steps: show formulas, run a full recalculation, check two or three results by hand, save a dated copy, convert that copy.](/blog/excel-formula-results-conversion/review-copy-steps.svg "A reviewed copy gives the conversion a known calculation state. Illustration.")

Then save the copy with the date in its name, such as order-2026-11-09.xlsx, and note where it came from: the app, the date and the fact that you ran a full recalculation. If the numbers end up in a report or a prompt, that note tells everyone which calculation they reflect.

## Inspect actual Markdown values

Open the converted Markdown and check the formula results there, not in the spreadsheet. Recompute two or three of them from the values beside them, and look up every "NaN" in the sheet to see what it stands for.

Recomputing is quick and catches stale results. In our stale output, the Gasket row read 20 times 10.50 with an amount of 126.00. Twenty times 10.50 is 210.00, so the mismatch was visible right in the Markdown, once someone did the multiplication.

"NaN" needs a closer look, because in our output it stood for four different things. A truly empty cell, the #N/A from the failed lookup and the #DIV/0! from the empty divisor all came out as NaN. In the script-written copy, which no app had ever calculated, every formula came out as NaN too.

![A table mapping the same output, NaN, to four different cells in the sheet: an empty cell, a #N/A lookup error, a #DIV/0! division error and a formula with no saved result in a script-written file.](/blog/excel-formula-results-conversion/nan-meanings.svg "Four different cells that all converted to NaN, local run, 9 November 2026.")

A model reading that table can't tell a failed lookup from an empty cell. Fix errors in the source copy, or replace them with a clear label such as "not found," before you convert.

Decimal places can shift too. Our quantities came out as 12.000, 3.000 and 1.000, with the same three decimals as the 0.075 tax rate further down the same column. The values were right, but a reader could take them for measurements.

![A checklist: formula cells identified, date-based formulas noted with their save date, full recalculation run before saving, dated reviewed copy converted, two or three results recomputed from the output, every NaN looked up in the sheet. Limitation: the converter reads saved results and doesn't recalculate.](/blog/excel-formula-results-conversion/formula-checklist.svg "A formula results pass before an AI model reads the numbers. Illustration.")

These results come from one synthetic sheet saved with LibreOffice Calc, not Excel. Excel files store saved results the same way, but check your own app's calculation settings. For what LLMiser does with spreadsheets, see the [use cases page](/usecase).

## Frequently Asked Questions

### Does LLMiser recalculate formulas during conversion?

No. It reads the result saved in the file. In our test, a file whose quantity changed without recalculation converted with the old amount and totals. Recalculate and save in a spreadsheet app first.

### Why do my formula cells show NaN?

In our test, NaN meant one of three things for a formula: the file had no saved result because a script wrote it, the formula returned an error such as #N/A, or it returned #DIV/0!. Empty cells showed NaN too. Look each one up in the sheet.

### Will the formulas themselves appear in the output?

No, only their results. If a reader needs to know how a number was derived, add a short note to your prompt or the document, such as "Amount is quantity times unit price."

### Isn't opening and saving the file enough?

Not always. Re-saving our stale file with LibreOffice Calc's default settings kept the old results. A full recalculation, such as Ctrl+Alt+F9 in Excel, recalculates every formula before you save.

### How should I handle TODAY() and NOW()?

Their saved result reflects the day the file was last saved. State that date when you share the numbers, or replace the formula with a fixed date in your reviewed copy so the result can't drift.

Workbook recalculated and saved? [Convert it with LLMiser](/) and recompute a few totals from the output.
