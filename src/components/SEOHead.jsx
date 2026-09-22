import { useEffect } from 'react';
import { seoHtml } from '../config/seoHtml.js';
export default function SEOHead({ metadata }) {
  useEffect(() => {
    document.querySelectorAll('title, meta[name="description"], [data-seo]').forEach(node => node.remove());
    const template = document.createElement('template');
    template.innerHTML = seoHtml(metadata);
    document.head.append(template.content);
  }, [metadata]);
  return null;
}
