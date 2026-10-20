import Link from 'next/link';
import ConverterClient from './ConverterClient';
import JsonLd from '../components/JsonLd';
import { FAQS, faqJsonLd } from '../lib/siteContent';

export default function Home() {
  return (
    <ConverterClient>
      <section className="mt-8 mb-8 space-y-5 max-w-4xl mx-auto font-sans" aria-labelledby="about-llmiser">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--faint)]">MDify is now LLMiser · by DevBehindYou</p>
          <h2 id="about-llmiser" className="text-2xl font-bold">An LLM cost optimizer for your document workflow</h2>
          <p className="text-sm leading-relaxed text-[var(--muted)] mt-3">Prepare useful context before you spend tokens. LLMiser converts PDFs, Office files, images and ZIP projects to editable Markdown. Choose a profile, review the output, and send only what your AI task needs.</p>
        </div>
        <ol className="grid sm:grid-cols-3 gap-4 list-none p-0">
          {[
            ['1. Convert', 'Upload documents and choose Standard, Clean, Compact or RAG-ready output.'],
            ['2. Refine', 'Check tables and OCR, remove irrelevant sections and keep essential context.'],
            ['3. Measure', 'Compare model-specific usage and answer quality before changing your workflow.'],
          ].map(([title, text]) => <li key={title} className="rounded-lg border border-[var(--border-3)] bg-[var(--surface)] p-4"><h3 className="font-semibold">{title}</h3><p className="text-sm mt-2 text-[var(--muted)]">{text}</p></li>)}
        </ol>
        <p className="text-sm text-[var(--muted)]">Token counts in the app are rough text estimates, not billing measurements. Actual savings depend on your model and input method. <Link className="underline" href="/usecase">See how document cost optimization works</Link>.</p>
        <p className="text-sm text-[var(--muted)]">Files are uploaded for conversion with a default 48-hour retention period and documented exceptions. <Link className="underline" href="/privacy">Read the Privacy Policy</Link>.</p>
        <h2 className="text-xl font-bold">LLMiser questions, answered</h2>
        <div className="space-y-2">
          {FAQS.slice(0, 3).map(({ q, a }) => <details key={q} className="border border-[var(--border-3)] rounded-lg p-4"><summary className="font-medium cursor-pointer">{q}</summary><p className="text-sm leading-relaxed mt-3 text-[var(--muted)]">{a}</p></details>)}
        </div>
      </section>
      <JsonLd data={faqJsonLd(FAQS.slice(0, 3))} />
    </ConverterClient>
  );
}
