# M03 research: excel-data-checks-for-ai

Researched 2026-11-08. Same access limits as M01 (no named-engine SERPs, no keyword tools, no AI-answer inspection). Web search: Claude Code WebSearch tool, provider unspecified.

## Query observations (unspecified-provider web search, 2026-11-08, US)

| Query | Observed result URLs (selection, returned order) | Observed intent |
| --- | --- | --- |
| `prepare Excel data for AI ChatGPT spreadsheet upload tips hidden sheets leading zeros` | thebricks.com/resources/guide-how-to-show-full-number-in-excel-using-chatgpt; office.alibaba.com/officesoftware/can-gpt-read-excel-files; thebricks.com leading-zero guides (several); thebricks.com/resources/how-to-input-excel-data-into-chatgpt; bardeen.ai/answers/how-to-upload-an-excel-file-to-chat-gpt; geeky-gadgets.com/chatgpt-excel-analysis-workflow/; hubsite365.com/.../stop-uploading-excel-to-chatgpt-until-you-use-this-workflow.htm | Mostly "how to upload or input Excel into a chatbot" and Excel formatting tips (keeping zeros in Excel). A few mention hidden sheets, merged cells and flat single-row headers as preparation steps. Vendor-tied blogs. |

Interpretation: the observed pages tell readers how to format the grid. None showed what a text conversion produces from the workbook, which is the gap the fixture fills.

## Primary source

- Microsoft Support, "Keeping leading zeros and large numbers" (https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers), retrieved 2026-11-08, page date seen 2026-06-25: "Excel has a maximum precision of 15 significant digits, which means that for any number containing 16 or more digits, such as a credit card number, any numbers past the 15th digit are rounded down to zero. In the case of number codes that are 16 digits or larger, you must use a text format."

## Conclusions

1. The strongest original evidence is the fixture: hidden sheets convert, display formats are dropped, an all-text ID column loses zeros, and formulas without cached results become NaN. None of these require external sources beyond Microsoft's precision rule.
2. M06 boundary: the article mentions CSV once, as a verified workaround for ID columns, and doesn't discuss delimiters, quoting or encoding.
3. Product observation for the owner: the all-text ID column loss is a conversion limitation in LLMiser's Excel path (pandas type inference). Logged in qa.md.

## Product facts checked in code (357d4fb)

- `backendN/app/excel_converter.py`: one `##` heading and one table per sheet in `workbook.sheet_names` order; frames rendered with `to_html(index=False)` then converted to Markdown; verified markitdown versions 0.1.8 and 0.1.9.
- `frontend/lib/formats.js`: xlsx and xls accepted; 15 MB per document.
