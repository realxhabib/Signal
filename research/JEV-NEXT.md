# Next step: evaluate Jev (needs TYPESAFE_API_KEY in the session's environment)

1. Check the key is visible: `env | grep -c TYPESAFE_API_KEY` should print 1. Environment variables load when a
   session starts.
2. Estimate the calls (no Jev usage): `npx tsx research/jev-eval.ts`
   (5 major coins, 4h, from 2022: 1,846 calls).
   For a smaller first run, use `FROM=2023-06-01`, or `SYMBOLS=BTCUSDT,ETHUSDT,SOLUSDT`.
3. Run it: `CONFIRM=1 MAX_CALLS=2000 npx tsx research/jev-eval.ts`. Verdicts are cached in
   `research/.cache/jev-4h.json`, so re-runs are free. The script writes `research/RESULTS-jev.md`.
4. Decide with the round-6 protocol:
   - Jev earns a place only if trades it approves beat those it vetoes on the research years AND on the locked
     final year.
   - Then test it as a veto and as conviction-based sizing on the whole account (research/round6-lib.ts `evaluate`
     with `filter4`/`o4.sizeMult`), recording each variant with `recordTrial`.
   - Ship only what passes. The app keeps the Jev filter off by default (Advanced mode toggle).
5. Afterwards the key can be removed from the environment; the app on Vercel uses its own copy.
