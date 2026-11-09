---
title: "Prepare Merged Excel Headers for Markdown Tables"
slug: "merged-excel-headers-markdown"
description: "Flatten the merged Excel headers Markdown tables can't hold: find grouped labels, build a one-row header copy with units, and test what each value means."
excerpt: "A Markdown table has one header row. Our two-level sheet converted into columns named Unnamed: 3, with units pushed into the data. A flat copy fixed all 24 values."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["Excel", "Spreadsheets", "Markdown", "Tables", "AI context"]
primaryKeyword: "merged Excel headers Markdown"
secondaryKeywords: ["flatten Excel headers", "multi-level column headers"]
banner: "/blog/merged-excel-headers-markdown/banner.svg"
bannerAlt: "LLMiser banner reading One header row. Two levels. A spreadsheet header on a paper card with Q1 2026 merged over Units, Revenue and Weight becomes a Markdown header reading Q1 2026, Unnamed: 3, Unnamed: 4."
featured: false
draft: true
---

**TL;DR:** A Markdown table has one header row, so a two-level merged header can't come through intact. Find every grouped label, make a sharing copy with one header row that names the group, measure and unit in each label, and check that every value can be named from its own row and column. In our test, none of 24 values in the original were fully labeled after conversion. Both flattened copies labeled all 24.

Spreadsheets love stacked headers. A quarter spans three columns, with Units, Revenue and Weight underneath, and a region label runs down the side of two rows. On screen it reads clearly. As a single-row table, it doesn't.

We built a small sales sheet with two-level headers and merged region labels, made two flattened copies by hand and converted all three with LLMiser's own code. This guide shows how to flatten the **merged Excel headers Markdown** tables can't represent, and how to check that the result still means the same thing.

## Identify grouped labels

Find every label that covers several others: a cell merged across columns, a units row under the headers, or a label merged down the side. A single-row table has nowhere to put that meaning.

Click a header cell and see how far the selection reaches. If one click selects a cell spanning several columns or rows, it's merged. Then look one row down: a row of short labels such as Units or Revenue (USD) under a merged group is a second header level, even if it isn't styled like one.

Our sheet had all three kinds. Region and Channel were each merged down across two header rows. "Q1 2026" and "Q2 2026" were each merged across three columns. The second header row held the measures and their units. And each region name was merged down over its two channel rows.

![An annotated spreadsheet header. Q1 2026 is merged across three columns and Q2 2026 across the next three. Under each, a second header row reads Units, Revenue (USD) and Weight (kg). Region and Channel are merged down over both header rows, and North and South are each merged over two data rows.](/blog/merged-excel-headers-markdown/grouped-labels.svg "The synthetic sales sheet with its grouped labels marked. Illustration of the fixture.")

Here's what conversion made of it. The first header row became the table's header, so the columns read Region, Channel, Q1 2026, Unnamed: 3, Unnamed: 4, Q2 2026, Unnamed: 6 and Unnamed: 7. The second header row, with every unit in it, became the first row of data. And the second row under each merged region said NaN instead of North or South.

![Converted table excerpt from the original sheet. Header: Region, Channel, Q1 2026, Unnamed: 3, Unnamed: 4, Q2 2026, Unnamed: 6, Unnamed: 7. First data row: NaN, NaN, Units, Revenue (USD), Weight (kg), repeated. Then North Retail with values, and NaN Wholesale with values.](/blog/merged-excel-headers-markdown/grouped-output.svg "Exact converted header and first rows of the original sheet, local run of LLMiser's conversion code, 9 November 2026.")

## Create a clearly labeled sharing copy

Make a copy for sharing with exactly one header row, where every column label names its group, its measure and its unit. Fill merged row labels into every row they covered, and leave the original workbook as it is.

The steps are mechanical:

1. Duplicate the sheet and work in the copy.
2. Unmerge every merged cell.
3. Combine the two header levels into one label per column, such as "Q1 2026 Revenue (USD)."
4. Delete the second header row.
5. Fill each region name into every row it covered.
6. Check that no header cell is blank.

Keep units inside the labels. In our original, the units lived in their own row, and that row was the first thing conversion turned into data. "Weight (kg)" in every weight column costs a few characters and removes the guesswork.

![A header map. Two-row headers on the left, one-row labels on the right. Q1 2026 over Units becomes Q1 2026 Units. Q1 2026 over Revenue (USD) becomes Q1 2026 Revenue (USD). Q1 2026 over Weight (kg) becomes Q1 2026 Weight (kg). The same pattern applies to Q2 2026. A merged North over two rows becomes North in both rows.](/blog/merged-excel-headers-markdown/header-map.svg "How each two-row header became a one-row label in the flat sharing copy. Illustration based on the fixture.")

There are two good shapes for the copy. A wide copy keeps the original layout with longer labels: four rows and eight columns in our case. A long copy gives each region, channel and quarter its own row with a Quarter column: eight rows and six columns. Both labeled every value in our test.

Choose wide when readers expect the original layout and there are only a few groups. Choose long when there are many groups, or when you'll ask a model to compare quarters, since every row then states its own quarter.

Whichever shape you pick, check the copy against the original before converting. Our copies held the same 24 values as the source sheet, and a quick count of rows and a total or two will confirm yours do.

## Compare row-column meaning

Pick values from the converted table and name each one using only its own row and its column header. If you need another row or the original sheet to say what a number means, the table isn't ready to share.

We ran that check on all 24 values in each converted table, asking whether the region, channel, quarter and measure could each be read from the value's own row and header.

![A results table. Original sheet: 24 values, 0 fully labeled, with the measure missing for all 24, the quarter for 16 and the region for 12. Flat copy: 24 of 24 fully labeled. Long copy: 24 of 24 fully labeled.](/blog/merged-excel-headers-markdown/meaning-results.svg "Values that could be named from their own row and column header, local run on the synthetic sheet, 9 November 2026.")

In the original's output, not one value passed. The measure was missing for all 24, because the units sat in a data row. The quarter was missing for 16, because those columns were headed "Unnamed." The region was missing for 12, in the rows that said NaN.

Take the value 1417.5. In the original's output, it sat under "Unnamed: 6" in a row reading North, Retail. To know it was second-quarter revenue in US dollars, a reader had to look two columns left for the quarter and one row up for the measure. In the flat copy, its header said "Q2 2026 Revenue (USD)," and the row said North, Retail.

For a real file, spot-check four or five values rather than all of them. Include one from the last column and one from a row that sat under a merged label, since those are where meaning drops out first.

![A checklist: merged headers and units rows found, a sharing copy made with one header row, group, measure and unit in every label, merged row labels filled down, values and totals matched with the original, four or five values named from their row and column alone. Limitation: flattening is manual, and conversion doesn't repair merged cells.](/blog/merged-excel-headers-markdown/headers-checklist.svg "A header pass before a model reads a grouped table. Illustration.")

These results come from one small synthetic sheet. Larger workbooks have more levels and more ways to merge, so keep the meaning check as your final test. For what LLMiser does with spreadsheets, see the [use cases page](/usecase).

## Frequently Asked Questions

### Does LLMiser unmerge headers or fill merged cells automatically?

No. In our test, a label merged across columns appeared once, and the other columns were headed "Unnamed." A label merged down appeared in its first row only, with NaN below. Flatten the sheet in a copy before converting.

### What does "Unnamed: 3" mean in my table?

It's a placeholder for a column whose cell in the first header row was empty, usually because a merged label above it sat in the first column of its group. The number is the column's position, counting from zero.

### Should I use a wide or a long copy?

Both labeled all 24 values in our test. Wide keeps the familiar layout with fewer rows. Long adds rows but gives each one its own quarter, which suits tables with many groups or questions that compare periods.

### Why keep units in every label?

Because the units row is the first thing to become data. In our original, Units, Revenue (USD) and Weight (kg) came out as a data row, so no value in the table had a unit in its header.

### Can I just describe the header layout in my prompt instead?

It's better than nothing, but the table would still carry "Unnamed" columns and NaN rows, and the model would have to map every value back to your description. A labeled copy states the meaning in the table itself, where a reader can check it.

Sharing copy ready? [Convert it with LLMiser](/) and name a few values from their row and column alone.
