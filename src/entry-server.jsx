import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { applySiteConfig } from './company';
import { SiteConfigProvider } from './config/site.jsx';
export function render(pathname, config) {
  applySiteConfig(config);
  return renderToString(<SiteConfigProvider config={config}><App pathname={pathname}/></SiteConfigProvider>);
}
