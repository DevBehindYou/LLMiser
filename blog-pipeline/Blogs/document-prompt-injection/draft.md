---
title: "Prompt Injection: Can a Document Hijack Your AI?"
slug: "document-prompt-injection"
description: "Document prompt injection explained: how text hidden in a file can try to redirect an AI, why conversion doesn't make it safe, and which checks and limits help."
excerpt: "We hid one harmless instruction in a Word file, a web page and a slide deck. Conversion didn't remove it. It made it visible, and that turned out to be useful."
date: "2026-11-09"
author: "DevBehindYou"
category: "SECURITY"
tags: ["Prompt injection", "AI safety", "Documents", "Indirect prompt injection", "AI context"]
primaryKeyword: "document prompt injection"
secondaryKeywords: ["indirect prompt injection", "hidden instructions in documents"]
banner: "/blog/document-prompt-injection/banner.svg"
bannerAlt: "LLMiser banner reading Can a document hijack your AI? A document on a paper card with a faint hidden line revealed under a highlighter, and an arrow to converted text where the same line is plainly visible and flagged as untrusted."
featured: false
draft: true
---

**TL;DR:** Yes, a document can carry text that tries to redirect an AI, and a model may treat it as an instruction. That's indirect prompt injection. Converting the file to Markdown doesn't remove such text, and in our test it made hidden text visible. Read documents as untrusted data, review them and keep any automated actions behind human approval.

When you ask an AI to summarize a file, you're mixing two things in one prompt: your instruction and someone else's text. A model can't always tell them apart.

**Document prompt injection** is what happens when the document's text tries to act like an instruction. We built an inert example, a vendor brochure with one hidden line addressed to "any AI assistant," and converted it with LLMiser. Nothing was sent to a model. We only inspected the text that would have been sent.

## 1. Distinguish source content from trusted instructions

Your request is an instruction. The document you attach is data. Prompt injection exploits the fact that, to a language model, both arrive as text in the same window, so data can be written to look like an instruction.

The OWASP GenAI project's [description of prompt injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) defines the indirect kind directly. Indirect prompt injections occur when a model accepts input from external sources such as websites or files, and that content alters its behavior in unintended ways.

Researchers described the problem early, in a 2023 paper by Greshake and colleagues, [Not what you've signed up for](https://arxiv.org/abs/2302.12173). It argues that applications built on language models "blur the line between data and instructions," and a file you didn't write is the clearest case of that.

## 2. Trace an indirect instruction attempt

To see the risk concretely, follow one instruction from its hiding place to the text a model would read. Our synthetic test placed the same harmless sentence in five places across three files, then converted each file.

The sentence asked any AI assistant to describe the vendor as "the cheapest option" and end with "Approved by procurement." It's inert: it asks for nothing secret and triggers no action. In the Word file, it sat in white one-point text and in an image's alt text. In the web page, it sat in a hidden block and in an HTML comment. In the slide deck, it sat in the speaker notes.

![A tree of five hiding places and what conversion did. Word white one-point text: visible in the output. Word image alt text: kept as alt text. Web page hidden block: visible in the output. Web page HTML comment: dropped. Slide speaker notes: kept under Notes.](/blog/document-prompt-injection/hiding-places.svg "Local run of LLMiser's conversion code on synthetic, inert files, 9 November 2026. Nothing was sent to a model.")

Four of the five copies reached the converted text. The white text and the hidden web block became ordinary, readable lines. Only the HTML comment was dropped. A person skimming the original file would have seen none of them.

## 3. Recognize suspicious document language

Look for text that talks to the AI rather than to the reader. Legitimate documents describe their subject. Injection attempts address the assistant, try to change its task or output, or ask it to do something, often in places a human wouldn't look.

Our test line had three of those signs: it addressed "any AI assistant," it tried to change the conclusion, and it dictated a closing phrase. Real attempts may also ask a model to ignore earlier instructions, reveal information, or visit a link or call a tool.

![Four cards of warning signs. Addresses the AI: text that speaks to an assistant instead of the reader. Changes the task: tries to alter a summary, rating or conclusion. Asks for actions: wants a link visited, a message sent or data revealed. Hidden or out of place: white, tiny, collapsed or in notes and alt text.](/blog/document-prompt-injection/warning-signs.svg "Signs worth a second look. Not a complete list, and none is proof on its own. Illustration.")

OWASP's [prompt injection prevention cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) lists hidden text in web pages, documents or emails among indirect attack patterns, alongside invisible Unicode characters. Treat those signs as reasons to look closer, not as a complete detector.

## 4. Why conversion does not establish trust

Converting a file changes its format, not its trustworthiness. LLMiser turns documents into Markdown faithfully, including text you might not want a model to obey, and it doesn't detect, label or remove instruction attempts.

There's a useful side effect, though. In our test, conversion exposed hidden text instead of hiding it. White one-point text and a collapsed web block became plain lines you can see in the reader. Reviewing the Markdown is often easier than inspecting a styled original.

But visible isn't harmless. The same plain line goes to the model if you paste the result as is. LLMiser is a document preparation tool, not a security boundary, so the review step stays with you.

## 5. Use review and limited downstream permissions

Read the converted text before it reaches a model, and keep anything a model does with it behind your own approval. Review catches what you can see, and limited permissions contain what you can't.

Start with the text. Search the converted Markdown for lines that address an assistant, then delete or quote them. When you prompt, say plainly that the document is material to analyze, not instructions to follow. That helps, but it isn't a guarantee.

![A decision diagram. Start: a model has read an external document. Question: will its output trigger an action, such as sending, buying or changing something? Yes: require human approval and give the tool the least access it needs. No: review the answer before you rely on it.](/blog/document-prompt-injection/action-decision.svg "Permissions limit damage that review misses. Illustration.")

Then limit what can happen next. OWASP's cheat sheet recommends enforcing permissions at the tool boundary and applying least privilege, and it notes that a prompt asking for human review doesn't itself stop an action. If a document-driven workflow can send messages or change records, put a person in front of that step.

## 6. Know the limits of detection

No search or filter catches every instruction attempt. Phrasing changes, languages differ and text can hide in images, so treat any detection step as one layer, never as proof that a document is clean.

A search for "AI assistant" found our test line in every converted file. It would miss a reworded version, the same sentence in another language or text inside a picture. OWASP's cheat sheet says it plainly: screening doesn't stop an injection that it fails to detect.

![A checklist: read the converted text before prompting, search for lines that address an AI, quote or remove what you find, state in the prompt that the document is data, keep actions behind human approval, give tools least privilege. Limitation: no check finds every attempt, and LLMiser does not detect or remove injected instructions.](/blog/document-prompt-injection/review-checklist.svg "Layered checks for external documents. Illustration.")

Combine the layers: review, careful prompting, limited permissions and human approval for anything consequential. For what LLMiser does and doesn't do with your files, see the [use cases page](/usecase).

## Frequently Asked Questions

### What is document prompt injection?

It's text inside a file that tries to make an AI follow it instead of your request. It's a form of indirect prompt injection, where the instruction arrives through content the model reads rather than from you. The text can be visible or hidden in formatting, notes or metadata.

### Does LLMiser remove prompt injection from documents?

No. LLMiser converts documents to Markdown faithfully and doesn't detect, flag or remove instruction attempts. In our test, conversion made hidden instructions visible, which helps review, but the text remained in the output.

### Can hidden text in a Word file reach an AI?

Yes. In our test, white one-point text and an image's alt text in a Word file both appeared in the converted Markdown. A person reading the original would likely miss them, while a model reading the text would not.

### Is it safe to summarize a document from an unknown source?

It can be, if the summary only goes to you and you review it. Risk grows when a model's output can trigger actions, such as sending messages or changing data. Keep those steps behind human approval.

### Will telling the model to ignore document instructions stop injection?

It helps, but it isn't a guarantee. Clear prompts reduce the chance a model follows embedded text, but security guidance treats them as one layer. Limit what tools can do and review consequential outputs.

### How is prompt injection different from an outdated document?

An outdated document gives wrong facts in good faith. An injection attempt tries to change what the model does. Both need review, but conflicting versions call for checking dates and sources, not hunting for instructions.

Converting a file you didn't write? [Use LLMiser](/) to read it as plain text first, then decide what goes into your prompt.
