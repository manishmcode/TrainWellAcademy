export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
export const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export function seoHtml(meta) {
  const tag = (name, value, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(value)}" data-seo>`;
  return [
    `<title>${escapeHtml(meta.title)}</title>`, tag('description', meta.description), tag('robots', meta.noindex ? 'noindex,follow' : 'index,follow'),
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" data-seo>`,
    tag('og:title', meta.title, true), tag('og:description', meta.description, true), tag('og:url', meta.canonical, true),
    tag('og:type', 'website', true), tag('og:locale', meta.locale, true),
    tag('twitter:card', meta.image ? 'summary_large_image' : 'summary'), tag('twitter:title', meta.title), tag('twitter:description', meta.description),
    ...(meta.image ? [tag('og:image', meta.image, true), tag('twitter:image', meta.image)] : []),
    ...(meta.schema ? [`<script type="application/ld+json" data-seo>${safeJson(meta.schema)}</script>`] : []),
  ].join('\n');
}
