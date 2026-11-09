# M04-S1 research: word-heading-styles-markdown

Researched 2026-11-09. Same access limits as M01 (named search engines blocked; metrics UNMEASURED). SERP capture PENDING (R05). Two lookups with the unspecified-provider web search tool, restricted to support.microsoft.com, to find the pages below; each page was then fetched and read.

Reader question: how semantic styles differ from large bold text. Parent M04 shows one Heading 2 versus one bold line. This support adds Title, custom and outline-level styles, skipped levels, a false heading, an empty heading, the file-name title rule and a reviewed copy.

Sources read:
- Microsoft Support, "Use the Navigation pane in Word" (page date 2026-09-25): open with Ctrl+F or View > Navigation Pane; headings with heading styles appear; headings in tables, text boxes, headers or footers don't.
- Microsoft Support, "Make your Word documents accessible to people with disabilities" (page date 2026-08-24): use built-in heading styles in logical order and don't skip levels (Heading 1, Heading 2, then Heading 3).

Product facts: the DOCX path's default style map (Heading 1 to 6 only); ensure_title in backendN/app/common/profiles.py; RAG-ready inserts chunk markers before `## ` lines (verified for M08).

Boundary: no claim that the Navigation pane and the conversion agree; no claim about Word-saved custom templates beyond the test.
