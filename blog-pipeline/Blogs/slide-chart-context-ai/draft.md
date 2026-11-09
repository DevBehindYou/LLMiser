---
title: "Carry Chart Context From Slides Into AI Prompts"
slug: "slide-chart-context-ai"
description: "Keep the PowerPoint chart context AI models need: name each chart's question, move units and labels into text that survives, and keep the image when shape matters."
excerpt: "Our churn chart showed 4.2%. The converted text said 0.042. Chart values survive conversion, but the percent signs, currency and axis ranges live in formatting."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["PowerPoint", "Charts", "Data quality", "Markdown", "AI context"]
primaryKeyword: "PowerPoint chart context AI"
secondaryKeywords: ["chart units lost in conversion", "describe a chart for AI"]
banner: "/blog/slide-chart-context-ai/banner.svg"
bannerAlt: "LLMiser banner reading The slide said 4.2%. A paper card shows a small line chart with data labels 4.2%, 5.1% and 7.8%, and beside it the converted table with 0.042, 0.051 and 0.078 under the heading Churn."
featured: false
draft: true
---

**TL;DR:** A converted chart keeps its title, category names, series names and stored values. It loses what the formatting adds: percent signs, currency, axis titles, axis ranges and the percentages a pie chart calculates. Write down the question each chart answers, move units and the takeaway into text that survives, and keep the image when the shape is the evidence. In our test, a churn chart showing 4.2% converted as 0.042.

A chart on a slide carries two kinds of information. Some is data stored in the chart. The rest is formatting: the percent sign, the dollar sign, the axis that starts at 4 instead of 0. Text conversion keeps the first kind.

We built a synthetic deck of four native charts, each with one piece of context hidden in its formatting, and converted it with LLMiser's own code. This guide shows how to keep the **PowerPoint chart context AI** models need when they only see text.

## Identify the question and chart evidence

For each chart, write one sentence naming the question it answers and the values that answer it. If you can't write that sentence from the converted table alone, the table is missing context a reader needs.

Our four charts had the short titles real decks often use: "Churn," "Signups," "Q3" and "Revenue." On the slide, the formatting filled in the rest. In the converted text, each became a `### Chart:` heading with that title and a small table of stored values.

![A comparison of four charts. Churn: the slide showed 4.2%, 5.1% and 7.8%, the output 0.042, 0.051 and 0.078. Plan versus actual signups: the slide's axis started at 4, the output had values only. Revenue share: the slide's pie labels showed North 45%, the output 45.0 under the header Revenue. Quarterly revenue: the slide showed $125,000 and an axis title Revenue (USD), the output 125000.0 with no axis title.](/blog/slide-chart-context-ai/slide-vs-output.svg "What each chart showed on the slide and what its converted table said, local run of LLMiser's conversion code, 9 November 2026.")

Now try answering a question from the output alone. "What was churn in September?" The table says 0.078, under a column called Churn. A careful reader might guess a fraction. A hurried one, or a model, could report 0.078%. The slide said 7.8%.

The same test on the pie chart fails differently. "45.0" under "Revenue" could be dollars, thousands or a share. Only the slide's data labels, which the chart calculated as percentages, said it was 45% of the total.

So for each chart, write the question and the answer you expect: "Churn rose from 4.2% to 7.8% of accounts between July and September." Then check that the converted text supports that sentence. Ours didn't, for any of the four charts.

## Record axes, units and legend

Move every unit and label that lives in chart formatting into text that survives: the chart title, the series names and a sentence on the slide. Then check that the stored values match the unit you named.

Here's what survived and what didn't in our run:

![A table of chart parts. Kept: the chart title as a Chart heading, category names, series names as column headers and the stored values. Lost: percent and currency signs, thousands separators, axis titles, the axis start and end, data labels and pie percentages, and the visual trend.](/blog/slide-chart-context-ai/survives-and-lost.svg "What a native chart kept and lost in the converted text, local run, 9 November 2026.")

The fixes follow from that list. Put the unit in the chart title, such as "Quarterly revenue, USD." Put it in each series name too, such as "Revenue (USD)," because the series name becomes the column header. Write units in words where a symbol would only live in a format.

Then add one sentence on the slide stating the takeaway, with its numbers and units: "Q3 revenue was $162,250, up 23% on Q2." Slide text converts as plain text, so this sentence reaches the reader even if nobody looks at the table.

We made those changes in a reviewed copy and converted it again. Every table now had a unit in its header, and every slide opened with its takeaway.

One fix created a new problem first. We renamed the churn series "Churn rate (%)" but left the stored values as 0.042, 0.051 and 0.078, so the output put 0.042 under a percent header. That's worse than before, since it now reads as 0.042%. Storing the values as 4.2, 5.1 and 7.8, with a format that simply adds a % sign, made the header and the numbers agree.

![Three versions of the churn chart's converted table. Original: Chart: Churn, values 0.042, 0.051, 0.078 under Churn. First fix: Chart: Monthly churn rate, % of accounts, values still 0.042 under Churn rate (%), marked as a mismatch. Reviewed: the same title, values 4.2, 5.1, 7.8 under Churn rate (%), preceded by the sentence Churn rose from 4.2% to 7.8% of accounts.](/blog/slide-chart-context-ai/churn-fix.svg "The churn chart's converted text in three versions of the deck, local run, 9 November 2026.")

## Keep the visual when needed

Some charts make their point through shape: a widening gap, a spike, a cluster of points. When the shape is the evidence, send the chart image along with the text, and say in words what the reader should notice.

A small table works when the chart has a few values, like our three months. It works less well for two years of weekly data, where the point is a seasonal pattern or one outlier. A model can read every number and still miss what the picture made obvious.

The reverse also happens. Our plan-versus-actual chart started its value axis at 4, which made the September gap look dramatic. The converted table showed the plain numbers, 6.0 against 7.8. If you send the image, say where the axis starts. If you send only text, the takeaway sentence should carry the size of the gap in numbers.

Charts pasted as pictures are a separate case. LLMiser's converted text includes a picture's alt text, not what's drawn in it. Rebuild those charts as native charts, or describe them in a sentence on the slide.

![A decision diagram. Start: a chart that supports a claim. Question: is the shape the evidence? Yes: send the chart image too, and note axis ranges. No: the table plus a takeaway sentence is enough. Then check every number in the description against the chart.](/blog/slide-chart-context-ai/keep-visual-decision.svg "When a chart image should travel with the converted text. Illustration.")

Whichever you choose, check the description against the chart. Every number in your takeaway sentence should appear on the chart or in its data, with the same unit.

![A checklist: the question each chart answers written in one sentence, units in chart titles and series names, stored values matching the named unit, a takeaway sentence on each chart slide, axis ranges noted when the image travels too, picture charts rebuilt or described. Limitation: number formats, axis titles and data labels don't survive conversion.](/blog/slide-chart-context-ai/chart-checklist.svg "A chart context pass before a model reads a converted deck. Illustration.")

These results come from one synthetic deck built with python-pptx. Charts made in PowerPoint can store their data differently, so convert one of yours and run the same test. For what LLMiser does with presentations, see the [use cases page](/usecase).

## Frequently Asked Questions

### Does LLMiser keep chart data from PowerPoint?

For native charts, yes in our test. Each chart became a heading with its title and a table of categories, series names and stored values. The formatting around those values, such as percent and currency signs, didn't come through.

### Why does my percentage show as 0.042?

The chart stored the fraction 0.042 and formatted it as 4.2% for display. Conversion keeps the stored value. Either name the unit as a fraction, or store the values as 4.2 and add the % sign with the format.

### Where did my axis title go?

It wasn't in our converted output. Our revenue chart's axis title, "Revenue (USD)," disappeared. Put the unit in the chart title or the series name, since both of those came through.

### Should I describe every chart in words?

Describe every chart that supports a claim someone will act on. One sentence with the key numbers and units is usually enough. A decorative chart that only repeats the slide text can stay as it is.

### Can I send the chart image to the model instead?

If the model accepts images, sending one alongside the text helps when the shape is the point. Still add the takeaway sentence and note any axis that doesn't start at zero, so the numbers and the picture agree.

Charts labeled and described? [Convert the deck with LLMiser](/) and test each chart's question against the output.
