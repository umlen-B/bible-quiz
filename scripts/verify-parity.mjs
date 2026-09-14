// Proves the split data modules reproduce the original mock papers exactly.
import { BANK } from "./_data-source.mjs";
import { split } from "../src/lib/rng.js";
import { GROUPS } from "./_groups.mjs";

// ---- original construction, copied from the single-file build ----
const ALL = [];
BANK.forEach((c) => c.qs.forEach((q, i) => ALL.push({ ...q, ch: c.ch, id: c.ch * 1000 + i })));
const ORIGINAL = {
  "mock-1-to-8":  split(ALL.filter((q) => q.ch <= 8), 85, 771103),
  "mock-9-to-16": split(ALL.filter((q) => q.ch >= 9), 85, 445209),
  "mock-full":    split(ALL, 100, 20260913),
};

// ---- new construction, from the generated per-chapter modules ----
async function loadPool(chapters) {
  const pool = [];
  for (const ch of chapters) {
    const c = (await import(`../src/data/chapters/ch-${ch}.js`)).default;
    c.qs.forEach((q, i) => pool.push({ ...q, ch: c.ch, id: c.ch * 1000 + i }));
  }
  return pool;
}

let fail = 0, checked = 0;
for (const g of GROUPS) {
  const pool = await loadPool(g.chapters);
  const sets = split(pool, g.size, g.seed);
  for (let i = 0; i < g.papers; i++) {
    const a = ORIGINAL[g.slug][i].map((q) => q.id).join(",");
    const b = sets[i].map((q) => q.id).join(",");
    const ok = a === b;
    checked++;
    if (!ok) fail++;
    console.log(`${ok ? "OK  " : "FAIL"}  ${g.slug}-${i + 1}  (${sets[i].length} questions)`);
  }
}
// also verify every chapter module round-trips its questions untouched
for (const c of BANK) {
  const m = (await import(`../src/data/chapters/ch-${c.ch}.js`)).default;
  const ok = JSON.stringify(m.qs) === JSON.stringify(c.qs) && m.title === c.title;
  checked++;
  if (!ok) { fail++; console.log(`FAIL  chapter ${c.ch} content mismatch`); }
}
console.log("-".repeat(46));
console.log(fail === 0
  ? `All ${checked} checks passed — papers and chapters identical.`
  : `${fail} of ${checked} checks FAILED.`);
process.exit(fail === 0 ? 0 : 1);
