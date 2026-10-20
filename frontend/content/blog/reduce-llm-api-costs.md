---
title: "How to Reduce LLM API Costs Without Losing Quality"
slug: "reduce-llm-api-costs"
description: "Reduce LLM API costs without hurting quality: batch async work, cache repeated prompts, shrink documents, route easy requests and cap output. With real prices."
excerpt: "Switching to a cheaper model is the least interesting way to save money on LLM APIs. Here are seven levers that cut waste instead, with the math behind each one."
date: "2026-10-03"
author: "DevBehindYou"
category: "COST"
tags: ["LLM API costs", "Prompt caching", "Batch API", "Model routing", "LLM cost optimization"]
primaryKeyword: "reduce LLM API costs"
secondaryKeywords: ["LLM cost optimization", "AI API cost reduction"]
banner: "/blog/reduce-llm-api-costs/banner.svg"
bannerAlt: "LLMiser banner: an API invoice with input, output, retries and tools lines, the wasteful lines struck through and a stamp reading trimmed."
draft: false
---

**TL;DR:** You can often **reduce LLM API costs** a long way without touching quality. Batch anything that can wait (half price on Claude's Batch API) and cache prompts that repeat (a cache hit costs 10% of normal input on most Claude models, 5% on Sonnet 5.5 and Opus 5.5). Then shrink documents, cap output length and route simple requests to a smaller model. Measure answer quality before and after every change.

Most cost advice starts and ends with "use a cheaper model". That's one lever out of seven, and often not the biggest.

This guide treats **LLM cost optimization** as an engineering problem: find the waste in each request and remove it. Every number below comes from a published price list or paper, linked where it's used. Prices are Anthropic's list prices, checked on 20 October 2026, so check your provider's page before you plan a budget.

## Where an LLM bill actually comes from

Every request costs input tokens times the input price, plus output tokens times the output price, times the number of calls. Each of those five factors is a lever, and output is the most expensive one per token.

![Bars of list prices per million tokens: Haiku 5.5 input 10 cents, output 50 cents. Sonnet 5.5 input 2 dollars, output 10. Opus 5.5 input 4, output 20.](/blog/reduce-llm-api-costs/output-price.svg "Source: [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing), list prices checked 20 October 2026. Haiku 5.5 prices apply to prompts up to 100,000 tokens.")

On current Claude models, output tokens cost five times as much as input tokens, according to Anthropic's [pricing page](https://platform.claude.com/docs/en/about-claude/pricing). A rambling 1,000-token answer costs as much as 5,000 tokens of input.

The bill formula also explains why cheaper models alone don't fix things. If each request carries three times the tokens it needs, a model at half the price still costs you 50% more than necessary. Cut the waste first, then pick the model.

## Lever 1: batch anything that can wait

Batch APIs process requests asynchronously at half the normal price, for both input and output. If nobody is waiting on the answer in real time, there's rarely a reason to pay full price.

Anthropic's [batch processing docs](https://platform.claude.com/docs/en/build-with-claude/batch-processing) describe a 50% discount, with most batches finishing in less than an hour. Good candidates are nightly summaries, document classification, evaluation runs, data extraction and content tagging.

This is the cleanest 50% you'll find. It doesn't change the prompt, the model or the output. It only changes when you get the answer.

## Lever 2: cache what repeats

Prompt caching stores a repeated prefix, such as a long system prompt or a reference document. Later requests read it from cache, cheaply.

![Bars: a 10,000-token prompt sent 10 times costs 100,000 token-equivalents without caching, 21,500 with caching at the standard 0.1x hit price, and 17,000 on Sonnet 5.5 or Opus 5.5 where hits cost 0.05x.](/blog/reduce-llm-api-costs/cache-math.svg "Source: [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). 5-minute cache: one write at 1.25x the base input price, then nine hits.")

On Claude, writing to the 5-minute cache costs 1.25 times the normal input price. Each cache hit costs 0.1 times on most models, 0.05 times on Sonnet 5.5 and Opus 5.5, and 0.025 times on Fable 5.1, per the [prompt caching docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching). Caching pays for itself after a single reuse.

The catch is structure. Caching works on the start of the prompt, so put the stable parts first (instructions, tool definitions, reference text) and the changing parts last (the user's question). Reorder a messy prompt and the savings follow.

## Lever 3: shrink documents before they reach the model

Documents are often the largest part of the input. Converting PDFs to Markdown and sending only the relevant sections can cut that part by most of its size, as long as the answer doesn't live in a chart.

Many AI apps read a PDF page as extracted text plus an image of the page. In the worked example from our [Markdown vs PDF guide](/blog/markdown-vs-pdf-llm-tokens), a 500-word page costs about 2,235 tokens that way and about 667 as Markdown, roughly 70% less. The image token rules behind that figure come from Claude's [vision docs](https://platform.claude.com/docs/en/build-with-claude/vision). Apps that send extracted text only save much less, so measure your own path.

Then go further. Don't send the whole document. Send the sections that answer the question. A retrieval step that picks six relevant chunks out of a 100-page report sends about 1% of the original. [LLMiser](/), a free LLM cost optimizer for documents, handles the conversion, including scanned pages. The batching, caching and routing levers are things you set up with your provider.

## Lever 4: route easy requests to a smaller model

Many requests don't need your most capable model. Routing simple ones to a cheaper model saves money on every one of them, as long as you check that quality holds.

On the same pricing page, Claude Haiku 5.5 costs $0.10 per million input tokens for prompts up to 100,000 tokens, and Claude Opus 5.5 costs $4. That's a 40x gap. Classification, extraction and short rewrites often run fine on the smaller model.

Research backs this up. The [RouteLLM](https://arxiv.org/abs/2406.18665) paper (2024, published at ICLR 2025) trained routers that decide per query whether the strong or the weak model should answer. On public benchmarks they cut costs by more than 2x without sacrificing response quality.

## Lever 5: cap and shape the output

Since output costs five times input, long answers are expensive. Set a maximum output length, ask for the format you need, and stop the model explaining what it's about to do.

In practice, this is the easiest change to ship. Ask for JSON instead of prose when a program reads the answer. Ask for three bullet points instead of "a summary". Set `max_tokens` close to what a good answer needs, not the model's maximum.

## Levers 6 and 7: compress prompts, and skip calls you don't need

Prompt compression removes low-value tokens from long inputs before sending them. Skipping calls means answering from code or a stored result when the model adds nothing.

[LLMLingua-2](https://aclanthology.org/2024.findings-acl.57/) (Findings of ACL 2024) compressed prompts 2x to 5x and cut end-to-end latency by 1.6x to 2.9x on its benchmarks. Test it on your own tasks, because aggressive compression can drop details your task depends on.

The cheapest call is the one you never make. Exact-match questions ("what's our refund window?") can be answered from a stored response. Formatting, date math and validation belong in code, not in a prompt.

![Six cards: batch what can wait minus 50%, cache what repeats at 0.1x or less, shrink documents minus 70% in our PDF example, route easy requests more than 2x, cap the output 5x, compress prompts 2 to 5x.](/blog/reduce-llm-api-costs/seven-levers.svg "Batch and caching: Claude docs. 70%: our PDF worked example. Routing: RouteLLM. Compression: LLMLingua-2.")

## Putting it together: one request, five changes

Stacking the levers multiplies their effect. In this example, a document question on Sonnet 5.5 drops from 5.88 cents to 1.87 cents, about 68% less, and to 0.94 cents if it can run as a batch.

![Bars of cost per request: baseline 5.88 cents, PDF converted to Markdown 2.74, system prompt cached 2.17, output capped 1.87 which is minus 68%, Batch API 0.94 which is minus 84%.](/blog/reduce-llm-api-costs/worked-example.svg "Illustration on Sonnet 5.5 list prices ($2 input, $10 output per million tokens, cache hits at 0.05x), checked 20 October 2026. The one-time cache write is left out.")

Here are the assumptions, so you can redo the math with your own numbers. The request has a 3,000-token system prompt, 10 PDF pages at 2,235 tokens each, a 50-token question and an 800-token answer.

| Step                       | Input tokens | Output | Cost   |
|----------------------------|-------------:|-------:|-------:|
| Baseline                   |       25,400 |    800 | 5.88¢  |
| PDF as Markdown            |        9,720 |    800 | 2.74¢  |
| Prompt cached (as billed)  |        6,870 |    800 | 2.17¢  |
| Output capped              |        6,870 |    500 | 1.87¢  |
| Batch API                  |        6,870 |    500 | 0.94¢  |

The cached row counts the 3,000-token prompt at 5% of the input price, Sonnet 5.5's cache hit rate. Anthropic's pricing page confirms the caching and batch discounts stack.

## What not to cut

Cut waste, not context the model needs. Every change should pass the same quality test as the version before it, or it isn't a saving.

![Flow: build a test set of 30 to 50 real questions, record a baseline, change one lever, re-run the test set, keep or roll back.](/blog/reduce-llm-api-costs/safe-loop.svg "Change one lever at a time so you know which one moved quality.")

Keep a test set of real questions with known good answers. Record cost and quality before any change. Change one thing, re-run, compare. Roll back anything that makes answers worse, even if it's cheaper. That discipline is what makes **AI API cost reduction** safe to ship.

## Frequently Asked Questions

### What's the fastest way to reduce LLM API costs?

Batch any work that doesn't need an instant answer, which halves the price on providers that offer it. Then cache your stable system prompt so repeat requests pay 10% or less for that part. Neither change touches the prompt content or the model.

### Does prompt caching affect output quality?

No. The model processes the same prompt either way. Caching only changes how the repeated prefix is billed and how fast it's processed. You do need the stable part of the prompt at the start for the cache to match.

### Is switching to a cheaper model enough?

Rarely on its own. If requests carry far more tokens than they need, a cheaper model still bills you for all of them. Remove waste first, then route the requests that a smaller model handles well.

### Why do output tokens cost more than input tokens?

Providers price them higher because generating text takes more compute than reading it. On current Claude models output costs five times input. That's why capping answer length and asking for compact formats saves real money.

### How much can converting PDFs to Markdown save?

It depends on how the AI app reads PDFs. When it sends page images along with the text, a 500-word page drops from about 2,235 to about 667 tokens in our worked example, roughly 70%. Apps that send only extracted text save less, but still get cleaner input.

### Do these tips help on free AI plans too?

Yes, the input-side ones do. On a free plan you can't batch or cache, but converting documents and sending only the sections you need makes each message smaller, so the plan's allowance lasts longer.

Shrink your documents with the [free converter](/), then follow [how to measure savings for your model](/usecase).
