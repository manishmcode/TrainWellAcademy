import { canonicalPath, publicRoutes, knownRoutes, normalizePath } from './routes.js';
const labels = { '/pricing': 'Membership plans', '/unsubscribe': 'Cancel membership', '/imprint': 'Imprint', '/privacy': 'Privacy policy', '/terms': 'Terms and conditions', '/login': 'Login', '/signup': 'Create account', '/checkout': 'Checkout', '/library': 'Library', '/profile': 'My account', '/live-classes': 'Manage live classes' };
export function resolveSeo(path, site, seo) {
  const route = canonicalPath(path);
  const page = seo.pages[route] || {};
  const known = knownRoutes.includes(normalizePath(path));
  const canonical = new URL(route === '/' ? '/' : route + '/', site.website.url).href;
  const image = page.image || seo.defaults.image;
  const safeImage = (() => { try { const url = new URL(image, site.website.url); return image && ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } })();
  const noindex = !publicRoutes.includes(normalizePath(path)) || route === '/unsubscribe' || page.noindex === true;
  return {
    title: page.title || (route === '/' ? seo.defaults.title : `${known ? labels[route] || site.website.name : 'Page not found'} | ${site.website.name}`),
    description: page.description || seo.defaults.description, canonical, image: safeImage, noindex,
    schema: noindex ? null : page.schema || (route === '/' ? { '@context': 'https://schema.org', '@type': 'Organization', name: site.company.legalName, url: site.website.url, email: site.company.supportEmail } : null),
    locale: seo.social.locale,
  };
}
