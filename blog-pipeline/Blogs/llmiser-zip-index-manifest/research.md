# M10 research: llmiser-zip-index-manifest

Researched 2026-11-08. Branded product query ("LLMiser ZIP manifest"); no third-party SERP owners. Named-engine SERPs and keyword metrics unavailable (R05).

## Product facts (4e5267f)

- `backendZ/README.md` and `app/archive.py`: outputs combined.md (parts above 4 MB), PROJECT_INDEX.md (summary, tree, results, skipped and failed), manifest.json (job_id, source, limits, nodes without content); index labels "(unsafe)" and "(duplicate)"; case-insensitive duplicate check (`key = path.casefold()`); nested depth 1; 50 OCR images.
- `backendZ/app/archive_tasks.py`: Storage processing with OCR work items and merge with recognised texts.
- `frontend/components/converter/ResultOutputs.js`: "Original output files ({count})" with note that these are the original converted files and that .md or .zip export edits; server copies available until automatic deletion.
- `frontend/lib/models/conversionService.js`: multipart results joined for preview, copy and export (per backendZ README).

## Boundary

M01 owns choosing and removing files before upload; this article references that step in one sentence without linking (M01 is unpublished; link planned in links.json).
