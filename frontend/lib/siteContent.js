// Public copy shared by pages, metadata and structured data (JSON-LD), so
// what search and AI engines read always matches what visitors see.
// Figures are cited below; re-check them when the sources change.

import { MAX_FILE_SIZE, MAX_IMAGE_FILE_SIZE, MAX_QUEUE_FILES } from './formats.js';
import { OPERATOR, RETENTION_HOURS } from './legal/policies.js';

export const SITE_URL = 'https://llmiser.devbehindyou.com';
export const SITE_NAME = 'LLMiser';
export const CONTENT_UPDATED = '2026-10-20';
export const CONTENT_UPDATED_LABEL = '20 October 2026';

const mb = (bytes) => Math.round(bytes / (1024 * 1024));
export const DOC_MB = mb(MAX_FILE_SIZE);
export const IMAGE_MB = mb(MAX_IMAGE_FILE_SIZE);

export const TAGLINE = 'Make Every Token Count.';
export const POSITIONING = 'LLM cost optimizer';
export const HOME_TITLE = 'LLMiser: Free LLM Cost Optimizer for Documents';
export const HERO_TITLE = 'Optimize LLM costs. Start with your documents.';
export const DESCRIPTION =
  'LLMiser is a free LLM cost optimizer. Convert PDFs, Office files, images and ZIPs to clean Markdown, trim unnecessary context and prepare documents for AI.';

// Search themes describe supported features without assumed search volumes.
export const KEYWORDS = [
  'LLM cost optimizer',
  'LLM cost optimization',
  'reduce LLM input tokens',
  'document optimization for AI',
  'pdf to markdown converter',
  'pdf to markdown',
  'pdf to md',
  'convert pdf to markdown',
  'markdown converter',
  'word to markdown',
  'docx to markdown',
  'html to markdown',
  'excel to markdown',
  'powerpoint to markdown',
  'image to markdown',
  'scanned pdf to text',
  'zip to markdown',
  'reduce chatgpt tokens',
  'chatgpt free limit',
  'markdown for ai',
  'LLMiser',
];

export const FORMAT_GROUPS = [
  {
    name: 'Documents',
    formats: 'PDF, DOCX, PPTX, XLSX, XLS, EPUB, HTML, CSV, TSV, JSON, XML, TXT, MD',
    limit: `${DOC_MB} MB per file`,
    result: 'Markdown with headings, lists and pipe tables',
  },
  {
    name: 'Scanned PDFs',
    formats: 'PDF pages that are only pictures',
    limit: `${DOC_MB} MB per file`,
    result: 'Text pages read directly, scanned pages through text recognition (up to 100 per file)',
  },
  {
    name: 'Images',
    formats: 'PNG, JPG, JPEG, WebP, TIFF, BMP, GIF',
    limit: `${IMAGE_MB} MB per image`,
    result: 'The text in the image, as Markdown',
  },
  {
    name: 'ZIP files',
    formats: 'Code projects and document folders',
    limit: `${DOC_MB} MB upload, 2,000 files inside`,
    result: 'One combined Markdown file, a project index and a manifest',
  },
];

// Written the way people ask AI chat and search. Answers stand on their own
// (engines quote passages, not pages).
export const FAQS = [
  { q: "What is LLMiser?", a: `LLMiser is a free LLM cost optimizer for document inputs, made by DevBehindYou. It converts PDFs, Office files, images and ZIP projects into editable Markdown so you can remove unnecessary context before sending it to an AI assistant or RAG pipeline.` },
  { q: "How does LLMiser help optimize LLM costs?", a: `Convert a document, choose Clean or Compact output, and keep only the sections your task needs. Sending less unnecessary context can reduce billable input tokens. Savings depend on the model, tokenizer, input method and content. Always compare the result with the original and check answer quality.` },
  { q: "Does converting PDF to Markdown always save tokens?", a: `No. A provider that processes both PDF text and page images may use more tokens than a text-only Markdown input. A text extraction workflow may show little difference. Markdown can also lose charts or visual layout, so measure actual usage for your model and task.` },
  { q: "How do I convert documents with LLMiser?", a: `Choose or drop up to ${MAX_QUEUE_FILES} files, select Standard, Clean, Compact or RAG-ready, and press Convert all. Review and edit the Markdown, then copy it, download a .md file or export a ZIP. Documents support up to ${DOC_MB} MB per file.` },
  { q: "Can LLMiser read scanned PDFs and images?", a: `Yes. LLMiser reads PDF text directly and uses text recognition for scanned pages, up to 100 scanned pages per file. PNG, JPG, WebP and other supported images work up to ${IMAGE_MB} MB each. Review handwriting, small print, tables and equations for recognition errors.` },
  { q: "What happens to uploaded files?", a: `Files are uploaded to the service for conversion, not processed entirely on your device. Uploads and results use private storage with a default ${RETENTION_HOURS}-hour retention period. Administrative retention exceptions are described in the Privacy Policy. No account is required, and files are not used to train AI models.` },
  { q: "What do the output profiles do?", a: `Standard keeps the full result with a title and a source note. Clean removes the source note and extra blank lines. Compact also removes divider lines. RAG-ready adds a chunk marker before section headings. Review the output before using it, since smaller input is not automatically better input.` },
];

// ── Structured data (schema.org JSON-LD) ────────────────────────────────────

const ORG_ID = `${SITE_URL}/#developer`;

export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: DESCRIPTION,
        inLanguage: 'en',
        publisher: { '@id': ORG_ID },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#app`,
        name: SITE_NAME,
        url: SITE_URL,
        description: DESCRIPTION,
        applicationCategory: 'ProductivityApplication',
        applicationSubCategory: 'LLM cost optimization through document preparation',
        operatingSystem: 'Any (runs in the web browser)',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        image: `${SITE_URL}/og-card.png`,
        license: 'https://www.gnu.org/licenses/gpl-3.0.html',
        featureList: [
          'PDF to Markdown, including scanned pages',
          'Word, PowerPoint, Excel, EPUB, HTML, CSV, JSON and XML to Markdown',
          'Image to Markdown with text recognition',
          'ZIP projects to one Markdown file with a project index',
          `Up to ${MAX_QUEUE_FILES} files per batch`,
          'Four output profiles: Standard, Clean, Compact, RAG-ready',
          `Default file retention of ${RETENTION_HOURS} hours, with documented exceptions`,
        ],
        author: { '@id': ORG_ID },
      },
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: OPERATOR.name,
        url: 'https://devbehindyou.com',
        email: OPERATOR.email,
        logo: `${SITE_URL}/llmiser-icon.png`,
        sameAs: ['https://github.com/DevBehindYou'],
      },
    ],
  };
}

export function faqJsonLd(faqs = FAQS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
