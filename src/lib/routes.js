import { CHAPTERS } from "../data/meta.js";

// One place that knows the URL shape, so the book can be re-homed later
// without hunting through components.
export const BOOK_BASE = "/new-testament/mark";

export const paths = {
  home: "/",
  book: BOOK_BASE,
  chapter: (n) => `${BOOK_BASE}/ch-${n}`,
  mock: (slug) => `${BOOK_BASE}/${slug}`,
  all: `${BOOK_BASE}/all`,
};

export const PAPER_SLUGS = [
  ...CHAPTERS.map((c) => `ch-${c.ch}`),
  "all",
  ...["mock-full", "mock-1-to-8", "mock-9-to-16"].flatMap((g) => [1, 2, 3].map((n) => `${g}-${n}`)),
];

// Every public URL, for the sitemap and for prerendering.
export function allPaths() {
  return ["/", BOOK_BASE, ...PAPER_SLUGS.map((s) => `${BOOK_BASE}/${s}`)];
}

export const SITE = "https://bible-quiz.bhengra.co.in";

// Prerendering writes <path>/index.html, and GitHub Pages redirects the
// slashless form to the trailing-slash one. Canonical links and the sitemap
// therefore both name the trailing-slash URL — the one actually served.
export function canonicalUrl(path) {
  return SITE + (path === "/" ? "/" : path + "/");
}
