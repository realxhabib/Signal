// Vercel serverless function (POST /api/jev) and the shared Jev forwarding logic.
// Kept free of local imports so Vercel can bundle it on its own; the dev server
// and `npm start` reuse it through server/jevProxy.ts.

const ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
const MAX_BODY = 32 * 1024;

// The questions are fixed here on the server so a public deployment can only
// be used to judge trade setups, not as a general-purpose proxy for the key.
export const questions = {
  regime: {
    type: 'choice',
    instructions: 'Which market regime best describes `state` right now?',
    criteria: {
      trending_up: 'Sustained uptrend with higher highs and supportive momentum',
      trending_down: 'Sustained downtrend with lower lows and supportive momentum',
      ranging: 'Sideways, mean-reverting price with weak trend strength',
      choppy_volatile: 'Erratic, high-volatility whipsaw with no reliable direction',
    },
  },
  direction: {
    type: 'choice',
    instructions:
      'A disciplined leveraged trader with a 2 ATR stop and a 3R target is deciding what to do on the next candle. Which action has the highest expected value given `state`?',
    criteria: {
      long: 'Open a long position',
      short: 'Open a short position',
      stand_aside: 'Do not trade; the edge is unclear or risk is too high',
    },
  },
  trap: {
    type: 'noul',
    instructions:
      'Is the `proposed_trade` likely to be a false breakout or whipsaw that hits a 2 ATR stop before moving meaningfully in its favour?',
    criteria: {
      true: 'Likely trap: exhaustion, overextension, fading momentum or choppy conditions',
      false: 'Clean setup: momentum, trend and volume support the trade',
    },
  },
  conviction: {
    type: 'score',
    instructions: 'How high-quality is the `proposed_trade` setup?',
    criteria: [
      'Very poor: signals conflict, avoid',
      'Weak: marginal edge',
      'Moderate: some confluence with notable risks',
      'Strong: clear confluence, few red flags',
      'Exceptional: textbook, fully aligned setup',
    ],
  },
} as const;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export async function forwardToJev(raw: string, env: Record<string, string | undefined> = process.env): Promise<Response> {
  const key = env.TYPESAFE_API_KEY;
  if (!key) return json(503, { error: 'TYPESAFE_API_KEY is not set on the server' });
  if (raw.length > MAX_BODY) return json(413, { error: 'Request too large' });
  let state: unknown;
  try {
    state = (JSON.parse(raw) as { state?: unknown }).state;
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }
  if (!state || typeof state !== 'object') return json(400, { error: 'Missing state' });

  const payload = JSON.stringify({ model: env.JEV_MODEL || 'jev-1.13.0', state, questions });
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
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request): Promise<Response> {
  return forwardToJev(await request.text());
}
