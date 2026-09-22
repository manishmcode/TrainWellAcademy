import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiConfig } from '../src/config/apiBase.js';
import { siteDefaults, seoDefaults } from '../src/config/siteDefaults.js';
import { normalizeSiteConfig, normalizeSeoConfig } from '../src/config/siteConfigData.js';
import { createPublicConfigClient } from '../src/services/publicConfig.js';
import { resolveSeo } from '../src/config/seoConfig.js';
import { seoHtml, safeJson } from '../src/config/seoHtml.js';
import { prerender } from '../scripts/prerender.js';
import { publicRoutes, clientRoutes } from '../src/config/routes.js';

test('API root normalizes slashes and does not duplicate prefixes', () => {
  assert.equal(resolveApiConfig('https://example.com///', 'api/').API_ROOT, 'https://example.com/api');
  assert.equal(resolveApiConfig('https://example.com/api/', '/api').API_ROOT, 'https://example.com/api');
  assert.equal(resolveApiConfig('https://example.com', '').API_ROOT, 'https://example.com');
});
test('public configuration validates shape and drops unrelated fields', () => {
  assert.throws(() => normalizeSiteConfig({ success: true, data: siteDefaults }));
  assert.throws(() => normalizeSiteConfig({ ...siteDefaults, website: { name: 'Example', url: 'javascript:alert(1)' } }));
  assert.deepEqual(normalizeSiteConfig({ ...siteDefaults, privateKey: 'must-not-publish' }), siteDefaults);
  assert.throws(() => normalizeSeoConfig({ ...seoDefaults, pages: [] }));
  assert.deepEqual(normalizeSeoConfig(seoDefaults), seoDefaults);
});
test('public fetch deduplicates, caches for 60 seconds and retries failed requests', async () => {
  let count = 0, clock = 0, fail = false;
  const client = createPublicConfigClient({ root: 'https://example.com/api', now: () => clock, fetcher: async () => {
    count++; if (fail) throw new Error('Unavailable');
    return { ok: true, json: async () => siteDefaults };
  } });
  await Promise.all([client.site(), client.site()]);
  assert.equal(count, 1);
  clock = 59999; await client.site(); assert.equal(count, 1);
  clock = 60001; fail = true; await assert.rejects(client.site());
  fail = false; await client.site(); assert.equal(count, 3);
});
test('public fetch has a timeout and rejects invalid and unsuccessful responses', async () => {
  const client = createPublicConfigClient({ root: '', timeout: 10, fetcher: (_url, { signal }) => new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 200);
    signal.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason); });
  }) });
  await assert.rejects(client.site(), /timeout/i);
  const invalid = createPublicConfigClient({ root: '', fetcher: async () => ({ ok: true, json: async () => ({}) }) });
  await assert.rejects(invalid.site(), /Invalid/);
  const unavailable = createPublicConfigClient({ root: '', fetcher: async () => ({ ok: false, status: 503 }) });
  await assert.rejects(unavailable.site(), /503/);
});
test('SEO cannot index private routes and safely escapes markup and embedded JSON', () => {
  const seo = { ...seoDefaults, pages: { '/profile': { noindex: false }, '/': { title: '</title><script>alert(1)</script>', schema: { text: '</script><script>bad</script>' } } } };
  assert.equal(resolveSeo('/profile', siteDefaults, seo).noindex, true);
  assert.equal(resolveSeo('/unknown', siteDefaults, seo).noindex, true);
  assert.equal(resolveSeo('/privacy-policy', siteDefaults, seo).canonical, 'https://trainwellacademy.net/privacy/');
  assert.ok(!seoHtml(resolveSeo('/', siteDefaults, seo)).includes('<script>alert'));
  assert.ok(!safeJson({ text: '</script>' }).includes('</script>'));
});
test('prerender keeps public routes with empty SEO pages and excludes account markup', async () => {
  const files = new Map();
  await prerender({ template: '<html><head><title>old</title></head><body><div id="root"></div></body></html>', snapshot: { site: siteDefaults, seo: seoDefaults }, render: path => `<main>${path}</main>`, write: async (name, content) => files.set(name, content) });
  for (const path of publicRoutes) assert.ok(files.get(path === '/' ? 'index.html' : path.slice(1) + '/index.html').includes(`<main>${path}</main>`));
  for (const path of clientRoutes) { const html = files.get(path.slice(1) + '/index.html'); assert.ok(html.includes('<div id="root"></div>')); assert.ok(html.includes('noindex,follow')); }
  assert.ok(files.has('404.html'));
  assert.ok(!files.get('sitemap.xml').includes('/profile/'));
  assert.ok(!files.get('sitemap.xml').includes('/unsubscribe/'));
});
