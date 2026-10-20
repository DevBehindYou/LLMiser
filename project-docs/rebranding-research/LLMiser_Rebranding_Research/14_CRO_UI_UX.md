# 14 — SEO landing-page usability and conversion optimization

![Search-to-conversion journey](assets/02_conversion_journey.png)

## Primary experience

A search user should reach a usable converter in seconds and immediately understand which formats work, whether uploads leave the device and what the export looks like. Long SEO text must not push the functional tool completely out of view on mobile. Existing MDify already places conversion and preview near the top; preserve that strength.

## Main user flows

**Desktop:** arrive on format page → select/drop file → conversion status → structured Markdown preview → copy/download `.md` or `.zip` → optional useful resource.

**Mobile:** choose file using native picker → visible progress and cancellation if supported → render/copy/download with touch targets → no sticky dock covering submit or export actions.

**Chrome V1:** deliberate click → extract selected content/current page locally where browser permissions allow → inspect Markdown → copy/download → open website for full document/OCR workflows. Don't claim desktop Chrome extensions work in mobile Chrome.

## Key user errors and guardrails

| Error | Required behavior |
|---|---|
| Unsupported format | Explain supported formats and next action before upload |
| Oversized PDF/ZIP | Show actual limit; no silent upload |
| OCR quality low | User-visible limitations and output review advice |
| Network timeout | Retain recoverable job reference when technically safe, retry retrieval without unnecessary reconversion |
| Download stale after edit | Export latest authoritative bytes, including empty edits |
| Multiple files | Item-wise progress, consistent ordering and correct archive entries |
| Privacy question | Clear processing mode and retention policy linked beside upload |

User-provided MDify handover describes an immediate edit→export race fixed in merged PR #16; the extension and new brand should **not reintroduce stale-copy/download behavior**.

## Accessibility acceptance

- Test full keyboard flow for browse/upload, select, convert, edit, copy, download and help links.
- Programmatically label file pickers and status outputs; use `aria-live` politely for progress/completion messages.
- Handle errors without losing focus; recovery action must be reachable by keyboard.
- Verify contrast, zoom/reflow to 200–400%, reduced motion and mobile screen reader where practical.
- Ensure Markdown preview code blocks support scrolling without trapping focus.

## CRO hypotheses (tests, not promised lifts)

1. Upload widget in first viewport vs conventional hero first; primary metric = completed exports per eligible landing visit.
2. Small “sample output” preview vs text-only promise; metric = conversion-start rate and bounce.
3. Privacy statement visible next to upload vs footer-only; metric = conversion and support queries.
4. Format-specific preselection vs generic upload widget; metric = successful completion, not just clicks.
5. Research link near token-saving claim vs claim-only; metric = evidence engagement and downstream trust.

Before running A/B tests, establish analytics consent and event definition, avoid storing filenames/document content, randomize correctly, and require enough traffic for interpretation.

## Instrumentation event schema — non-sensitive

```text
landing_view: route_group, device_group, acquisition_group
conversion_started: format_group, file_count_bucket
conversion_completed: format_group, file_count_bucket, elapsed_bucket
export_completed: format_group, export_type (copy/md/zip)
conversion_error: stage, error_category (allowlisted)
```

Do not log raw files, signed URLs, exact uploaded titles, prompt text or credentials.
