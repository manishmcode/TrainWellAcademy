import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile } from 'node:fs/promises';

const appRoutes = new Set(['/', '/pricing', '/login', '/signup', '/profile', '/checkout', '/library', '/live-classes', '/unsubscribe', '/imprint', '/privacy', '/privacy-policy', '/terms', '/terms-conditions']);

const development404 = {
  name: 'development-404-status',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const pathname = new URL(req.url || '/', 'http://localhost').pathname.replace(/\/+$/, '') || '/';
      const isAssetRequest = pathname.startsWith('/@') || pathname.startsWith('/src/') || pathname.startsWith('/assets/') || pathname.includes('.');

      if (appRoutes.has(pathname) || pathname.startsWith('/trainwellacademy-api/') || isAssetRequest) return next();

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

export default defineConfig({ plugins: [react(), development404] });
