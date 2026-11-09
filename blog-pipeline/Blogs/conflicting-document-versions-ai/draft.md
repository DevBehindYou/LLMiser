---
title: "Why Two Versions of a Document Can Confuse AI"
slug: "conflicting-document-versions-ai"
description: "Conflicting document versions confuse AI when dates and provenance get lost. See how it happens in conversion, and how to label, choose and test the right source."
excerpt: "Two versions of a policy, nearly identical, with different deadlines. After conversion, nothing said which one was current. Here's how to keep that from reaching a model."
date: "2026-11-09"
author: "DevBehindYou"
category: "GUIDE"
tags: ["Document versions", "Provenance", "AI context", "RAG", "Document preparation"]
primaryKeyword: "conflicting document versions AI"
secondaryKeywords: ["document provenance", "outdated policy versions"]
banner: "/blog/conflicting-document-versions-ai/banner.svg"
bannerAlt: "LLMiser banner reading Two versions, one answer? Two nearly identical policy pages on a paper card, one saying receipts within 30 days and the other within 14 days, with a question mark between them."
featured: false
draft: true
---

**TL;DR:** When two versions of a document disagree, an AI has no reliable way to know which one is current unless the text says so. Dates often live in headers and file properties that conversion drops. Before you share, find the conflict, write provenance into the text, keep only the sources that apply and test answers on the facts that changed.

An outdated document isn't malicious. It's just wrong now, and it often looks almost exactly like the right one. That's what makes it hard for a model, and for people.

To show how **conflicting document versions** reach an AI, we made two versions of a synthetic travel policy and converted both with LLMiser. They differed in two facts. After conversion, nothing in the text said which version was current.

## 1. Find the version conflict

Look for the facts that differ, not for the files that differ. Two versions can share almost every sentence, so a quick skim says "same document" while a deadline or limit has quietly changed.

Our two policies matched line for line except for two numbers. The January version said "Submit receipts within 30 days" and capped hotels at 180 USD. The July version said 14 days and 200 USD. Everything else, including the title and headings, was identical.

![A comparison table of the two converted policies. File name: travel-policy.docx versus travel-policy (1).docx. Title: identical. Effective date: missing from both outputs. Receipt deadline: 30 days versus 14 days. Hotel cap: 180 versus 200 USD. Text similarity: 0.867.](/blog/conflicting-document-versions-ai/version-diff.svg "Local run of LLMiser's conversion on two synthetic policy versions, 9 November 2026. Similarity from Python's difflib.")

Python's difflib rated the two converted texts 0.867 similar. A model given both has two confident, nearly identical answers to "how long do I have to submit receipts?" and nothing that ranks them.

## 2. Preserve dates, provenance and scope

Put each document's version, effective date and source into the text itself. Converted text keeps what's in the body, and the fields that usually say which version is current often aren't there.

Our effective dates lived where real ones often do: in the page header and the file's properties. Neither survived conversion. The only label left was the file name in LLMiser's Standard source note, "travel-policy.docx" versus "travel-policy (1).docx," which says nothing about which is newer. The Clean profile removed even that.

![Two columns. As converted with the Clean profile: a heading and the policy text, with no date, version or source. With a provenance line added: the same text starting with a line giving version 2, effective 1 July 2026, superseding the January version, and its source.](/blog/conflicting-document-versions-ai/provenance-line.svg "One line of provenance at the top turns two look-alike texts into a current one and an old one. Illustration based on the test files.")

Add a short provenance line at the top of each document before you share it: version, effective date, what it supersedes and where it came from. Microsoft's guide to [information retrieval for RAG](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-information-retrieval) notes that search indexes can hold date fields and that filtering on fields narrows results. Applying that to versions means storing those dates as fields you can filter on, not just as words in the text.

## 3. Handle superseded versus simultaneously valid sources

Decide whether one version replaces the other or both apply to different cases. Superseded text should go, while two valid sources need labels that say exactly where each one applies.

Our travel policies were the superseded kind: the July version replaced the January one. Other conflicts are legitimate. A sales team and a support team can have different travel caps, and both policies are current.

![A decision diagram. Start: two sources disagree. Question: does one replace the other? Yes: use only the current one and label its date. No: keep both and label each one's scope, such as team, region or product. If it's still unclear, ask the document's owner.](/blog/conflicting-document-versions-ai/superseded-or-scoped.svg "Superseded and scoped conflicts need different fixes. Illustration.")

For scoped sources, write the scope into each one, such as "Applies to: Support team, US only." Without it, a model can apply the right rule to the wrong person.

## 4. Resolve ambiguity without inventing precedence

When you can't tell which source is current, don't guess and don't let the model guess. Ask the document's owner, then state the answer in your prompt or in the text.

File dates are weak evidence. A modified date can change when someone copies or re-saves a file, and names like "final" or "(1)" mean little. Our newer policy had the less helpful name of the two.

Once you know, say it plainly. A line such as "Use the July 2026 policy. The January policy is superseded" leaves less to chance than hoping a model infers it. If the conflict can't be settled, ask the model to report both values with their sources rather than pick one.

## 5. Remove stale excerpts from the working packet

Take superseded text out of whatever you send, including copied excerpts and notes. Don't remove one version because it looks like a duplicate, though. Similar text can hold different facts.

That warning matters for anyone deduplicating context automatically. At 0.867 similarity, our two policies would look like near-duplicates to many tools, yet keeping the wrong one would change the answer. Decide by version and date, never by how similar the words are.

![A checklist: find the facts that differ between versions, add version, effective date and source to each document, keep only current or clearly scoped sources, remove superseded excerpts from notes and packets, never deduplicate by similarity alone, and test with a question whose answer changed. Limitation: LLMiser converts what's in the document body and doesn't decide which version is current.](/blog/conflicting-document-versions-ai/version-checklist.svg "Run this before a mixed set of documents goes into a prompt. Illustration.")

Check the edges too. A summary you wrote last month, a pasted paragraph in a project doc or a saved chat can all carry the old deadline after the policy has changed.

## 6. Test the answer against the chosen sources

Ask a question whose answer changed between versions, then check the answer against the version you chose. If it cites the old value or both values without a reason, the context still holds a conflict.

For our policies, the test question is "How many days do I have to submit receipts?" The only right answer is 14 days, under the July 2026 policy. An answer of 30 days, or "30 or 14," means the January version is still in the context or the provenance line didn't make it through.

LLMiser prepares the text. It doesn't decide which version is current or enforce precedence between sources. For more on what it does and doesn't do, see the [use cases page](/usecase).

## Frequently Asked Questions

### Why does AI give different answers from two versions of a document?

Because both versions look authoritative and the text often doesn't say which is current. Without dates or labels, a model can use either value or mix them. Removing the outdated version, or labeling it clearly, removes that ambiguity.

### Does LLMiser keep document dates and versions?

It keeps what's in the document body. In our test, effective dates stored in the page header and file properties didn't appear in the converted text. Write the version and effective date into the body, or add a provenance line after converting.

### Is an outdated document a kind of prompt injection?

No. An outdated document gives wrong facts in good faith, while an injection attempt tries to change what the model does. The fix for versions is provenance and source selection, not hunting for hidden instructions.

### Can I remove old versions automatically by comparing text?

Not safely by similarity alone. Our two policy versions were rated 0.867 similar while their deadlines differed. Decide by version and effective date, then remove the superseded one.

### What if two documents conflict and both are valid?

Label each with its scope, such as team, region, product or date range, and keep both. Tell the model which scope applies to the question. If you can't tell, report both values with their sources.

### Which LLMiser profile keeps the file name?

Standard adds a source note with the file name under the title, and Clean removes it. A file name rarely says which version is current, so add your own provenance line either way.

Preparing a set of documents? [Convert them with LLMiser](/), then add a provenance line to each before you share.
