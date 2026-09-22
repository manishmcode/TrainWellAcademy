import { build } from 'vite';
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fetchBuildConfig } from './fetch-build-config.js';
import { prerender } from './prerender.js';

const mode = process.argv.includes('--development') ? 'development' : 'production';
if (process.argv.includes('--local')) process.env.BUILD_CONFIG_SOURCE = 'local';
const snapshot = await fetchBuildConfig(mode);
const root = process.cwd();
const temporary = ['.build-data', 'dist-ssr'].map(name => resolve(root, name));
try {
  await mkdir(temporary[0], { recursive: true });
  await writeFile(resolve(temporary[0], 'public-config.json'), JSON.stringify(snapshot));
  await build({ mode });
  await build({ mode, build: { ssr: 'src/entry-server.jsx', outDir: 'dist-ssr', emptyOutDir: true, copyPublicDir: false } });
  const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
  const template = await readFile('dist/index.html', 'utf8');
  await prerender({ template, snapshot, render, write: async (name, html) => {
    const destination = resolve('dist', name);
    if (!destination.startsWith(resolve('dist') + sep)) throw new Error('Output path is outside dist.');
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
  } });
} finally {
  for (const target of temporary) {
    if (dirname(target) !== root || !target.startsWith(root + sep)) throw new Error('Unsafe temporary path.');
    await rm(target, { recursive: true, force: true });
  }
}
