> Current campaign (5 November): 48 candidate article keywords are mapped to M01–M12 and their 36 supports. The S-series observations below are historical evidence, not active owner assignments. See ../campaign/sources.json for the supplementary official sources; new volumes remain unmeasured.

# Keyword and search research

Observed 4 November 2026. English editorial market; US is the proposed starting market for future quantitative comparison. Available web-search discovery did not enforce location or device. No rankings, People Also Ask panels, traffic forecasts or AI citation share are claimed.

## What was actually done

- Inspected all eight published article frontmatters, product formats/copy, blog renderer and existing pipeline guidance at `8eb8c509`.
- Read the 15-main/45-support archive topic map and mapped all 60 topics in `archive-disposition.csv`.
- Queried the available web-search tool for PDF/Markdown, OCR, codebase ZIP, Word/DOCX and Excel tasks; saved compact observations in `serp-observations.json`.
- Attempted direct Google, Bing, Brave and DuckDuckGo results for “scanned pdf to markdown”; all four were inaccessible through this tool. Their engine-specific audits remain NOT_IMPLEMENTED.
- Opened Semrush's free volume tool, Ahrefs' generator and official Keyword Planner documentation. No fresh keyword-specific metric report or authenticated export was obtained.
- Read official search guidance and selected primary product documentation. Competitor search excerpts show how pages are positioned, not verified product performance.

## Findings and editorial inferences

| Source ID | Observation | Decision/inference |
| --- | --- | --- |
| SR-OCR | Discovery returned [Extract2MD](https://www.extract2md.com/scanned-pdf-to-markdown) and [pdf2md.dev](https://pdf2md.dev/scanned-pdf-to-markdown/) pages devoted to scanned PDF conversion. Extract2MD direct fetch failed; evidence is the returned search excerpt only. | Conversion intent is visible in this sample. S01 should deliver a tested walkthrough with OCR quality checks, not a generic cost essay. S06 stays specific to image files. |
| SR-ZIP | [Repomix's official output guide](https://repomix.com/guide/output) documents Markdown with paths, directory structure and file contents. | Codebase packaging is an established task. S02 focuses on preparing and inspecting a ZIP in LLMiser. No claim that LLMiser has Repomix's CLI or remote-import features. |
| SR-XLS | Search excerpts for [Parsyra](https://parsyra.com/excel-to-markdown/) and [GetMarkdown](https://www.getmarkdown.com/excel-to-markdown) emphasize sheets/tables. Parsyra direct fetch failed. | S03 needs concrete workbook-value checks. S10's delimiter troubleshooting is conditional on distinct intent, not another generic table-conversion page. |
| SR-DOCX | Word/DOCX queries and [Pandoc's official manual](https://pandoc.org/MANUAL.html) show document conversion as an established workflow. | Keep Word and DOCX variants in one S04 guide; verify LLMiser's output rather than copying another converter's features. |
| SR-PPTX | Current LLMiser format list supports PPTX. | S05 is product-fit-led. No dedicated PPTX SERP sample or volume was obtained; research before drafting. |
| SR-LOCAL | Four profiles are present in the source and public copy. | S09 is a product-help hypothesis; not evidence of external search volume. |

The guide list is prioritized for relevance and originality. No “high volume,” “easy to rank,” “best converter” or “rank one” label is justified by these observations.

## Metrics and conflicts

`keyword-evidence.csv` reserves primary/alias phrases with explicit unknown values. The single numerical row is **inherited**, not re-queried: the local 26 October report recorded Semrush “pdf to markdown” at US 2,400 monthly searches, global 12,000, US difficulty 33%, CPC $1.77. It has no exposed data-month label. Source: [earlier report](../../docs/README_KEYWORD_RESEARCH.md). Do not compare those estimates with another country/month or interpret them as LLMiser traffic.

The old private pipeline's 28 September Keyword Planner table has no supporting export here. It remains UNVERIFIED and is archived, not silently promoted into the new CSV. Missing metrics are not zeros.

Tool entry points inspected:
- [Semrush volume tool](https://www.semrush.com/free-tools/keyword-search-volume-checker/): public UI/methodology available; no new keyword result.
- [Ahrefs generator](https://ahrefs.com/keyword-generator): public interface available; no keyword report.
- [Google Keyword Planner help](https://support.google.com/google-ads/answer/7337243?hl=en): workflow documented; authenticated dataset absent.

These are research tools, not AI answer engines. A database estimate does not establish the observed results of Google, Bing, Brave or DuckDuckGo.

## Next research procedure

1. Take primary and aliases from the registry. Use the same US/English/device settings across comparisons where supported.
2. Capture ten organic URLs, result type, title and actual questions/features for each candidate and its nearest owner. Use `../templates/serp-capture.csv`; keep no-result, access failure and absent feature distinct.
3. Use `query-links.csv` for direct research starting points. They are generated links, not evidence of successful queries.
4. Compare normalized URL sets and reader tasks. Update the review register. Tool-heavy results may warrant a how-to modifier or a product-page section rather than a new generic blog.
5. Obtain a permitted metric export if available. Record tool, country, language, network, data period, retrieval date, keyword, volume, difficulty type and export path in `../templates/keyword-export.csv`. Never treat advertiser competition as organic difficulty.
6. Recheck prices, platform features and policies at drafting time. Do not bypass account requirements or access controls.
7. If evidence is unavailable, keep status UNKNOWN/UNMEASURED. A useful tutorial can still be commissioned on product fit, but claims about demand must remain absent.

## Search policy sources

- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features): established SEO applies; no special AI schema requirement or inclusion guarantee.
- [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies): avoid low-value scaled publication and manipulative linking. Volume alone is not proof of spam.
- [Bing webmaster guidance](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a): editorial quality and no artificial promotion/AI manipulation.
- [DuckDuckGo sources](https://duckduckgo.com/duckduckgo-help-pages/results/sources): traditional results largely use Bing, with other sources too.
- [Brave help](https://search.brave.com/help): describes its search index and generated snippets.

These sources guide the workflow; they cannot establish LLMiser's indexing, ranking or future citations. No authenticated Search Console, Bing or answer-engine results were inspected in this planning task.
