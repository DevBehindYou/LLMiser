import Link from 'next/link';
import UseCaseClient from './UseCaseClient';
import JsonLd from '../../components/JsonLd';
import { CONTENT_UPDATED, CONTENT_UPDATED_LABEL, FAQS, FORMAT_GROUPS, SITE_NAME, SITE_URL, faqJsonLd } from '../../lib/siteContent';

const title = 'Optimize LLM Costs with AI-Ready Documents';
const description = 'How LLMiser helps reduce unnecessary AI context: convert documents to Markdown, review output quality and measure model-specific token usage.';
export const metadata = {
  title, description,
  alternates: { canonical: '/usecase' },
  openGraph: { title, description, url: `${SITE_URL}/usecase`, siteName: SITE_NAME, type: 'website', images: ['/og-card.png'] },
  twitter: { card: 'summary_large_image', title, description, images: ['/og-card.png'] },
};

export default function UseCasePage() {
  return <UseCaseClient>
    <article className="space-y-8 font-sans">
      <header className="space-y-4">
        <p className="font-tech text-xs tracking-widest text-[var(--faint)]">LLMISER · LLM COST OPTIMIZATION</p>
        <h1 className="text-3xl sm:text-4xl font-bold">Make Every Token Count.</h1>
        <p className="text-[var(--muted)] leading-relaxed">LLMiser is a free LLM cost optimizer for document inputs. Convert PDFs, Word files, spreadsheets, slides, images and ZIP projects to Markdown, then trim unnecessary context before sending it to an AI assistant or retrieval pipeline.</p>
        <Link href="/" className="inline-block rounded-full aurora-btn px-5 py-3 font-semibold">Optimize a document →</Link>
      </header>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">How can document preparation reduce LLM costs?</h2>
        <p className="text-[var(--muted)] leading-relaxed">An AI request can include much more context than the question needs. Converting a document to editable Markdown makes its text easier to inspect, select and reuse. Clean and Compact profiles remove some formatting overhead. Selecting relevant sections can reduce unnecessary input tokens.</p>
        <p className="text-[var(--muted)] leading-relaxed">Savings vary. Native PDF ingestion may include page images as well as text, while other workflows extract text only. Markdown can omit charts, equations or layout information. Keep the original when visual details matter, and check output quality before using a smaller representation.</p>
      </section>
      <section className="space-y-3 border border-[var(--border-3)] bg-[var(--surface)] rounded-xl p-5">
        <h2 className="text-2xl font-bold">Measure the result for your model</h2>
        <ol className="list-decimal pl-5 space-y-2 text-[var(--muted)]">
          <li>Run the same task with the original input method and the reviewed Markdown.</li>
          <li>Record the exact model, tokenizer, billable input and output usage, caching and image charges.</li>
          <li>Use your provider&apos;s current prices, and include any OCR or processing costs.</li>
          <li>Compare answer accuracy, especially for tables, scans and visual material.</li>
        </ol>
        <p className="font-tech text-sm">Text input cost = billable input tokens ÷ 1,000,000 × price per million tokens.</p>
        <p className="text-sm text-[var(--muted)]">The app estimates text tokens using a character-based heuristic. It does not measure the original PDF&apos;s billable tokens or promise a fixed saving. It prepares documents rather than routing models, caching API calls or changing your provider&apos;s prices.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Supported documents and output</h2>
        <div className="overflow-x-auto"><table className="w-full text-sm text-left min-w-[560px]"><caption className="sr-only">LLMiser supported formats, upload limits and output</caption><thead><tr>{['Input', 'Formats', 'Limit', 'Output'].map(label => <th scope="col" key={label} className="p-3 border-b border-[var(--border-3)]">{label}</th>)}</tr></thead><tbody>{FORMAT_GROUPS.map(group => <tr key={group.name}>{[group.name, group.formats, group.limit, group.result].map(value => <td key={value} className="p-3 align-top border-b border-[var(--border)] text-[var(--muted)]">{value}</td>)}</tr>)}</tbody></table></div>
        <p className="text-sm text-[var(--muted)]">Review converted headings, reading order, tables and OCR. RAG-ready adds section markers for downstream processing. It does not build an index or guarantee retrieval quality.</p>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        {FAQS.map(({ q, a }) => <details key={q} className="border border-[var(--border-3)] rounded-lg p-4"><summary className="font-semibold cursor-pointer">{q}</summary><p className="mt-3 leading-relaxed text-[var(--muted)]">{a}</p></details>)}
      </section>
      <p className="text-xs text-[var(--faint)]">Updated <time dateTime={CONTENT_UPDATED}>{CONTENT_UPDATED_LABEL}</time>. By DevBehindYou. <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link></p>
    </article>
    <JsonLd data={faqJsonLd()} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'LLM cost optimization', item: `${SITE_URL}/usecase` },
    ] }} />
  </UseCaseClient>;
}
