import { siteDefaults, seoDefaults } from './siteDefaults.js';
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const httpUrl = value => { try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } };
export function isPublicSiteConfig(value) {
  return object(value) && object(value.website) && text(value.website.name) && httpUrl(value.website.url)
    && object(value.company)
    && Object.entries(siteDefaults.company).every(([key, fallback]) => Array.isArray(fallback)
      ? Array.isArray(value.company[key]) && value.company[key].length > 0 && value.company[key].every(text)
      : text(value.company[key]));
}
export function normalizeSiteConfig(value = siteDefaults) {
  if (!isPublicSiteConfig(value)) throw new Error('Invalid public site configuration.');
  return {
    website: { name: value.website.name.trim(), url: value.website.url.replace(/\/+$/, '') },
    company: Object.fromEntries(Object.keys(siteDefaults.company).map(key => [key, value.company[key]])),
  };
}
export function isSeoConfig(value) {
  return object(value) && object(value.defaults) && text(value.defaults.title) && text(value.defaults.description)
    && object(value.social) && object(value.pages)
    && Object.entries(value.pages).every(([path, page]) => path.startsWith('/') && object(page)
      && ['title', 'description', 'canonical', 'image'].every(key => page[key] === undefined || typeof page[key] === 'string')
      && (page.noindex === undefined || typeof page.noindex === 'boolean')
      && (page.schema === undefined || object(page.schema) || Array.isArray(page.schema)));
}
export function normalizeSeoConfig(value = seoDefaults) {
  if (!isSeoConfig(value)) throw new Error('Invalid public SEO configuration.');
  return {
    defaults: { title: value.defaults.title, description: value.defaults.description, image: typeof value.defaults.image === 'string' ? value.defaults.image : '' },
    social: { type: 'website', locale: typeof value.social.locale === 'string' ? value.social.locale : 'en_GB' },
    pages: Object.fromEntries(Object.entries(value.pages).map(([path, page]) => [path,
      Object.fromEntries(['title', 'description', 'canonical', 'image', 'noindex', 'schema'].filter(key => page[key] !== undefined).map(key => [key, page[key]]))])),
  };
}
