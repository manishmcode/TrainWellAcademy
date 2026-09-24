import React, { useCallback, useEffect, useState } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { applySiteConfig } from './company';
import { siteDefaults, seoDefaults } from './config/siteDefaults.js';
import { normalizeSiteConfig, normalizeSeoConfig } from './config/siteConfigData.js';
import { SiteConfigProvider } from './config/site.jsx';
import { API_ROOT } from './config/apiBase.js';
import { createPublicConfigClient } from './services/publicConfig.js';
import SEOHead from './components/SEOHead';
import { resolveSeo } from './config/seoConfig.js';
import './index.css';

function ClientApp({ site, seo }) {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const metadata = resolveSeo(pathname, site, seo);
  const redirect = useCallback((to) => {
    const destination = new URL(to, window.location.origin);
    const nextPath = `${destination.pathname}${destination.search}${destination.hash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextPath) window.history.replaceState(null, '', nextPath);
    setPathname(destination.pathname);
  }, []);

  useEffect(() => {
    const syncPathname = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', syncPathname);
    return () => window.removeEventListener('popstate', syncPathname);
  }, []);

  return <SiteConfigProvider config={site}><SEOHead metadata={metadata}/><App pathname={pathname} onRedirect={redirect}/></SiteConfigProvider>;
}

async function start() {
  let site = siteDefaults, seo = seoDefaults;
  const snapshot = document.getElementById('public-config');
  if (snapshot) {
    const data = JSON.parse(snapshot.textContent);
    site = normalizeSiteConfig(data.site);
    seo = normalizeSeoConfig(data.seo);
  } else if (import.meta.env.VITE_PUBLIC_CONFIG_SOURCE === 'api') {
    const client = createPublicConfigClient({ root: API_ROOT });
    const results = await Promise.allSettled([client.site(), client.seo()]);
    if (results[0].status === 'fulfilled') site = results[0].value;
    if (results[1].status === 'fulfilled') seo = results[1].value;
    if (results.some(result => result.status === 'rejected')) console.warn('Published configuration unavailable; using local defaults.');
  }
  applySiteConfig(site);
  const app = <React.StrictMode><ClientApp site={site} seo={seo}/></React.StrictMode>;
  const root = document.getElementById('root');
  if (root.hasChildNodes()) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
start().catch(error => { console.error('Application startup failed', error); document.getElementById('root').textContent = 'Unable to load the application. Please refresh the page.'; });
