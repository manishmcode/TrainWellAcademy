// Rendering and hosting never depend on SEO data being populated.
export const publicRoutes = ['/', '/pricing', '/signup', '/unsubscribe', '/imprint', '/privacy', '/terms'];
export const clientRoutes = ['/login', '/checkout', '/library', '/profile', '/live-classes'];
export const routeAliases = { '/privacy-policy': '/privacy', '/terms-conditions': '/terms' };
export const normalizePath = path => path.replace(/\/+$/, '') || '/';
export const canonicalPath = path => routeAliases[normalizePath(path)] || normalizePath(path);
export const knownRoutes = [...publicRoutes, ...clientRoutes, ...Object.keys(routeAliases)];
