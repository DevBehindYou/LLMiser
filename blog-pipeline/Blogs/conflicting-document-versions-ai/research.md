# M12 research: conflicting-document-versions-ai

Researched 2026-11-09. Same access limits as M01. Web search: Claude Code WebSearch tool, provider unspecified, US.

## Query observation

| Query | Observed result URLs (selection, returned order) | Observed intent |
| --- | --- | --- |
| `AI gives wrong answer outdated document version conflicting policy versions RAG` | shelf.io/blog/how-to-improve-rag-accuracy-for-enterprise-ai/; hackernoon.com/i-built-a-rag-system-for-our-analytics-team-...; educative.io/.../common-rag-failure-modes-and-fixes; dev.to/faraz_farhan_83ed23a154a2/the-rag-system-that-found-contradicting-answers-...; tianpan.co/blog/2026/05/07/stale-docs-confident-wrong-answers-rag-knowledge-base; towardsdatascience.com/your-rag-system-retrieves-the-right-data-but-still-produces-wrong-answers-... | RAG engineering failure modes: stale versions retrieved, blended answers, missing metadata, filtering by currency and authority. Practitioner and vendor blogs; anecdotal numbers. |

Conclusions: observed pages are RAG-system engineering (E05/E04 territory). M12 stays with the document-preparation side: provenance in the text, superseded versus scoped sources and testing answers, with one cited RAG filtering source and no retrieval tuning advice. No numbers from the observed blogs are used.

## Primary source (read 2026-11-09)

- Microsoft Learn, Develop a RAG Solution on Azure: Information-Retrieval Phase (page date seen 2026-11-03; campaign SRC-RETRIEVAL): search stores support data types including datetime and fields configured as filterable; "Filter on keyword and entity fields to narrow results." Applying this to version metadata is an editorial inference, stated as such in the draft.

## Product facts

- Header and core properties do not appear in converted DOCX output (fixture). Standard adds a source note with the file name; Clean removes it (`backendN/app/common/profiles.py`).
