import { loadEnv } from 'vite';
import { resolveApiConfig } from '../src/config/apiBase.js';
import { siteDefaults, seoDefaults } from '../src/config/siteDefaults.js';
import { createPublicConfigClient } from '../src/services/publicConfig.js';

export async function fetchBuildConfig(mode) {
  const environment = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const base = environment.VITE_API_BASE_URL || (mode === 'development' ? 'http://localhost:4000' : undefined);
  const { API_ROOT } = resolveApiConfig(base, environment.VITE_API_PREFIX);
  if (environment.BUILD_CONFIG_SOURCE !== 'api') {
    console.log('Building with local site configuration; no backend configuration endpoints required.');
    return { site: siteDefaults, seo: seoDefaults };
  }
  const client = createPublicConfigClient({ root: API_ROOT });
  const [site, seo] = await Promise.all([client.site(), client.seo()]);
  console.log(`Loaded published configuration from ${API_ROOT}.`);
  return { site, seo };
}
