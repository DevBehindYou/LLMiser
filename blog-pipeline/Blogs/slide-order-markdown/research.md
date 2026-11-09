# M05-S3 research: slide-order-markdown

Researched 2026-11-09. Same access limits as M01 (named search engines blocked; metrics UNMEASURED). SERP capture PENDING (R05). The Microsoft page below was fetched directly.

Reader question: how to retain the sequence needed to interpret a deck. Parent M05 reports hidden slides, a divider heading with nothing under it and a repeated "Results" title. This support adds sections, labels above titles, a slide without a title placeholder, a backward reference, the Section Header layout trap and the RAG-ready effect.

Sources read:
- Microsoft Support, "Make your PowerPoint presentations accessible to people with disabilities" (page date 2026-08-24): give every slide a unique title; Accessibility Checker finds slides without titles; Home > Slides > Reset restores placeholders and can help find title placeholders; the Reading Order pane sets screen reader order.

Product facts: shape order by position and title-placeholder headings (markitdown PPTX converter); RAG-ready inserts chunk markers before `## ` lines only (backendN/app/common/profiles.py).

Boundary: no claim about PowerPoint's own export order; Reading Order pane described from Microsoft, its non-effect on this conversion derived from code.
