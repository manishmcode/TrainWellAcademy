import { publicRoutes, clientRoutes, routeAliases } from '../src/config/routes.js';
import { resolveSeo } from '../src/config/seoConfig.js';
import { seoHtml, safeJson, escapeHtml } from '../src/config/seoHtml.js';

export async function prerender({ template, snapshot, render, write }) {
  const base = template.replace(/<title>[\s\S]*?<\/title>/i, '').replace(/<meta\s+name="description"[^>]*>/i, '');
  const html = (path, content = '') => base
    .replace('</head>', `${seoHtml(resolveSeo(path, snapshot.site, snapshot.seo))}\n<script id="public-config" type="application/json">${safeJson(snapshot)}</script>\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
  for (const path of [...publicRoutes, ...Object.keys(routeAliases)]) {
    await write(path === '/' ? 'index.html' : `${path.slice(1)}/index.html`, html(path, render(path, snapshot.site)));
  }
  // Private/guest account routes get an empty mount point, never anonymous SSR redirects.
  for (const path of clientRoutes) await write(`${path.slice(1)}/index.html`, html(path));
  await write('404.html', html('/404', render('/404', snapshot.site)));
  const urls = publicRoutes.filter(path => !resolveSeo(path, snapshot.site, snapshot.seo).noindex)
    .map(path => `<url><loc>${escapeHtml(resolveSeo(path, snapshot.site, snapshot.seo).canonical)}</loc></url>`).join('');
  await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
  await write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${snapshot.site.website.url}/sitemap.xml\n`);
  console.log(`Prerendered ${publicRoutes.length + Object.keys(routeAliases).length} public pages and ${clientRoutes.length} application shells.`);
}
