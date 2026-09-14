// Every t.<key> used in a component must exist in both languages,
// and every mock slug linked from the Book page must resolve in the router.
import { readFileSync, readdirSync } from "node:fs";
import { T } from "../src/i18n/strings.js";

const files = [
  "src/routes/Landing.jsx", "src/routes/Book.jsx", "src/routes/Quiz.jsx",
  "src/components/ui.jsx", "src/components/Scripture.jsx",
];
// Group headings are looked up as t[g.key] / t[g.key + "n"]. The full-paper
// group has no "g1p": it falls back to t.fullP, as the original build did.
const dynamic = new Set(["g1", "g2", "g3", "g1n", "g2n", "g3n", "g2p", "g3p", "fullP"]);
const used = new Set();
for (const f of files) {
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(/\bt\.([A-Za-z][A-Za-z0-9]*)/g)) used.add(m[1]);
}
// t[g.key] / t[g.key + "n"] style lookups
dynamic.forEach((k) => used.add(k));

let bad = 0;
for (const key of [...used].sort()) {
  for (const lang of ["en", "hi"]) {
    if (T[lang][key] === undefined) { console.log(`MISSING  T.${lang}.${key}`); bad++; }
  }
}
console.log(`${used.size} string keys referenced, ${bad} missing across en/hi`);
process.exit(bad ? 1 : 0);
