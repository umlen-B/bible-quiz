// The books index. Counts come from the small metadata module, so this screen
// never pulls a question.
import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../AppContext.jsx";
import { Controls, Footer } from "../components/ui.jsx";
import { CHAPTERS, TOTAL } from "../data/meta.js";
import { MOCK_COUNT } from "../lib/content.js";
import { paths } from "../lib/routes.js";
import { useSeo, ROUTE_SEO } from "../lib/seo.js";

export default function Landing() {
  const { theme, setTheme, lang, setLanguage, th, t } = useApp();
  useSeo({ ...ROUTE_SEO.home, path: "/" });
  const primary =
    "block text-center w-full rounded-lg py-3 font-medium focus:outline-none focus:ring-2 " +
    th.accBg + " " + th.accFg + " " + th.ring;

  return (
    <div className={"min-h-screen px-5 py-6 " + th.page}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <span className={"font-serif text-lg " + th.acc}>{t.appName}</span>
          <Controls theme={theme} setTheme={setTheme} lang={lang} setLanguage={setLanguage} th={th} t={t} />
        </div>

        <h1 className="font-serif text-5xl leading-[1.1] mb-5 max-w-lg">{t.landH1}</h1>
        <p className={"text-base leading-relaxed mb-16 max-w-md " + th.dim}>{t.landSub}</p>

        <p className={"text-xs mb-3 " + th.dim2}>{t.available}</p>
        <div className={"border rounded-xl overflow-hidden mb-6 " + th.line + " " + th.hero}>
          <div className="px-6 pt-6 pb-5">
            <h2 className="font-serif text-3xl mb-3">{t.markName}</h2>
            <p className={"text-sm leading-relaxed mb-6 " + th.dim}>{t.markDesc}</p>
            <div className="flex gap-7">
              {[
                [TOTAL, t.statQ],
                [CHAPTERS.length, t.statCh],
                [MOCK_COUNT, t.statM],
              ].map((s) => (
                <div key={s[1]}>
                  <div className={"font-serif text-2xl " + th.acc}>{s[0]}</div>
                  <div className={"text-xs mt-0.5 " + th.dim2}>{s[1]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={"border-t px-6 py-4 " + th.line}>
            <Link to={paths.book} className={primary}>{t.startBtn}</Link>
          </div>
        </div>

        <p className={"text-xs leading-relaxed " + th.dim3}>{t.more}</p>
        <Footer th={th} />
      </div>
    </div>
  );
}
