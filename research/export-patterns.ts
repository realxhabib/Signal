// Train the shipped pattern basket on all history and write src/patternModel.json for the app and alert server:
// an ensemble of 4 pattern libraries (24-bar shapes with 32 and 64 patterns and a second seed, 48-bar shapes with
// 64 patterns) over 33 coins, same rules as the walk-forward (research/pattern-lib.ts). Re-run every ~6 months.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { kmeans, scoreClusters } from './kmeans';
import { buildSamples } from './ml-features';
import { panel } from './sleeve-lib';
import { EXTRA, UNIVERSE } from './universe';

const MEMBERS: [number, number, number][] = [[24, 32, 1], [24, 64, 1], [24, 32, 2], [48, 64, 1]];
const coins = [...UNIVERSE, ...EXTRA];
const p = await panel('4h', coins);
const members = [];
let trainedThrough = 0;
for (const [L, K, seed] of MEMBERS) {
  const step = L >= 24 ? L / 12 : 1;
  const { samples, names } = buildSamples(p, L, step, 1);
  const d = names.length;
  const mu = Array.from({ length: d }, (_, j) => samples.reduce((a, x) => a + x.x[j], 0) / samples.length);
  const sd = Array.from({ length: d }, (_, j) => Math.sqrt(samples.reduce((a, x) => a + (x.x[j] - mu[j]) ** 2, 0) / samples.length) || 1);
  const z = (x: number[]) => x.map((v, j) => (v - mu[j]) / sd[j]);
  const sub = samples.filter((_, i) => i % Math.max(1, Math.floor(samples.length / 40_000)) === 0);
  const km = kmeans(sub.map((x) => z(x.x)), K, 25, seed);
  const scores = scoreClusters(samples.map((x) => ({ c: km.nearest(z(x.x)), y: x.y })), K);
  trainedThrough = Math.max(trainedThrough, p.times[samples[samples.length - 1].t]);
  members.push({ L, step, K, seed, mu: mu.map((v) => +v.toFixed(6)), sd: sd.map((v) => +v.toFixed(6)), centroids: km.C.map((c) => c.map((v) => +v.toFixed(5))), scores: scores.map((v) => +v.toFixed(5)) });
  console.log(`member ${L}x${K} seed ${seed}: ${scores.filter((s) => s !== 0).length}/${K} patterns with a track record`);
}
const model = { trainedThrough: new Date(trainedThrough * 1000).toISOString().slice(0, 10), coins, holdBars: 18, members };
writeFileSync(join(import.meta.dirname, '..', 'src', 'patternModel.json'), JSON.stringify(model) + '\n');
console.log('exported', members.length, 'libraries over', coins.length, 'coins, trained through', model.trainedThrough);
