import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
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
  const { pathname, hash, key } = useLocation();
  const metadata = resolveSeo(pathname, site, seo);

  useEffect(() => {
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash, key]);

  return <SiteConfigProvider config={site}><SEOHead metadata={metadata}/><App pathname={pathname}/></SiteConfigProvider>;
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
  const app = <React.StrictMode><BrowserRouter><ClientApp site={site} seo={seo}/></BrowserRouter></React.StrictMode>;
  const root = document.getElementById('root');
  if (root.hasChildNodes()) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
start().catch(error => { console.error('Application startup failed', error); document.getElementById('root').textContent = 'Unable to load the application. Please refresh the page.'; });
