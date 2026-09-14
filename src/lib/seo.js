// Per-route title, description and canonical URL.
//
// The app is client-rendered, so these are set from an effect rather than being
// in the served HTML. Crawlers that execute JavaScript pick them up; see the
// prerender note in the README for the stronger option.
import { useEffect } from "react";
import { CHAPTERS, TOTAL } from "../data/meta.js";
import { BOOK_BASE } from "./routes.js";

export const SITE = "https://bible-quiz.bhengra.co.in";
export const SITE_NAME = "Bible Quiz";

const GROUP_NAME = {
  "mock-full": "Full Mock Paper",
  "mock-1-to-8": "Mark 1–8 Mock Paper",
  "mock-9-to-16": "Mark 9–16 Mock Paper",
};

// Title and description for a paper slug, used by the quiz route and by the
// sitemap generator, so the two cannot drift apart.
export function paperSeo(slug) {
  const chapter = /^ch-(\d+)$/.exec(slug);
  if (chapter) {
    const c = CHAPTERS.find((x) => x.ch === Number(chapter[1]));
    if (!c) return null;
    return {
      title: `Mark ${c.ch}: ${c.title} — ${c.count} Quiz Questions`,
      description:
        `${c.count} multiple-choice questions on Mark chapter ${c.ch}, ${c.title.toLowerCase()}. ` +
        `Every answer shows the passage in WEB, KJV or Hindi.`,
    };
  }
  if (slug === "all") {
    return {
      title: `All ${TOTAL} Questions on the Gospel of Mark`,
      description:
        `Every question in the bank — all ${TOTAL} across the sixteen chapters of Mark, ` +
        `with the passage shown for each answer in English and Hindi.`,
    };
  }
  const mock = /^(mock-full|mock-1-to-8|mock-9-to-16)-(\d)$/.exec(slug);
  if (mock) {
    const name = GROUP_NAME[mock[1]];
    const size = mock[1] === "mock-full" ? 100 : 85;
    const scope = mock[1] === "mock-full" ? "all sixteen chapters" :
      mock[1] === "mock-1-to-8" ? "Mark chapters 1 to 8" : "Mark chapters 9 to 16";
    return {
      title: `${name} ${mock[2]} — ${size} Questions on Mark`,
      description:
        `A timed ${size}-question mock paper drawn from ${scope}. ` +
        `Mark as you go or submit at the end, then review every answer against the passage.`,
    };
  }
  return null;
}

export const ROUTE_SEO = {
  home: {
    title: `${SITE_NAME} — Practice Papers for the Gospels`,
    description:
      `Free Bible quiz practice papers with the passage attached to every answer, ` +
      `in English and Hindi. ${TOTAL} questions on the Gospel of Mark, with more books to come.`,
  },
  book: {
    title: `The Gospel of Mark — ${TOTAL} Bible Quiz Questions`,
    description:
      `${TOTAL} multiple-choice questions across all sixteen chapters of Mark, plus nine mock papers. ` +
      `Every answer shows the passage in the World English Bible, King James Version or Hindi.`,
  },
};

function tag(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) { el = create(); document.head.appendChild(el); }
  return el;
}

function setMeta(attr, key, content) {
  const el = tag(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute(attr, key);
    return m;
  });
  el.setAttribute("content", content);
}

export function useSeo({ title, description, path }) {
  useEffect(() => {
    if (!title) return;
    const full = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const url = SITE + (path || "/");

    document.title = full;
    setMeta("name", "description", description);
    setMeta("property", "og:title", full);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("name", "twitter:card", "summary");
    setMeta("name", "twitter:title", full);
    setMeta("name", "twitter:description", description);

    const link = tag('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    });
    link.setAttribute("href", url);
  }, [title, description, path]);
}

export { allPaths } from "./routes.js";
