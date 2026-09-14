// Verifies what actually landed in dist/ after prerendering.
// Run after `npm run build`.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { allPaths, canonicalUrl } from "../src/lib/routes.js";

let fail = 0;
const bad = (m) => { console.log("FAIL  " + m); fail++; };

for (const f of ["dist/og.png", "dist/sitemap.xml", "dist/robots.txt", "dist/404.html"]) {
  if (!existsSync(f)) bad(`${f} missing`);
}

// The SPA fallback must stay an empty shell. If it ever carries prerendered
// markup, every unknown URL serves that page's content under a 404.
const notFound = readFileSync("dist/404.html", "utf8");
if (!notFound.includes('<div id="root"></div>')) {
  bad("404.html is not an empty shell — it has prerendered markup baked in");
}

const titles = new Map();
for (const path of allPaths()) {
  const file = path === "/" ? "dist/index.html" : join("dist", path.slice(1), "index.html");
  if (!existsSync(file)) { bad(`${file} was not prerendered`); continue; }
  const html = readFileSync(file, "utf8");

  const title = (/<title>(.*?)<\/title>/.exec(html) || [])[1];
  if (!title) { bad(`${path} has no <title>`); continue; }
  if (titles.has(title)) bad(`${path} shares its title with ${titles.get(title)}`);
  titles.set(title, path);

  const canonical = (/<link rel="canonical" href="(.*?)"/.exec(html) || [])[1];
  if (canonical !== canonicalUrl(path)) {
    bad(`${path} canonical is ${canonical}, expected ${canonicalUrl(path)}`);
  }
  if (html.includes('<div id="root"></div>')) bad(`${path} rendered no markup`);
  if (!/<meta property="og:image" content="[^"]+og\.png"/.test(html)) bad(`${path} has no og:image`);
}

// Sitemap must name exactly the pages that exist.
const sitemap = readFileSync("dist/sitemap.xml", "utf8");
const listed = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]).sort();
const expected = allPaths().map(canonicalUrl).sort();
if (listed.join("|") !== expected.join("|")) {
  bad(`sitemap lists ${listed.length} URLs, expected ${expected.length} matching the prerendered set`);
}

console.log(fail === 0
  ? `dist OK — ${allPaths().length} prerendered pages, unique titles, canonicals and sitemap agree`
  : `${fail} dist check(s) failed`);
process.exit(fail ? 1 : 0);
