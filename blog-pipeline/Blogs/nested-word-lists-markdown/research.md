# M04-S2 research: nested-word-lists-markdown

Researched 2026-11-09. Same access limits as M01 (named search engines blocked; metrics UNMEASURED). SERP capture PENDING (R05). One lookup with the unspecified-provider web search tool, restricted to support.microsoft.com; the two pages used were fetched and read.

Reader question: how to verify parent-child relationships in converted lists. Parent M04 reports one style-based list (List Bullet 2 children flattened, numbering restarted). Finding while building this fixture: that flattening comes from style-based levels; a real multilevel list (numPr ilvl within one list) kept its nesting. This support separates the two mechanisms and adds the interrupting-note restart, letters becoming numbers and the skipped-level case.

Sources read:
- Microsoft Support, "Use a screen reader to create bulleted or numbered lists with Word" (page date 2026-08-24): press Enter for a new item, then Tab; Word increases the indent and makes it part of a nested list.
- Microsoft Support, "Define new bullets, numbers, and multilevel lists" (page date 2026-10-27): Multilevel List button on the Home tab, Paragraph group; Define New Multilevel List.

Product facts: DOCX conversion through the markitdown DOCX converter (HTML lists, then Markdown); LLMiser's reader allows editing before copy or download; edits are not saved in recent sessions (verified for M09).

Boundary: no claim about Word's own numbering beyond the documented UI; expected numbering taken from LibreOffice display.
