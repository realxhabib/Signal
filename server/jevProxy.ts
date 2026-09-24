import type { IncomingMessage, ServerResponse } from 'node:http';
import { forwardToJev } from '../api/jev.ts';

// Node adapter for the Vite dev server and `npm start`; Vercel calls api/jev.ts directly.
export async function handleJev(req: IncomingMessage, res: ServerResponse) {
  let raw = '';
  if (req.method === 'POST') {
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 64 * 1024) break;
    }
  }
  const out = req.method === 'POST' ? await forwardToJev(raw) : new Response('{"error":"POST only"}', { status: 405 });
  res.statusCode = out.status;
  res.setHeader('Content-Type', 'application/json');
  res.end(await out.text());
}
