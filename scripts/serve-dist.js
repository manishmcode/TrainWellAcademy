import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { knownRoutes, normalizePath } from '../src/config/routes.js';

const root = resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const route = normalizePath(path);
    let target = resolve(root, knownRoutes.includes(route) ? (route === '/' ? 'index.html' : route.slice(1) + '/index.html') : '.' + path);
    if (!target.startsWith(root + sep)) { res.writeHead(404); res.end(); return; }
    let status = 200;
    try { if (!(await stat(target)).isFile()) throw new Error('Not a file'); }
    catch { target = resolve(root, '404.html'); status = 404; }
    const body = await readFile(target);
    res.writeHead(status, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'SAMEORIGIN', 'Cache-Control': /-[\w-]{8,}\.(js|css)$/.test(target) ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(400); res.end('Bad request'); }
}).listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Static production preview ready.'));
