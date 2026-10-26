import UseCaseContent from '../../components/UseCaseContent';
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
    <UseCaseContent />
    <JsonLd data={faqJsonLd()} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'LLM cost optimization', item: `${SITE_URL}/usecase` },
    ] }} />
  </UseCaseClient>;
}
