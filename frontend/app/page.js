import HomeAbout from '../components/HomeAbout';
import ConverterClient from './ConverterClient';
import JsonLd from '../components/JsonLd';
import { FAQS, faqJsonLd } from '../lib/siteContent';

export default function Home() {
  return (
    <ConverterClient>
      <HomeAbout />
      <JsonLd data={faqJsonLd(FAQS.slice(0, 3))} />
    </ConverterClient>
  );
}
