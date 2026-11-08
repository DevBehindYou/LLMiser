# M04 research: prepare-word-documents-for-ai

Researched 2026-11-08. Same access limits as M01: no named-engine SERPs, no keyword tools, no AI-answer inspection. Web search: Claude Code WebSearch tool, provider unspecified, US.

## Query observation

| Query | Observed result URLs (selection, returned order) | Observed intent |
| --- | --- | --- |
| `prepare Word document for AI tracked changes headings convert docx to markdown for LLM` | hyperleap.ai/docx-to-markdown; any2markdown.pages.dev/word-to-markdown; textcontrol.com/blog/2025/09/19/docx-meets-markdown-preparing-enterprise-documents-for-ai/; apify.com/.../docx-to-markdown; antennahouse.com/tips-tricks/getting-your-documents-ai-ready-with-osdc-docxhtml; file2markdown.ai/convert/docx-to-markdown; any2markdown.pages.dev/guides/what-gets-lost-when-converting-to-markdown; usejunior.ai/safe-docx/guides/convert-docx-to-markdown/ | Mostly converter tool pages (transaction intent, owned by HOME for LLMiser). A few guides advise accepting or rejecting tracked changes and using real heading styles; one notes tracked changes and comments don't appear in output. |

Conclusions: the guide angle (prepare the source, then read the output) differs from the dominant tool-page intent, so the article avoids converter-landing language and the "Word to Markdown" phrase as a keyword. Our fixture adds a specific observed behavior (pending insertion kept as plain text, deletion and comment dropped) that the observed pages state only generally.

## Primary sources (read 2026-11-08)

- W3C WAI, Headings tutorial: "Headings communicate the organization of the content on the page."
- Microsoft Support, Remove hidden data and personal information by inspecting documents (page date seen 2026-09-26): lists "Comments, Revisions, Versions, and Annotations" and "Revision marks from tracked changes"; "If you remove hidden content from your document, you might not be able to restore it by selecting Undo."

## Product facts (56863df)

- `frontend/lib/formats.js`: docx accepted, .doc not in the list; 15 MB.
- `backendN/app/converter.py`: DOCX through MarkItDown (which converts DOCX through HTML). Exact rendering observed in the fixture, not inferred.
