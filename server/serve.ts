// Production server: serves the built app from dist/ and the Jev proxy.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { handleJev } from './jevProxy.ts';

const root = join(import.meta.dirname, '..', 'dist');
const types: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname === '/api/jev') return handleJev(req, res);
  const path = normalize(join(root, url.pathname === '/' ? 'index.html' : url.pathname));
  if (!path.startsWith(root)) {
    res.statusCode = 403;
    return res.end();
  }
  try {
    const data = await readFile(path);
    res.setHeader('Content-Type', types[extname(path)] ?? 'application/octet-stream');
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
}).listen(Number(process.env.PORT ?? 3000), () => console.log(`Signal on http://localhost:${process.env.PORT ?? 3000}`));
