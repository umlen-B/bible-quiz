// Renders every route to static HTML after the Vite build.
//
// Without this, each page arrives as an empty shell and only becomes readable
// once JavaScript has run. Google copes with that on a slower second pass;
// the crawlers behind link previews and most AI search tools do not run
// JavaScript at all and would see nothing.
//
// The client still boots normally on top and takes over from the first paint.
import { createServer } from "vite";
import React from "react";
import { renderToString } from "react-dom/server";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// react-router calls useLayoutEffect, which has no meaning server-side.
const warn = console.error;
console.error = (m, ...a) => { if (!String(m).includes("useLayoutEffect")) warn(m, ...a); };

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "warn" });

const { AppProvider } = await vite.ssrLoadModule("/src/AppContext.jsx");
const { MemoryRouter, Routes, Route } = await vite.ssrLoadModule("react-router-dom");
const { ROUTES } = await vite.ssrLoadModule("/src/routes/index.js");
const { allPaths, BOOK_BASE } = await vite.ssrLoadModule("/src/lib/routes.js");
const seo = await vite.ssrLoadModule("/src/lib/seo.js");

// Awaiting the loaders gives real components; React.lazy would only ever
// render the Suspense fallback under renderToString.
const screens = await Promise.all(ROUTES.map((r) => r.load().then((m) => m.default)));
const e = React.createElement;

function renderPath(path) {
  return renderToString(
    e(MemoryRouter, { initialEntries: [path] },
      e(AppProvider, null,
        e(Routes, null,
          ...ROUTES.map((r, i) => e(Route, { key: r.path, path: r.path, element: e(screens[i]) })))))
  );
}

// Title and description for a path, reusing exactly what the browser would set.
function metaFor(path) {
  if (path === "/") return seo.ROUTE_SEO.home;
  if (path === BOOK_BASE) return seo.ROUTE_SEO.book;
  return seo.paperSeo(path.slice(BOOK_BASE.length + 1));
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function headFor(path, meta) {
  const title = meta.title.includes(seo.SITE_NAME) ? meta.title : `${meta.title} | ${seo.SITE_NAME}`;
  const url = seo.canonicalUrl(path);
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(seo.SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(seo.OG_IMAGE)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(seo.OG_ALT)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(seo.OG_IMAGE)}" />`,
  ].map((l) => "    " + l).join("\n");
}

const template = readFileSync("dist/index.html", "utf8");
const SEO_BLOCK = /<!--seo-->[\s\S]*?<!--\/seo-->/;
const ROOT = '<div id="root"></div>';
if (!SEO_BLOCK.test(template)) throw new Error("dist/index.html has no <!--seo--> block");
if (!template.includes(ROOT)) throw new Error("dist/index.html has no empty #root");

let count = 0;
for (const path of allPaths()) {
  const meta = metaFor(path);
  if (!meta) throw new Error(`No metadata for ${path}`);

  const html = template
    .replace(SEO_BLOCK, headFor(path, meta))
    .replace(ROOT, `<div id="root">${renderPath(path)}</div>`);

  const out = path === "/" ? "dist/index.html" : join("dist", path.slice(1), "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  count++;
}

await vite.close();
console.log(`prerendered ${count} pages`);
