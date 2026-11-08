# M02 research: ocr-checks-before-ai

Researched 2026-11-08 (UTC). Access limits are the same as M01: Google, Bing, Brave and DuckDuckGo refused by the environment proxy, no keyword tools, no AI-answer inspection. Web search below is the Claude Code WebSearch tool, provider unspecified, US results.

## Query observations

| Query | Observed result URLs (selection, returned order) | Observed intent |
| --- | --- | --- |
| `OCR quality checks before sending scanned text to ChatGPT` | reddit.sentinel-team.org snapshots (OCR threads); unstract.com/blog/when-to-use-llms-vs-traditional-ocr-for-document-processing/; yomotherboard.com/question/how-can-i-handle-unreliable-ocr-documents-before-using-them-with-ai/; datastudios.org/post/can-chatgpt-read-scanned-pdfs-ocr-performance-and-text-recognition-accuracy; community.openai.com/t/chatgpt-must-improve-the-ocr-scanning-method/936088 | Practitioner advice: verify text layer, spot-check against scans, regex for dates and IDs, flag empty output. Mixed with "LLM vs OCR" vendor comparisons. |
| `how to check OCR output accuracy numbers dates errors verify` | nhimg.org/faq/...kyc...; blog.filestack.com/ocr-api-accuracy-benchmark/; mindee.com/blog/ocr-accuracy-choosing-right-api; imagetotable.ai/blog/what-does-ocr-accuracy-mean; worldbank.github.io/ai4data/cookbook/data-from-documents/scanned; lido.app/blog/ocr-accuracy; imagetotable.ai/blog/ocr-accuracy-by-field-type | Accuracy measurement (CER/WER), field-level accuracy, O/0 and l/1 confusions, validation and confidence thresholds. Vendor-heavy. |

## Conclusions

1. The reader task (verify scanned text before an AI reads it) is present in practitioner discussions, while vendor pages lean toward benchmarking OCR APIs. The article stays a checklist for a document someone already scanned, and it doesn't compare vendors or cite their accuracy rates.
2. Field-level checking (IDs, amounts, dates) recurs in the observed results. The fixture confirmed it with a real O-to-zero substitution and a silently dropped column, which are more useful than borrowed percentages.
3. Nearest owners: E06 (PDF ingestion cost), E07 (format comparison) and E08 (pipeline). The draft links E08 once, makes no cost claims and has no PDF-versus-Markdown comparison.
4. Engine documentation (Tesseract ImproveQuality, read 2026-11-08) supports the background that skew and tables are hard cases. It isn't linked or named in the article, because the house checker bans naming the engines behind LLMiser. Claims in the article rest on LLMiser code and the fixture instead.
5. The primary phrase "OCR quality checks for AI" is used naturally in the intro and the description. Volume is unknown.

## Product facts checked in code (6f7b791)

- `backendO/app/converter.py`: OCR_LANG default "eng"; PSM 3; grayscale, EXIF transpose, autocontrast; downscale above 12 MP, 2x upscale when the long side is under 1,000 px; orientation check only when mean confidence is under 75 or fewer than 3 words; warning codes auto-rotated-N and first-frame-only; "_No text detected in this image._" for empty results; 25 MP and 10,000 px caps.
- `backendN/app/pdf_tasks.py`: scan = under 20 text characters and at least 30% image coverage; empty = 0 characters and under 5% image coverage, joins a native run; 200 dpi render capped at 12 MP; up to 100 scanned pages, then a warning listing skipped pages; merge labels `<!-- page N: text recognition -->` and "> ⚠️ Page N: no text could be recognised."
- `frontend/lib/formats.js` and `siteContent.js`: images up to 10 MB; scanned PDF pages up to 100 per file.
