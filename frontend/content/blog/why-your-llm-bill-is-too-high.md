---
title: "Why Your LLM Bill Is Too High, and Where the Waste Hides"
slug: "why-your-llm-bill-is-too-high"
description: "Your LLM API cost is often inflated by repeated prompts, endless history, raw PDFs, off-topic retrieval, wordy output and an overkill model. Find the leaks."
excerpt: "LLM bills are rarely high because AI is expensive. They're high because each request carries tokens nobody needed. Here's how one question grows to 31,970 tokens."
date: "2026-10-03"
author: "DevBehindYou"
category: "COST"
tags: ["LLM API cost", "AI API costs", "Cost audit", "Token waste", "LLM cost optimization"]
primaryKeyword: "LLM API cost"
secondaryKeywords: ["AI API costs", "LLM cost optimization"]
banner: "/blog/why-your-llm-bill-is-too-high/banner.svg"
bannerAlt: "LLMiser banner: a tall stack of coins labelled you pay next to a short stack labelled you need, with a magnifying glass over the gap."
draft: false
---

**TL;DR:** Many **LLM API cost** problems are waste problems. In our worked example, a single document question grows from 60 tokens to about 32,000 once you add a repeated system prompt, full chat history, raw PDF pages, off-topic retrieval and a long answer. A lean version of the same request is about 5.4x smaller. Audit before you switch models.

An LLM bill that keeps climbing usually isn't a pricing problem. In practice, it's a packing problem: each request quietly carries tokens nobody asked for.

This article builds one realistic request step by step, shows where each extra token comes from, and ends with a one-hour audit you can run on your own traffic. The numbers are a worked example, not a benchmark. The method is what carries over.

## Start with a question that costs almost nothing

A user question is usually tens of tokens. On its own, it costs a fraction of a cent on any current model. The cost comes from everything an app sends along with it.

Take a document assistant. The user types "What did the contract say about late payment fees?" That's about 60 tokens. At Claude Sonnet 5.5's list price of $2 per million input tokens, from the [pricing page](https://platform.claude.com/docs/en/about-claude/pricing) (checked 20 October 2026), it costs $0.00012.

Now watch what happens before the request leaves your server.

## How one question becomes 31,970 tokens

Each layer an app adds looks reasonable on its own. Stacked together, they multiply the request. Here's a typical build-up, counted in input-token equivalents.

![Waterfall: your question 60, duplicated system prompt plus 2,000, full chat history plus 5,000, raw PDF of 6 pages plus 13,410, off-topic retrieval plus 4,000, a 1,500-token answer counted at 5x plus 7,500, total 31,970.](/blog/why-your-llm-bill-is-too-high/bloated-request.svg "Illustration, not a measurement. Output is counted at 5x because that's its price ratio to input on current Claude models.")

Walk through it layer by layer:

- **Duplicated system prompt (+2,000).** Instructions copied from three earlier prompts, half of them saying the same thing.
- **Full chat history (+5,000).** Every earlier turn, resent so the model "remembers".
- **Raw PDF (+13,410).** Six contract pages sent as text plus page images, about 2,235 tokens each in our [PDF worked example](/blog/markdown-vs-pdf-llm-tokens).
- **Off-topic retrieval (+4,000).** Ten chunks from a search step. Seven of them are about other clauses in other contracts.
- **Long answer (+7,500).** A 1,500-token reply with a summary nobody asked for. Output costs five times input on current Claude models, so it counts as 7,500.

None of these is a bug. Each was added by someone trying to make answers better. Nobody added them up.

## The lean version of the same request

Keep what the model needs, drop what it doesn't. The lean request in this example is 5,894 token-equivalents, about 5.4 times smaller, with the same information available to the model.

![Stacked bars: bloated 31,970 made of question, prompt, history, document, retrieval and answer. Lean 5,894, 5.4x smaller.](/blog/why-your-llm-bill-is-too-high/bloated-vs-lean.svg "Lean version: cached prompt, a 5-line history summary, the 2 relevant pages as Markdown, trimmed retrieval and a 500-token answer.")

Here's what changed, layer by layer:

| Layer          | Bloated | Lean  | What changed                     |
|----------------|--------:|------:|----------------------------------|
| System prompt  |   2,000 |   200 | Deduplicated, then cached        |
| History        |   5,000 |   800 | Short summary, not full replay   |
| Document       |  13,410 | 1,334 | 2 relevant pages, as Markdown    |
| Retrieval      |   4,000 | 1,000 | Reranked, capped                 |
| Answer (x5)    |   7,500 | 2,500 | 500 tokens, asked for directly   |

The cached prompt counts at 10% because that's the standard cache hit price on Claude, per the [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). Sonnet 5.5 and Opus 5.5 charge 5%, so on those models the lean figure is a little lower still. The PDF pages shrink because Markdown drops the page images: a 500-word page is about 667 tokens as text.

Your own ratio depends on which of these leaks you have. One leak might trim a tenth of a request. Several of them stacked together can do what this example shows, or more. You only find out by measuring.

## The model choice multiplies everything

Waste is multiplied by the price per token. Defaulting every request to the top tier turns a moderate waste problem into a big one, so choose the model after you trim the request.

![Bars of input price per million tokens: Haiku 5.5 10 cents, Haiku 4.5 1 dollar, Sonnet 5.5 2 dollars, Opus 5.5 4 dollars, Fable 5.1 10 dollars, 100 times Haiku 5.5.](/blog/why-your-llm-bill-is-too-high/model-tiers.svg "Source: [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing), list prices checked 20 October 2026. Haiku 5.5 prices apply to prompts up to 100,000 tokens.")

On Claude's current price list, the input price runs from $0.10 to $10 per million tokens across tiers. Run the bloated request on Opus 5.5 and it costs about 12.8 cents. Run the lean one on Sonnet 5.5 and it's about 1.2 cents. Same question, roughly a tenth of the price.

Research supports routing by difficulty. The 2024 [RouteLLM](https://arxiv.org/abs/2406.18665) paper trained routers that sent easier queries to a cheaper model and cut costs by more than 2x without sacrificing response quality on public benchmarks.

## Six leaks to look for in your own requests

Every leak above has a matching fix. You don't need all six. Find the two or three that are biggest in your own traffic, start there, and leave the rest until the numbers say they matter.

![Six cards: repeated prompt, endless history, raw documents, off-topic retrieval, overkill model and wordy output, each with a short fix.](/blog/why-your-llm-bill-is-too-high/six-leaks.svg "The six leaks from the worked example, with the first fix to try.")

A few notes from practice:

- **Repeated prompts** are the easiest win. Cut duplicates, then cache the stable part at the start of the prompt.
- **Endless history** hides in chat products. Summarize old turns instead of replaying them.
- **Raw documents** are often the biggest single line in document apps. Convert PDFs to Markdown before they reach the model. [LLMiser](/) does that for free, including scanned pages. Keep the page image whenever a chart, photo or diagram holds the answer you need.
- **Wordy output** costs five times input per token. Ask for the format you need and set a sensible output cap.

## The one-hour cost audit

Measure real traffic, split each request into its parts, fix the biggest part first, and prove quality held. One hour of honest measurement beats a week of guessing at **AI API costs**.

![A checklist file: measure tokens per call and split input by part, fix the top three one change at a time, then re-run a fixed set of real questions and keep only changes that hold quality.](/blog/why-your-llm-bill-is-too-high/audit-checklist.svg "Run it monthly, or whenever the bill jumps.")

Most APIs return exact input and output token counts with every response. Log them for a day, along with the size of each part of the prompt. Sort by total. The top three parts are your plan.

Then change one thing at a time and re-run the same set of real questions. If answers get worse, roll it back. **LLM cost optimization** that hurts quality isn't a saving. It just moves the cost from your invoice to your users, who pay it in wrong answers and extra follow-up questions.

## Frequently Asked Questions

### Why is my LLM API bill so high?

Usually because each request carries far more tokens than the question needs. Repeated instructions, full chat history, raw PDF pages, off-topic retrieved text and long answers add up quickly. Measuring the parts of each request shows which one dominates.

### Is it cheaper to use a smaller model?

Often, for simple tasks. On current Claude prices, input runs from $0.10 to $10 per million tokens across tiers. Route easy requests to a smaller model, then check quality on a fixed test set of real questions before you switch everything over. Trim the request first, because a smaller model still bills every wasted token.

### How do I find out where my tokens go?

Log the input and output token counts your API returns, and estimate the size of each part of the prompt: instructions, history, documents and retrieved text. Sort by size. The largest part is where to start.

### Do long answers really cost that much?

Yes. On current Claude models output tokens cost five times input tokens. A 1,500-token answer costs as much as 7,500 tokens of input, which is more than many whole prompts. Asking for a shorter format often saves more than trimming the prompt.

### How much can converting PDFs to Markdown save?

When the app sends page images, a 500-word page drops from about 2,235 tokens to about 667 in our worked example, roughly 70%. Sending only the relevant pages saves even more. Apps that send extracted text only save less, so measure yours.

### How much will fixing these leaks save?

There's no fixed number. The worked example in this article came out 5.4x smaller, but it stacks six leaks on purpose. Measure each fix, and keep only what holds answer quality.

Plug the biggest leak first with the [free converter](/), then follow [how to measure savings for your model](/usecase).
