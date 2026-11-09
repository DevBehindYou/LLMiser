# M11 research: document-prompt-injection

Researched 2026-11-08/09. Same access limits as M01 (no named-engine SERPs, no keyword tools, no AI-answer inspection). No query observation recorded for M11 in this pass; the topic is defined by primary security sources. Status for SERP capture: PENDING (R05).

## Primary sources (read 2026-11-09)

- OWASP GenAI Security Project, LLM01 Prompt Injection (genai.owasp.org/llmrisk/llm01-prompt-injection/): "Indirect prompt injections occur when an LLM accepts input from external sources, such as websites or files ... alters the behavior of the model in unintended or unexpected ways."
- OWASP LLM Prompt Injection Prevention Cheat Sheet (campaign SRC-OWASP): Remote/Indirect pattern "Malicious instructions hidden in external content that the LLM processes"; "Hidden text in web pages, documents, or emails"; "Unicode smuggling with invisible characters"; "enforce tool permissions and parameter validation and apply least privilege"; "Screening does not stop an injection that it fails to detect"; "a prompt requesting human review does not itself stop execution."
- Greshake et al., arXiv:2302.12173 (submitted 23 Feb 2023): "LLM-Integrated Applications blur the line between data and instructions."
- Campaign SRC-INJECTION (anthropic.com research page) not re-read this pass; not cited.

## Conclusions

1. The article is defensive education: definitions, an inert trace, warning signs, the conversion-is-not-trust boundary, review and permission limits, detection limits.
2. Original contribution: conversion exposed hidden text in four of five placements, which helps human review but does not neutralize the text.
3. M12 boundary: one FAQ distinguishes outdated documents from injection; no version-conflict guidance here.
