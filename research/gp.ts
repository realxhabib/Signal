// Round 7 · Genetic programming: evolve our own formulas. Random expression trees over shape/context inputs are
// bred (crossover, mutation, tournament selection) to predict each coin's next-24h move relative to the other
// coins. Fitness = information ratio of the daily cross-sectional correlation on the training years, minus a
// size penalty. Two purged walk-forward folds; the top formulas are then traded, unseen, on the following years.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildSamples, H, weightsFromScores, type Sample } from './ml-features';
import { HEADER, hold, panel, report, simulate } from './sleeve-lib';

const DAY = 86_400;
let seed = Number(process.env.SEED ?? 7);
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];

type Node = { op: string; kids: Node[] } | { v: number } | { x: number };
const BIN = ['+', '-', '*', '/', 'max', 'min'];
const UN = ['neg', 'abs', 'tanh', 'sign'];

function grow(depth: number, nX: number): Node {
  if (depth <= 1 || (depth < 4 && rnd() < 0.3)) return rnd() < 0.85 ? { x: Math.floor(rnd() * nX) } : { v: +(rnd() * 4 - 2).toFixed(2) };
  if (rnd() < 0.25) return { op: pick(UN), kids: [grow(depth - 1, nX)] };
  return { op: pick(BIN), kids: [grow(depth - 1, nX), grow(depth - 1, nX)] };
}
const size = (n: Node): number => ('op' in n ? 1 + n.kids.reduce((a, k) => a + size(k), 0) : 1);
const depthOf = (n: Node): number => ('op' in n ? 1 + Math.max(...n.kids.map(depthOf)) : 1);
function js(n: Node): string {
  if ('x' in n) return `x[${n.x}]`;
  if ('v' in n) return `(${n.v})`;
  const [a, b] = n.kids.map(js);
  switch (n.op) {
    case '+': return `(${a}+${b})`;
    case '-': return `(${a}-${b})`;
    case '*': return `(${a}*${b})`;
    case '/': return `(Math.abs(${b})<1e-6?0:${a}/${b})`;
    case 'max': return `Math.max(${a},${b})`;
    case 'min': return `Math.min(${a},${b})`;
    case 'neg': return `(-${a})`;
    case 'abs': return `Math.abs(${a})`;
    case 'tanh': return `Math.tanh(${a})`;
    default: return `Math.sign(${a})`;
  }
}
function show(n: Node, names: string[]): string {
  if ('x' in n) return names[n.x];
  if ('v' in n) return String(n.v);
  const k = n.kids.map((c) => show(c, names));
  return n.kids.length === 1 ? `${n.op}(${k[0]})` : ['max', 'min'].includes(n.op) ? `${n.op}(${k[0]}, ${k[1]})` : `(${k[0]} ${n.op} ${k[1]})`;
}
const compile = (n: Node) => new Function('x', `return ${js(n)};`) as (x: number[]) => number;
const clone = (n: Node): Node => JSON.parse(JSON.stringify(n));
function nodes(n: Node, out: Node[] = []): Node[] {
  out.push(n);
  if ('op' in n) n.kids.forEach((k) => nodes(k, out));
  return out;
}
function replaceRandom(root: Node, sub: Node): Node {
  const r = clone(root);
  const all = nodes(r);
  const target = pick(all);
  if (target === r) return sub;
  for (const n of all) if ('op' in n) n.kids = n.kids.map((k) => (k === target ? sub : k));
  return r;
}

/** Daily cross-sectional correlations between a formula and the target; returns IR (mean / std · √days). */
function fitnessOf(f: (x: number[]) => number, byDate: Sample[][]) {
  const ics: number[] = [];
  for (const rows of byDate) {
    const p = rows.map((r) => f(r.x));
    if (p.some((v) => !Number.isFinite(v))) return { ir: -9, ic: 0 };
    const mp = p.reduce((a, v) => a + v, 0) / p.length;
    const my = rows.reduce((a, r) => a + r.y, 0) / rows.length;
    let c = 0, vp = 0, vy = 0;
    for (let i = 0; i < rows.length; i++) {
      c += (p[i] - mp) * (rows[i].y - my);
      vp += (p[i] - mp) ** 2;
      vy += (rows[i].y - my) ** 2;
    }
    ics.push(vp > 1e-12 ? c / Math.sqrt(vp * vy) : 0);
  }
  const m = ics.reduce((a, v) => a + v, 0) / ics.length;
  const s = Math.sqrt(ics.reduce((a, v) => a + (v - m) ** 2, 0) / ics.length) || 1;
  return { ir: (m / s) * Math.sqrt(ics.length), ic: m };
}

function evolve(train: Sample[][], nX: number, pop = 300, gens = 25) {
  type Ind = { tree: Node; fit: number; ic: number };
  const score = (tree: Node): Ind => {
    if (depthOf(tree) > 6) return { tree, fit: -99, ic: 0 };
    const { ir, ic } = fitnessOf(compile(tree), train);
    return { tree, fit: ir - 0.15 * size(tree), ic };
  };
  let P: Ind[] = Array.from({ length: pop }, () => score(grow(2 + Math.floor(rnd() * 3), nX)));
  const tourney = () => {
    let best = pick(P);
    for (let i = 0; i < 4; i++) {
      const c = pick(P);
      if (c.fit > best.fit) best = c;
    }
    return best;
  };
  for (let g = 0; g < gens; g++) {
    P.sort((a, b) => b.fit - a.fit);
    const next: Ind[] = P.slice(0, 10);
    while (next.length < pop) {
      const r = rnd();
      if (r < 0.7) {
        const a = tourney().tree;
        const b = tourney().tree;
        next.push(score(replaceRandom(a, clone(pick(nodes(b))))));
      } else if (r < 0.9) next.push(score(replaceRandom(tourney().tree, grow(3, nX))));
      else next.push(score(grow(2 + Math.floor(rnd() * 3), nX)));
    }
    P = next;
  }
  P.sort((a, b) => b.fit - a.fit);
  // Top distinct formulas.
  const seen = new Set<string>();
  return P.filter((i) => {
    const k = js(i.tree);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 5);
}

const p = await panel('4h');
const { samples, names } = buildSamples(p, 24, 2, 1);
const byDate = (xs: Sample[]) => {
  const m = new Map<number, Sample[]>();
  for (const x of xs) m.set(x.t, [...(m.get(x.t) ?? []), x]);
  return [...m.values()].filter((r) => r.length >= 5);
};
const folds = [
  { trainEnd: Date.UTC(2022, 0, 1) / 1000, testEnd: Date.UTC(2023, 8, 24) / 1000 },
  { trainEnd: Date.UTC(2023, 8, 24) / 1000, testEnd: Date.UTC(2025, 8, 24) / 1000 },
];
const lines = [`# Round 7 · Genetic programming (seed ${process.env.SEED ?? 7})\n`, 'Formulas evolved on the training years only (daily samples), then traded market-neutral on the next years they never saw.\n'];
const scored: { t: number; s: number; score: number }[] = [];
for (const f of folds) {
  const purge = f.trainEnd - H * 14_400 - DAY;
  const train = byDate(samples.filter((x) => p.times[x.t] < purge && x.t % 6 === 0 && p.times[x.t] >= Date.UTC(2018, 0, 1) / 1000));
  const best = evolve(train, names.length);
  lines.push(`\n## Trained to ${new Date(f.trainEnd * 1000).toISOString().slice(0, 10)}\n`, '| Formula | Training IC | Training IR |', '|---|---|---|');
  for (const b of best) lines.push(`| \`${show(b.tree, names)}\` | ${b.ic.toFixed(3)} | ${(b.fit + 0.15 * size(b.tree)).toFixed(1)} |`);
  console.log(lines.slice(-best.length).join('\n'));
  const fns = best.map((b) => compile(b.tree));
  const test = samples.filter((x) => p.times[x.t] >= f.trainEnd && p.times[x.t] < f.testEnd);
  // Ensemble: average of each formula's cross-sectional z-score.
  for (const rows of byDate(test)) {
    const zs = fns.map((fn) => {
      const v = rows.map((r) => fn(r.x));
      const m = v.reduce((a, x) => a + x, 0) / v.length;
      const s = Math.sqrt(v.reduce((a, x) => a + (x - m) ** 2, 0) / v.length) || 1;
      return v.map((x) => (x - m) / s);
    });
    rows.forEach((r, i) => scored.push({ t: r.t, s: r.s, score: zs.reduce((a, z) => a + z[i], 0) / zs.length }));
  }
  // Out-of-sample IC of the ensemble in this fold.
  const test2 = byDate(test);
  const ens = (x: number[]) => fns.reduce((a, fn) => a + fn(x), 0);
  lines.push(`\nUnseen-years IC of the top formula: ${fitnessOf(fns[0], test2).ic.toFixed(3)}, ensemble sum: ${fitnessOf(ens, test2).ic.toFixed(3)}.`);
  console.log(lines[lines.length - 1]);
}
lines.push('\n## Traded on the unseen years (Jan 2022 → Sep 2025)\n', HEADER);
for (const [holdBars, fee] of [[6, 0.0005], [18, 0.0002]] as const) {
  const w = weightsFromScores(p, scored).map((x) => hold(x, holdBars));
  const r = simulate(p, w, fee, `GP formulas (seed ${process.env.SEED ?? 7}), hold ${holdBars} bars, fee ${fee * 100}%`, Date.UTC(2022, 0, 1) / 1000);
  lines.push(await report(r));
  console.log(lines[lines.length - 1]);
}
writeFileSync(join(import.meta.dirname, `RESULTS-round7-gp-${process.env.SEED ?? 7}.md`), lines.join('\n') + '\n');
