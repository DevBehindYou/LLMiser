'use client';
import { useI18n } from './i18n/I18nContext';

import Link from 'next/link';
import { CONTENT_UPDATED, CONTENT_UPDATED_LABEL, FAQS, FORMAT_GROUPS } from '../lib/siteContent';
export default function UseCaseContent(){
  const { uiText } = useI18n();
return (<article className="space-y-8 font-sans">
      <header className="space-y-4">
        <p className="font-tech text-xs tracking-widest text-[var(--faint)]">{uiText("LLMISER · LLM COST OPTIMIZATION")}</p>
        <h1 className="text-3xl sm:text-4xl font-bold">{uiText("Make Every Token Count.")}</h1>
        <p className="text-[var(--muted)] leading-relaxed">{uiText("LLMiser is a free LLM cost optimizer for document inputs. Convert PDFs, Word files, spreadsheets, slides, images and ZIP projects to Markdown, then trim unnecessary context before sending it to an AI assistant or retrieval pipeline.")}</p>
        <Link href="/" className="inline-block rounded-full aurora-btn px-5 py-3 font-semibold">{uiText("Optimize a document →")}</Link>
      </header>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">{uiText("How can document preparation reduce LLM costs?")}</h2>
        <p className="text-[var(--muted)] leading-relaxed">{uiText("An AI request can include much more context than the question needs. Converting a document to editable Markdown makes its text easier to inspect, select and reuse. Clean and Compact profiles remove some formatting overhead. Selecting relevant sections can reduce unnecessary input tokens.")}</p>
        <p className="text-[var(--muted)] leading-relaxed">{uiText("Savings vary. Native PDF ingestion may include page images as well as text, while other workflows extract text only. Markdown can omit charts, equations or layout information. Keep the original when visual details matter, and check output quality before using a smaller representation.")}</p>
      </section>
      <section className="space-y-3 border border-[var(--border-3)] bg-[var(--surface)] rounded-xl p-5">
        <h2 className="text-2xl font-bold">{uiText("Measure the result for your model")}</h2>
        <ol className="list-decimal pl-5 space-y-2 text-[var(--muted)]">
          <li>{uiText("Run the same task with the original input method and the reviewed Markdown.")}</li>
          <li>{uiText("Record the exact model, tokenizer, billable input and output usage, caching and image charges.")}</li>
          <li>{uiText("Use your provider's current prices, and include any OCR or processing costs.")}</li>
          <li>{uiText("Compare answer accuracy, especially for tables, scans and visual material.")}</li>
        </ol>
        <p className="font-tech text-sm">{uiText("Text input cost = billable input tokens ÷ 1,000,000 × price per million tokens.")}</p>
        <p className="text-sm text-[var(--muted)]">{uiText("The app estimates text tokens using a character-based heuristic. It does not measure the original PDF's billable tokens or promise a fixed saving. It prepares documents rather than routing models, caching API calls or changing your provider's prices.")}</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">{uiText("Supported documents and output")}</h2>
        <div className="overflow-x-auto"><table className="w-full text-sm text-left min-w-[560px]"><caption className="sr-only">{uiText("LLMiser supported formats, upload limits and output")}</caption><thead><tr>{['Input', 'Formats', 'Limit', 'Output'].map(label => <th scope="col" key={label} className="p-3 border-b border-[var(--border-3)]">{uiText(label)}</th>)}</tr></thead><tbody>{FORMAT_GROUPS.map(group => <tr key={group.name}>{[group.name, group.formats, group.limit, group.result].map(value => <td key={value} className="p-3 align-top border-b border-[var(--border)] text-[var(--muted)]">{uiText(value)}</td>)}</tr>)}</tbody></table></div>
        <p className="text-sm text-[var(--muted)]">{uiText("Review converted headings, reading order, tables and OCR. RAG-ready adds section markers for downstream processing. It does not build an index or guarantee retrieval quality.")}</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">{uiText("Frequently asked questions")}</h2>
        {FAQS.map(({ q, a }) => <details key={q} className="border border-[var(--border-3)] rounded-lg p-4"><summary className="font-semibold cursor-pointer">{uiText(q)}</summary><p className="mt-3 leading-relaxed text-[var(--muted)]">{uiText(a)}</p></details>)}
      </section>
      <p className="text-xs text-[var(--faint)]">{uiText("Updated ")}<time dateTime={CONTENT_UPDATED}>{uiText(CONTENT_UPDATED_LABEL)}</time>{uiText(". By DevBehindYou. ")}<Link href="/privacy" className="underline">{uiText("Privacy")}</Link> · <Link href="/terms" className="underline">{uiText("Terms")}</Link></p>
    </article>);}
