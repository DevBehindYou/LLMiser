# M01-S1 research: project-zip-secret-review

Researched 2026-11-09. Same access limits as M01 (no named-engine SERPs, no keyword tools). The M01 query observation for "what files to remove before sharing code with ChatGPT or Claude secrets node_modules" (see ../prepare-codebase-for-ai/research.md) covers this support's intent: secrets, scanners, history. This support narrows to the review procedure for a sharing copy and adds an original two-pass comparison.

Primary source reused: GitHub Docs, Removing sensitive data from a repository (rotate or revoke first), read 2026-11-08.

Product facts: LLMiser ZIP mode skips files named like credentials without reading them and never converts .git; no content scanning (backendZ/app/archive.py SENSITIVE and SKIP_DIRS).

Boundary: M01 owns the seven removals; M01-S2 owns dependency files; this article owns the review routine and the name-versus-content comparison.
