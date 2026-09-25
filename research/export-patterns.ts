// Train the shipped pattern library on all history (same rules as the walk-forward in research/patterns.ts:
// 24-bar shapes, 32 patterns) and write src/patternModel.json for the app and the alert server.
// Re-run every ~6 months (the walk-forward re-learned twice a year).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { kmeans, scoreClusters } from './kmeans';
import { buildSamples } from './ml-features';
import { panel } from './sleeve-lib';

const K = 32;
const p = await panel('4h');
const { samples, names } = buildSamples(p, 24, 2, 1);
const d = names.length;
const mu = Array.from({ length: d }, (_, j) => samples.reduce((a, x) => a + x.x[j], 0) / samples.length);
const sd = Array.from({ length: d }, (_, j) => Math.sqrt(samples.reduce((a, x) => a + (x.x[j] - mu[j]) ** 2, 0) / samples.length) || 1);
const z = (x: number[]) => x.map((v, j) => (v - mu[j]) / sd[j]);
const sub = samples.filter((_, i) => i % Math.max(1, Math.floor(samples.length / 40_000)) === 0);
const km = kmeans(sub.map((x) => z(x.x)), K);
const scores = scoreClusters(samples.map((x) => ({ c: km.nearest(z(x.x)), y: x.y })), K);
const last = p.times[samples[samples.length - 1].t];
const model = {
  trainedThrough: new Date(last * 1000).toISOString().slice(0, 10),
  samples: samples.length,
  features: names,
  mu: mu.map((v) => +v.toFixed(6)),
  sd: sd.map((v) => +v.toFixed(6)),
  centroids: km.C.map((c) => c.map((v) => +v.toFixed(5))),
  scores: scores.map((v) => +v.toFixed(5)),
  holdBars: 18,
};
writeFileSync(join(import.meta.dirname, '..', 'src', 'patternModel.json'), JSON.stringify(model) + '\n');
console.log('exported', K, 'patterns,', scores.filter((s) => s !== 0).length, 'with a track record, trained through', model.trainedThrough);
