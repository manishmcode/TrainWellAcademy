import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile } from 'node:fs/promises';

const appRoutes = new Set(['/', '/pricing', '/login', '/signup', '/profile', '/checkout', '/library', '/live-classes', '/unsubscribe', '/imprint', '/privacy', '/privacy-policy', '/terms', '/terms-conditions']);

const development404 = {
  name: 'development-404-status',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const pathname = new URL(req.url || '/', 'http://localhost').pathname.replace(/\/+$/, '') || '/';
      const isAssetRequest = pathname.startsWith('/@') || pathname.startsWith('/src/') || pathname.startsWith('/assets/') || pathname.includes('.');

      if (appRoutes.has(pathname) || pathname.startsWith('/trainwellacademy-api/') || pathname.startsWith('/v/') || isAssetRequest) return next();

      try {
        const template = await readFile('index.html', 'utf8');
        const html = await server.transformIndexHtml(req.url || '/', template);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      } catch (error) {
        next(error);
      }
    });
  },
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const target = new URL(env.VITE_API_BASE_URL || 'http://localhost:4000', 'http://localhost:4000').origin;
  const proxy = { '/v/': { target, changeOrigin: true } };
  return { plugins: [react(), development404], server: { proxy }, preview: { proxy } };
});
