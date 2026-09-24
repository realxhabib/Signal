import type { IncomingMessage, ServerResponse } from 'node:http';

// Forwards /api/jev to TypeSafe so the API key stays on the server.
const ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
const MAX_BODY = 64 * 1024;

export async function handleJev(req: IncomingMessage, res: ServerResponse) {
  const send = (status: number, body: unknown) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
  };
  if (req.method !== 'POST') return send(405, { error: 'POST only' });
  const key = process.env.TYPESAFE_API_KEY;
  if (!key) return send(503, { error: 'TYPESAFE_API_KEY is not set on the server' });

  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) return send(413, { error: 'Request too large' });
  }
  let body: { state?: unknown; questions?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return send(400, { error: 'Invalid JSON' });
  }

  const payload = JSON.stringify({
    model: process.env.JEV_MODEL ?? 'jev-1.13.0',
    state: body.state,
    questions: body.questions,
  });
  for (let attempt = 0; ; attempt++) {
    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: payload,
    });
    if ((upstream.status === 429 || upstream.status === 529) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      continue;
    }
    res.statusCode = upstream.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(await upstream.text());
    return;
  }
}
