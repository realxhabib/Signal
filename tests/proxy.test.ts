import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST, questions } from '../api/jev';
import { handleJev } from '../server/jevProxy';

let server: Server;
const realFetch = globalThis.fetch;

async function start() {
  server = createServer((req, res) => void handleJev(req, res));
  await new Promise<void>((r) => server.listen(0, r));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

afterEach(() => {
  server?.close();
  globalThis.fetch = realFetch;
  vi.unstubAllEnvs();
});

describe('jev proxy', () => {
  it('refuses without an API key', async () => {
    vi.stubEnv('TYPESAFE_API_KEY', '');
    const url = await start();
    const res = await realFetch(url, { method: 'POST', body: '{}' });
    expect(res.status).toBe(503);
  });

  it('adds the bearer key, pinned model and fixed questions, ignoring anything else the client sends', async () => {
    vi.stubEnv('TYPESAFE_API_KEY', 'test-key');
    const url = await start();
    const upstream = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
    globalThis.fetch = upstream as unknown as typeof fetch;
    const res = await realFetch(url, { method: 'POST', body: JSON.stringify({ state: { a: 1 }, questions: { q: 1 }, model: 'evil' }) });
    expect(res.status).toBe(200);
    const [target, init] = upstream.mock.calls[0] as unknown as [string, RequestInit];
    expect(target).toBe('https://api.typesafe.ai/v1/systemone');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-key');
    expect(JSON.parse(init.body as string)).toEqual({ model: 'jev-1.13.0', state: { a: 1 }, questions });
  });

  it('rejects requests without a state object', async () => {
    vi.stubEnv('TYPESAFE_API_KEY', 'test-key');
    const res = await POST(new Request('http://x/api/jev', { method: 'POST', body: '{"questions":{}}' }));
    expect(res.status).toBe(400);
  });

  it('works as a Vercel function', async () => {
    vi.stubEnv('TYPESAFE_API_KEY', 'test-key');
    globalThis.fetch = vi.fn(async () => new Response('{"model":"jev-1.13.0"}')) as unknown as typeof fetch;
    const res = await POST(new Request('http://x/api/jev', { method: 'POST', body: '{"state":{"a":1}}' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ model: 'jev-1.13.0' });
  });
});
