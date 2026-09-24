import { canonicalPath, publicRoutes, knownRoutes, normalizePath } from './routes.js';

const labels = { '/pricing': 'Membership plans', '/unsubscribe': 'Cancel membership', '/imprint': 'Imprint', '/privacy': 'Privacy policy', '/terms': 'Terms and conditions', '/login': 'Login', '/signup': 'Create account', '/checkout': 'Checkout', '/library': 'Library', '/profile': 'My account', '/live-classes': 'Manage live classes' };
const pageTypes = { '/library': 'CollectionPage' };
const pageUrl = (route, siteUrl) => new URL(route === '/' ? '/' : `${route}/`, siteUrl).href;

function organizationSchema(site) {
  const base = site.website.url.replace(/\/+$/, '');
  return {
    '@type': 'Organization', '@id': `${base}/#organization`, name: site.company.brandName, legalName: site.company.legalName, url: `${base}/`,
    logo: { '@type': 'ImageObject', '@id': `${base}/#logo`, url: `${base}/logo.webp`, contentUrl: `${base}/logo.webp` }, email: site.company.supportEmail,
    address: { '@type': 'PostalAddress', streetAddress: '12 Nadejda Street', addressLocality: 'Sandanski', postalCode: '2800', addressRegion: 'Blagoevgrad', addressCountry: 'BG' },
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: site.company.supportEmail },
  };
}

function breadcrumbSchema(route, canonical, base) {
  if (route === '/') return null;
  return { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
    { '@type': 'ListItem', position: 2, name: labels[route] || 'Page', item: canonical },
  ] };
}

function pricingCatalog(canonical, base) {
  const plans = [
    ['basic', 'Basic Monthly Membership', '29.00', 'Guided beginner workouts with flexible home training, access on any device, and the freedom to cancel anytime.'],
    ['standard', 'Standard Monthly Membership', '59.00', 'Workout variety with progressive training, strength, core, and conditioning support on any device. Cancel anytime.'],
    ['premium', 'Premium Monthly Membership', '99.00', 'Full access to training videos, including workouts, mobility, nutrition, and strength guidance. Train anytime and cancel anytime.'],
  ];
  return { '@type': 'OfferCatalog', '@id': `${canonical}#membership-plans`, name: 'TrainWellAcademy Fitness Membership Plans', itemListElement: plans.map(([slug, name, price, description]) => ({
    '@type': 'Offer', '@id': `${canonical}#${slug}-plan-offer`, name, url: canonical, price, priceCurrency: 'EUR', seller: { '@id': `${base}/#organization` },
    itemOffered: { '@type': 'Service', '@id': `${canonical}#${slug}-plan`, name: `TrainWellAcademy ${name.replace(' Monthly Membership', ' Plan')}`, image: `${base}/${slug}.webp`, serviceType: 'Monthly fitness membership', description, provider: { '@id': `${base}/#organization` } },
    priceSpecification: { '@type': 'UnitPriceSpecification', price, priceCurrency: 'EUR', unitText: 'month', billingDuration: 'P1M' },
  })) };
}

function schemaFor(route, metadata, site) {
  const base = site.website.url.replace(/\/+$/, '');
  const canonical = metadata.canonical;
  const websiteId = `${base}/#website`, serviceId = `${base}/#fitness-service`;
  const legalPage = ['/terms', '/privacy', '/imprint'].includes(route);
  const graph = [
    organizationSchema(site),
    { '@type': 'WebSite', '@id': websiteId, url: `${base}/`, name: site.company.brandName, publisher: { '@id': `${base}/#organization` } },
    { '@type': 'Service', '@id': serviceId, name: 'TrainWellAcademy Fitness Membership', serviceType: 'Online fitness training and workout membership', description: 'An online fitness membership providing on-demand lessons across Pilates, bodyweight training, home workouts, nutrition, kettlebells, mobility, and core training.', url: `${base}/`, provider: { '@id': `${base}/#organization` } },
    { '@type': pageTypes[route] || 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: metadata.title, description: metadata.description, isPartOf: { '@id': websiteId }, about: { '@id': legalPage ? `${base}/#organization` : serviceId }, publisher: { '@id': `${base}/#organization` }, ...(route === '/pricing' ? { mainEntity: { '@id': `${canonical}#membership-plans` } } : {}), ...(route !== '/' ? { breadcrumb: { '@id': `${canonical}#breadcrumb` } } : {}) },
  ];
  if (route === '/pricing') graph.push(pricingCatalog(canonical, base));
  const breadcrumb = breadcrumbSchema(route, canonical, base);
  if (breadcrumb) graph.push(breadcrumb);
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function resolveSeo(path, site, seo) {
  const route = canonicalPath(path);
  const page = seo.pages[route] || {};
  const known = knownRoutes.includes(normalizePath(path));
  const canonical = pageUrl(route, site.website.url);
  const image = page.image || seo.defaults.image;
  const safeImage = (() => { try { const url = new URL(image, site.website.url); return image && ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } })();
  const noindex = !publicRoutes.includes(normalizePath(path)) || route === '/unsubscribe' || page.noindex === true;
  const metadata = { title: page.title || (route === '/' ? seo.defaults.title : `${known ? labels[route] || site.website.name : 'Page not found'} | ${site.website.name}`), description: page.description || seo.defaults.description, canonical, image: safeImage, noindex, locale: seo.social.locale };
  return { ...metadata, schema: known ? schemaFor(route, metadata, site) : null };
}
