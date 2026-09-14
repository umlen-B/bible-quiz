// Chapter and mock-paper index for Mark. Renders from metadata alone; the
// questions for a paper are fetched when its link is followed.
import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../AppContext.jsx";
import { Controls, Footer } from "../components/ui.jsx";
import { CHAPTERS, TOTAL } from "../data/meta.js";
import { GROUPS } from "../lib/content.js";
import { CH_HI } from "../i18n/strings.js";
import { paths, BOOK_BASE } from "../lib/routes.js";
import { useSeo, ROUTE_SEO } from "../lib/seo.js";

export default function Book() {
  const { theme, setTheme, lang, setLanguage, mode, setMode, th, t } = useApp();
  useSeo({ ...ROUTE_SEO.book, path: BOOK_BASE });
  const primary =
    "block text-center w-full rounded-lg py-3 font-medium focus:outline-none focus:ring-2 " +
    th.accBg + " " + th.accFg + " " + th.ring;

  return (
    <div className={"min-h-screen px-5 py-6 " + th.page}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to={paths.home} className={"text-sm rounded focus:outline-none focus:ring-2 " + th.dim2 + " " + th.ring}>
            ← {t.allBooks}
          </Link>
          <Controls theme={theme} setTheme={setTheme} lang={lang} setLanguage={setLanguage} th={th} t={t} />
        </div>

        <h1 className="font-serif text-4xl leading-tight mb-3">{t.title}</h1>
        <p className={"text-sm leading-relaxed mb-9 max-w-md " + th.dim}>{t.intro(TOTAL)}</p>

        <div className="mb-9">
          <h2 className="font-serif text-lg mb-3">{t.howAnswer}</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "exam", title: t.examT, desc: t.examD },
              { v: "instant", title: t.instT, desc: t.instD },
            ].map((m) => (
              <button
                key={m.v}
                onClick={() => setMode(m.v)}
                className={
                  "text-left rounded-lg p-3 border focus:outline-none focus:ring-2 " + th.ring + " " +
                  (mode === m.v ? th.accBg + " " + th.accFg + " border-transparent" : th.card + " " + th.line + " " + th.dim)
                }
              >
                <div className="font-medium text-sm">{m.title}</div>
                <div className={"text-xs mt-1 leading-snug " + (mode === m.v ? "" : th.dim2)}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <h2 className="font-serif text-xl mb-1">{t.chapters}</h2>
        <p className={"text-xs mb-4 " + th.dim2}>{t.chaptersSub}</p>
        <div className="grid grid-cols-2 gap-2 mb-10">
          {CHAPTERS.map((c) => (
            <Link
              key={c.ch}
              to={paths.chapter(c.ch)}
              className={"block text-left border rounded-lg p-3 focus:outline-none focus:ring-2 " + th.card + " " + th.line + " " + th.hover + " " + th.ring}
            >
              <div className="flex items-baseline gap-2">
                <span className={"font-serif text-2xl " + th.acc}>{c.ch}</span>
                <span className={"text-xs " + th.dim2}>{t.qCount(c.count)}</span>
              </div>
              <div className={"text-sm mt-1 leading-snug " + th.dim}>
                {lang === "hi" ? CH_HI[c.ch - 1] : c.title}
              </div>
              {lang === "hi" && !c.hi && <div className={"text-xs mt-1 " + th.dim3}>{t.enOnly}</div>}
            </Link>
          ))}
        </div>

        <h2 className="font-serif text-xl mb-1">{t.mocks}</h2>
        <p className={"text-xs mb-5 " + th.dim2}>{t.mocksSub}</p>

        {GROUPS.map((g) => (
          <div key={g.key} className="mb-7">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className={"font-serif text-base " + th.acc}>{t[g.key]}</h3>
              <span className={"text-xs " + th.dim3}>{t.each(g.size)}</span>
            </div>
            <p className={"text-xs mb-3 " + th.dim2}>{t[g.key + "n"]}</p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: g.papers }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  to={paths.mock(`${g.slug}-${n}`)}
                  className={"block text-center border rounded-lg py-3 focus:outline-none focus:ring-2 " + th.card + " " + th.line + " " + th.hover + " " + th.ring}
                >
                  <div className="font-serif text-xl">{n}</div>
                  <div className={"text-xs mt-0.5 " + th.dim2}>{g.size} {t.qs}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <Link to={paths.all} className={primary + " mt-3"}>{t.practiseAll(TOTAL)}</Link>

        <div className={"mt-8 border-t pt-5 space-y-2 " + th.line}>
          <p className={"text-xs leading-relaxed " + th.dim2}>{t.note1}</p>
          <p className={"text-xs leading-relaxed " + th.dim3}>{t.note2}</p>
        </div>
        <Footer th={th} />
      </div>
    </div>
  );
}
