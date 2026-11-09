# M05-S1 research: powerpoint-speaker-notes-markdown

Researched 2026-11-09. Same access limits as M01 (named search engines blocked; metrics UNMEASURED). SERP capture PENDING (R05). One lookup with the unspecified-provider web search tool, restricted to support.microsoft.com; the page used was fetched and read.

Reader question: are important speaker notes represented in this output. Parent M05 reports that notes survive in a .pptx conversion. This support adds the file-route comparison (slides-only PDF, notes-pages PDF), blank notes, indent loss, and moving must-read notes onto the slide.

Sources read:
- Microsoft Support, "Print slides with or without speaker notes" (page date 2026-09-15): File > Print; the layout box defaults to Full Page Slides; Notes Pages prints one slide per page with speaker notes below; it is the only way to print notes with slides.

Product facts: markitdown PPTX converter (0.1.9 locally; backendN pins >=0.1.3,<0.2) appends notes only when non-blank; PDF path single-pass for native text.

Boundary: PowerPoint's own PDF export options were not tested; LibreOffice exports are labeled.
