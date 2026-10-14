import { normalizeSiteConfig, normalizeSeoConfig } from '../config/siteConfigData.js';
export function createPublicConfigClient({ root, fetcher = fetch, now = Date.now, timeout = 5000 }) {
  const cache = new Map();
  const pending = new Map();
  function get(path, normalize) {
    const saved = cache.get(path);
    if (saved && saved.until > now()) return Promise.resolve(saved.value);
    if (pending.has(path)) return pending.get(path);
    const promise = (async () => {
      const response = await fetcher(root + path, { signal: AbortSignal.timeout(timeout), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Public configuration request failed (${response.status}).`);
      const value = normalize(await response.json());
      cache.set(path, { value, until: now() + 60000 });
      return value;
    })().finally(() => pending.delete(path));
    pending.set(path, promise);
    return promise;
  }
  return { site: () => get('/public/site-config', normalizeSiteConfig), seo: () => get('/public/seo', normalizeSeoConfig) };
}
