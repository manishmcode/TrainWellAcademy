import { createContext, useContext } from 'react';
import { siteDefaults } from './siteDefaults.js';
const SiteContext = createContext(siteDefaults);
export function SiteConfigProvider({ config, children }) {
  return <SiteContext.Provider value={config}>{children}</SiteContext.Provider>;
}
export const useSiteConfig = () => useContext(SiteContext);
export function useConfigValue(path) {
  return path.split('.').reduce((value, key) => value?.[key], useSiteConfig());
}
