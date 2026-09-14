// Renders the real route modules through Vite, so import errors, bad module-scope
// references and missing strings surface without needing a browser.
import { createServer } from "vite";
import React from "react";
import { renderToString } from "react-dom/server";

// react-router calls useLayoutEffect; harmless for a client-only app.
const warn = console.error;
console.error = (m, ...a) => { if (!String(m).includes("useLayoutEffect")) warn(m, ...a); };

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "warn" });

// No DOM shims on purpose: readPref/writePref are wrapped in try/catch and fall
// back when `window` is absent, and the effects that touch document never run
// during renderToString. Defining a fake window makes react-dom take the
// browser path and blow up.

let fail = 0;
const check = (name, html, needles) => {
  const missing = needles.filter((n) => !html.includes(n));
  if (missing.length) { fail++; console.log(`FAIL  ${name} — missing: ${missing.join(" | ")}`); }
  else console.log(`OK    ${name} (${html.length.toLocaleString()} chars)`);
};

const { AppProvider } = await vite.ssrLoadModule("/src/AppContext.jsx");
const { MemoryRouter } = await vite.ssrLoadModule("react-router-dom");

const { Routes, Route } = await vite.ssrLoadModule("react-router-dom");
const { BOOK_BASE } = await vite.ssrLoadModule("/src/lib/routes.js");
const { ROUTES } = await vite.ssrLoadModule("/src/routes/index.js");

// Uses the same route table App.jsx does, so the two cannot drift.
const screens = await Promise.all(ROUTES.map((r) => r.load().then((m) => m.default)));
const e = React.createElement;

async function render(path) {
  return renderToString(
    e(MemoryRouter, { initialEntries: [path] },
      e(AppProvider, null,
        e(Routes, null,
          ...ROUTES.map((r, i) => e(Route, { key: r.path, path: r.path, element: e(screens[i]) })))))
  );
}

check("Landing  /", await render("/"),
  ["The Gospel of Mark", "559", "16", "9", "Start practising", "/new-testament/mark"]);

check("Book     /new-testament/mark", await render("/new-testament/mark"),
  ["Chapters", "Mock papers", "Full papers", "Mark 1 to 8", "Mark 9 to 16",
   "/new-testament/mark/ch-1", "/new-testament/mark/ch-16",
   "/new-testament/mark/mock-full-1", "/new-testament/mark/mock-1-to-8-1",
   "/new-testament/mark/mock-9-to-16-3", "/new-testament/mark/all"]);

check("Quiz     ch-1 (loading state)",
  await render("/new-testament/mark/ch-1"),
  ["Loading the questions", "Leave"]);

// Unknown paper must reach the not-found screen, not crash.
const bad = await render("/new-testament/mark/mock-nope-9");
check("Quiz     unknown slug", bad, ["No such paper"]);

// Content loaders run under Vite, so import.meta.glob resolves.
const content = await vite.ssrLoadModule("/src/lib/content.js");
const mock = await content.loadMock("mock-1-to-8-1");
const ch = await content.loadChapter(14);
check("loadMock mock-1-to-8-1", JSON.stringify({ n: mock.length, ok: mock.every((q) => q.ch <= 8) }),
  ['"n":85', '"ok":true']);
check("loadChapter 14", JSON.stringify({ n: ch.qs.length, t: ch.title }),
  ['"n":47', "Anointing"]);

// Every linked URL must resolve to a real paper, not the not-found screen.
const { MOCKS } = await vite.ssrLoadModule("/src/lib/content.js");
const { CHAPTERS: META } = await vite.ssrLoadModule("/src/data/meta.js");
const slugs = [
  ...META.map((c) => `ch-${c.ch}`),
  "all",
  ...MOCKS.map((m) => m.slug),
];
let routeBad = 0;
for (const slug of slugs) {
  const html = await render(`${BOOK_BASE}/${slug}`);
  if (html.includes("No such paper")) { console.log(`FAIL  route ${slug} -> not found`); routeBad++; }
}
if (routeBad) fail += routeBad;
console.log(`${routeBad ? "FAIL " : "OK   "} all ${slugs.length} paper URLs resolve`);

// And a slug that should not resolve, still does not.
for (const bad of ["ch-0", "ch-17", "ch-abc", "mock-full-4", "nonsense"]) {
  const html = await render(`${BOOK_BASE}/${bad}`);
  if (!html.includes("No such paper")) { console.log(`FAIL  ${bad} should not resolve`); fail++; }
}
console.log("OK    rejected slugs stay rejected");

// Visitors and crawlers land on the trailing-slash form, because that is what
// GitHub Pages redirects to once the page is prerendered to <path>/index.html.
let slashBad = 0;
for (const slug of ["ch-1", "ch-16", "all", "mock-full-1", "mock-9-to-16-3"]) {
  const html = await render(`${BOOK_BASE}/${slug}/`);
  if (html.includes("No such paper")) { console.log(`FAIL  trailing slash breaks ${slug}`); slashBad++; }
}
if ((await render("/new-testament/mark/")).includes("Practice papers for the Gospels")) {
  console.log("FAIL  trailing slash on the book page fell through to the landing route"); slashBad++;
}
fail += slashBad;
console.log(`${slashBad ? "FAIL " : "OK   "} trailing-slash URLs resolve to the same pages`);

// Every public URL must have a title and description for search results.
const { paperSeo, allPaths } = await vite.ssrLoadModule("/src/lib/seo.js");
const { PAPER_SLUGS } = await vite.ssrLoadModule("/src/lib/routes.js");
let seoBad = 0;
for (const slug of PAPER_SLUGS) {
  const s = paperSeo(slug);
  if (!s || !s.title || !s.description) { console.log(`FAIL  no SEO for ${slug}`); seoBad++; }
  else if (s.title.length > 65) { console.log(`WARN  title long (${s.title.length}): ${s.title}`); }
  else if (s.description.length > 160) { console.log(`WARN  description long (${s.description.length}) for ${slug}`); }
}
fail += seoBad;
console.log(`${seoBad ? "FAIL " : "OK   "} SEO title+description for all ${PAPER_SLUGS.length} papers`);
console.log(`OK    sitemap covers ${allPaths().length} URLs`);

await vite.close();
console.log("-".repeat(50));
console.log(fail === 0 ? "All smoke checks passed." : `${fail} smoke check(s) FAILED.`);
process.exit(fail ? 1 : 0);
