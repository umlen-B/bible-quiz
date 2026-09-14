// Lazy content loading.
//
// The question bank and the three scripture translations are ~780 KB in total.
// Nothing here is bundled into the entry chunk: each route pulls only the
// chapters it needs, and scripture is fetched on the first answer reveal,
// one translation at a time.
import { split } from "./rng.js";

const chapterModules = import.meta.glob("../data/chapters/ch-*.js");
const scriptureModules = import.meta.glob("../data/scripture/*.js");

const cache = new Map();
function once(key, load) {
  if (!cache.has(key)) cache.set(key, load().catch((e) => { cache.delete(key); throw e; }));
  return cache.get(key);
}

export function loadChapter(ch) {
  return once(`ch:${ch}`, async () => {
    const mod = chapterModules[`../data/chapters/ch-${ch}.js`];
    if (!mod) throw new Error(`No such chapter: ${ch}`);
    return (await mod()).default;
  });
}

export function loadScripture(tr) {
  return once(`tr:${tr}`, async () => {
    const mod = scriptureModules[`../data/scripture/${tr}.js`];
    if (!mod) throw new Error(`No such translation: ${tr}`);
    return (await mod()).default;
  });
}

export function loadXref() {
  return once("xref", () => import("../data/xref.js"));
}

// Rebuilds the flat question pool in the exact order the original single-file
// build used, so the seeded mock papers below come out identical.
export async function loadPool(chapters) {
  const loaded = await Promise.all(chapters.map(loadChapter));
  const pool = [];
  loaded.forEach((c) => c.qs.forEach((q, i) => pool.push({ ...q, ch: c.ch, id: c.ch * 1000 + i })));
  return pool;
}

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// Three groups of three papers. Sizes and seeds must not change: they are what
// makes a given paper reproducible.
export const GROUPS = [
  { key: "g2", slug: "mock-1-to-8",  chapters: range(1, 8),  size: 85,  seed: 771103,   papers: 3 },
  { key: "g3", slug: "mock-9-to-16", chapters: range(9, 16), size: 85,  seed: 445209,   papers: 3 },
  { key: "g1", slug: "mock-full",    chapters: range(1, 16), size: 100, seed: 20260913, papers: 3 },
];

export const MOCK_COUNT = GROUPS.reduce((n, g) => n + g.papers, 0);

export const MOCKS = GROUPS.flatMap((g) =>
  range(1, g.papers).map((n) => ({ group: g.key, slug: `${g.slug}-${n}`, paper: n, size: g.size }))
);

export function findMock(slug) {
  const m = MOCKS.find((x) => x.slug === slug);
  if (!m) return null;
  return { ...m, config: GROUPS.find((g) => g.key === m.group) };
}

export async function loadMock(slug) {
  const m = findMock(slug);
  if (!m) throw new Error(`No such paper: ${slug}`);
  const pool = await loadPool(m.config.chapters);
  return split(pool, m.config.size, m.config.seed)[m.paper - 1];
}
