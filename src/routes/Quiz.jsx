// Quiz and results. The URL decides which questions to fetch; nothing is
// loaded until this route is reached.
import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useApp } from "../AppContext.jsx";
import { Controls, Footer } from "../components/ui.jsx";
import { Scripture } from "../components/Scripture.jsx";
import { prepare, qText, oText, eText, clock } from "../lib/quiz.js";
import { loadChapter, loadPool, loadMock, findMock } from "../lib/content.js";
import { CHAPTERS, TOTAL } from "../data/meta.js";
import { CH_HI } from "../i18n/strings.js";
import { paths, BOOK_BASE } from "../lib/routes.js";
import { useSeo, paperSeo } from "../lib/seo.js";
import { track } from "../lib/analytics.js";

// Turns the URL slug into the questions to ask and a name for the paper.
// Recognised slugs: ch-1 … ch-16, all, mock-full-N, mock-1-to-8-N, mock-9-to-16-N.
function resolve(slug, t, lang) {
  if (!slug) return null;

  const chapter = /^ch-(\d+)$/.exec(slug);
  if (chapter) {
    const ch = Number(chapter[1]);
    if (!CHAPTERS.some((c) => c.ch === ch)) return null;
    const c = CHAPTERS.find((x) => x.ch === ch);
    return {
      key: slug,
      label: `${t.chapter} ${ch}`,
      // Titles and counts come from the eager metadata, so they are on screen
      // (and in the prerendered HTML) before the questions have been fetched.
      blurb: `${lang === "hi" ? CH_HI[ch - 1] : c.title} · ${t.qCount(c.count)}`,
      load: () => loadChapter(ch).then((x) => x.qs.map((q) => ({ ...q, ch }))),
    };
  }

  if (slug === "all") {
    return {
      key: slug,
      label: t.everything,
      blurb: t.qCount(TOTAL),
      load: () => loadPool(CHAPTERS.map((c) => c.ch)),
    };
  }

  const m = findMock(slug);
  if (!m) return null;
  return {
    key: m.slug,
    label: (m.group === "g1" ? t.fullP : t[m.group + "p"]) + " " + m.paper,
    blurb: `${t[m.group + "n"]} · ${t.qCount(m.size)}`,
    load: () => loadMock(m.slug),
  };
}

export default function Quiz() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme, lang, setLanguage, tr, setTr, mode, th, t } = useApp();

  const target = useMemo(() => resolve(slug, t, lang), [slug, t, lang]);

  const seo = paperSeo(slug);
  useSeo({
    title: seo ? seo.title : t.notFound,
    description: seo ? seo.description : t.notFoundBody,
    path: `${BOOK_BASE}/${slug}`,
  });

  const [deck, setDeck] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("loading");
  const [confirming, setConfirming] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [filter, setFilter] = useState("missed");
  const [seconds, setSeconds] = useState(0);
  const [isRetry, setIsRetry] = useState(false);

  const routeKey = target ? target.key : null;

  useEffect(() => {
    if (!target) return;
    let live = true;
    setPhase("loading");
    target.load().then(
      (list) => {
        if (!live) return;
        begin(list, false);
        track("quiz_start", { paper: target.key, questions: list.length });
      },
      () => { if (live) setPhase("error"); }
    );
    return () => { live = false; };
    // Reloading is keyed on the paper, not on the label, so switching language
    // mid-quiz relabels the screen without throwing away the attempt.
  }, [routeKey]);

  function begin(list, retry) {
    const d = prepare(list, Date.now() % 100000);
    setDeck(d);
    setAnswers(new Array(d.length).fill(null));
    setIdx(0);
    setConfirming(false);
    setShowGrid(false);
    setSeconds(0);
    setIsRetry(retry);
    setPhase("playing");
  }

  const total = deck.length;
  const q = deck[idx];
  const answered = answers.filter((a) => a !== null).length;
  const revealed = mode === "instant" && answers[idx] !== null;
  const score = useMemo(
    () => deck.reduce((n, d, i) => n + (answers[i] === d.ans ? 1 : 0), 0),
    [deck, answers]
  );

  useEffect(() => {
    if (phase !== "playing") return;
    const iv = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => { window.scrollTo(0, 0); }, [idx, phase]);

  function choose(i) {
    if (revealed) return;
    const next = answers.slice();
    next[idx] = i;
    setAnswers(next);
  }

  function go(n) {
    setIdx(Math.max(0, Math.min(total - 1, n)));
    setShowGrid(false);
  }

  function submit() {
    setConfirming(false);
    setFilter("missed");
    setPhase("done");
    track("quiz_complete", {
      paper: routeKey, score, total, seconds, blank: total - answered,
    });
  }

  // An unresolvable URL is known at render time, so it never flashes a loading
  // state on its way to the not-found screen.
  const stage = target ? phase : "error";
  const label = target ? (isRetry ? t.retryLabel + target.label : target.label) : "";
  const primary = "w-full rounded-lg py-3 font-medium focus:outline-none focus:ring-2 " + th.accBg + " " + th.accFg + " " + th.ring;
  const outline = "w-full rounded-lg py-3 border focus:outline-none focus:ring-2 " + th.line2 + " " + th.dim + " " + th.ring;
  const ctrl = <Controls theme={theme} setTheme={setTheme} lang={lang} setLanguage={setLanguage} th={th} t={t} />;
  const shell = (inner) => (
    <div className={"min-h-screen px-5 py-6 " + th.page}>
      <div className="max-w-2xl mx-auto">{inner}</div>
    </div>
  );

  if (stage === "error") {
    return shell(
      <>
        <div className="flex items-center justify-between mb-8">
          <Link to={paths.book} className={"text-sm rounded focus:outline-none focus:ring-2 " + th.dim2 + " " + th.ring}>
            ← {t.backHome}
          </Link>
          {ctrl}
        </div>
        <h1 className="font-serif text-3xl mb-3">{t.notFound}</h1>
        <p className={"text-sm mb-8 leading-relaxed " + th.dim}>{t.notFoundBody}</p>
        <Link to={paths.book} className={primary + " block text-center"}>{t.backHome}</Link>
        <Footer th={th} />
      </>
    );
  }

  if (stage === "loading" || !q) {
    return shell(
      <>
        <div className="flex items-center justify-between mb-8">
          <Link to={paths.book} className={"text-sm rounded focus:outline-none focus:ring-2 " + th.dim2 + " " + th.ring}>
            ← {t.leave}
          </Link>
          {ctrl}
        </div>
        {/* Naming the paper while it loads beats three anonymous bars, and it
            gives the prerendered HTML a real heading for this URL. */}
        <h1 className="font-serif text-3xl leading-tight mb-1">{label}</h1>
        <p className={"text-sm mb-6 " + th.dim}>{target.blurb}</p>
        <div className="space-y-3" aria-live="polite" aria-busy="true">
          <div className={"h-8 w-full rounded animate-pulse " + th.track} />
          <div className={"h-8 w-5/6 rounded animate-pulse " + th.track} />
        </div>
        <p className={"text-xs mt-4 " + th.dim3}>{t.loading}</p>
      </>
    );
  }

  // ---------- results ----------
  if (stage === "done") {
    const pct = total ? Math.round((score / total) * 100) : 0;
    const missed = deck.map((d, i) => i).filter((i) => answers[i] !== deck[i].ans);
    const byCh = {};
    deck.forEach((d, i) => {
      byCh[d.ch] = byCh[d.ch] || { t: 0, c: 0 };
      byCh[d.ch].t++;
      if (answers[i] === d.ans) byCh[d.ch].c++;
    });
    const chapters = Object.entries(byCh).sort((a, b) => Number(a[0]) - Number(b[0]));
    const shown = filter === "missed" ? missed : deck.map((d, i) => i);

    return shell(
      <>
        <div className="flex items-center justify-between mb-8">
          <span className={"text-sm " + th.dim2}>{label}</span>
          {ctrl}
        </div>

        <h1 className="font-serif text-4xl mb-1">
          {score}<span className={th.dim3}> / {total}</span>
        </h1>
        <p className={"text-sm mb-5 " + th.dim}>
          {pct}% · {clock(seconds)} {t.taken}
          {answered < total ? " · " + t.blankLeft(total - answered) : ""}
        </p>
        <div className={"h-2 rounded-full overflow-hidden mb-9 " + th.track}>
          <div className={"h-full " + th.accBg} style={{ width: pct + "%" }} />
        </div>

        <h2 className="font-serif text-lg mb-3">{t.byChapter}</h2>
        <div className="space-y-2 mb-9">
          {chapters.map(([ch, v]) => {
            const p = Math.round((v.c / v.t) * 100);
            return (
              <div key={ch} className="flex items-center gap-3">
                <span className={"text-xs w-20 shrink-0 " + th.dim}>{t.chapter} {ch}</span>
                <div className={"flex-1 h-2 rounded-full overflow-hidden " + th.track}>
                  <div className={"h-full " + (p >= 80 ? th.barOk : p >= 50 ? th.barMid : th.barBad)}
                    style={{ width: p + "%" }} />
                </div>
                <span className={"text-xs w-12 text-right shrink-0 " + th.dim2}>{v.c}/{v.t}</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 mb-10">
          {missed.length > 0 && (
            <button
              onClick={() =>
                begin(
                  missed.map((i) => ({
                    q: deck[i].q, o: deck[i].o, a: deck[i].a, x: deck[i].x, hi: deck[i].hi,
                    r: deck[i].r, e: deck[i].e, ch: deck[i].ch,
                  })),
                  true
                )
              }
              className={primary}
            >
              {t.retry(missed.length)}
            </button>
          )}
          <button onClick={() => navigate(paths.book)} className={outline}>{t.backHome}</button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg">{t.answerPaper}</h2>
          <div className="flex gap-1">
            {[{ v: "missed", l: t.wrongOnly }, { v: "all", l: t.all }].map((f) => (
              <button
                key={f.v}
                onClick={() => setFilter(f.v)}
                className={
                  "text-xs px-3 py-1 rounded-full focus:outline-none focus:ring-2 " + th.ring + " " +
                  (filter === f.v ? th.pill : th.dim2)
                }
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className={"text-sm " + th.okT}>{t.perfect}</p>
        ) : (
          <div className="space-y-7">
            {shown.map((i) => {
              const d = deck[i];
              const ok = answers[i] === d.ans;
              return (
                <div key={i}>
                  <div className={"border-l-2 pl-4 mb-3 " + (ok ? th.okB : th.noB)}>
                    <p className={"text-xs mb-1 " + th.dim3}>
                      {t.question} {i + 1} · <span className={th.acc}>{d.r}</span>
                    </p>
                    <p className="font-serif text-base leading-snug mb-2">{qText(d, lang)}</p>
                    {!ok && (
                      <p className={"text-sm mb-1 " + th.noT}>
                        {t.youPut} {answers[i] === null ? t.nothing : oText(d, answers[i], lang)}
                      </p>
                    )}
                    <p className={"text-sm " + th.okT}>{oText(d, d.ans, lang)}</p>
                  </div>
                  <Scripture refStr={d.r} note={eText(d, lang)} xref={d.x} tr={tr} setTr={setTr} th={th} t={t} lang={lang} />
                </div>
              );
            })}
          </div>
        )}
        <Footer th={th} />
      </>
    );
  }

  // ---------- quiz ----------
  return shell(
    <>
      <div className="flex items-center justify-between mb-4">
        <Link to={paths.book} className={"text-sm rounded focus:outline-none focus:ring-2 " + th.dim2 + " " + th.ring}>
          ← {t.leave}
        </Link>
        {ctrl}
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <span className={"text-sm " + th.dim}>{label}</span>
        <span className={"text-sm tabular-nums " + th.dim2}>{clock(seconds)}</span>
      </div>

      <div className={"h-1 rounded-full overflow-hidden mb-3 " + th.track}>
        <div className={"h-full transition-all duration-300 " + th.accBg}
          style={{ width: (answered / total) * 100 + "%" }} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className={"text-xs " + th.dim2}>
          {t.qOf(idx + 1, total)} · {t.answeredN(answered)}
        </span>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={"text-xs rounded focus:outline-none focus:ring-2 " + th.acc + " " + th.ring}
        >
          {showGrid ? t.hideList : t.jump}
        </button>
      </div>

      {showGrid && (
        <div className="grid grid-cols-10 gap-1 mb-6">
          {deck.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={
                "aspect-square rounded text-xs border focus:outline-none focus:ring-2 " + th.ring + " " +
                (i === idx
                  ? th.accBg + " " + th.accFg + " border-transparent"
                  : answers[i] !== null
                  ? th.pill + " border-transparent"
                  : th.idle)
              }
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-baseline gap-2 mb-2">
        <span className={"text-xs " + th.acc}>{q.r}</span>
        <span className={"text-xs " + th.dim3}>{t.refHint}</span>
      </div>
      <h2 className="font-serif text-2xl leading-snug mb-7">{qText(q, lang)}</h2>

      <div className="space-y-2 mb-6">
        {q.opts.map((o, i) => {
          let cls;
          if (revealed) {
            if (i === q.ans) cls = th.okB + " " + th.okBg + " " + th.okFg;
            else if (i === answers[idx]) cls = th.noB + " " + th.noBg + " " + th.noFg;
            else cls = th.line + " " + th.card + " " + th.dim2;
          } else if (answers[idx] === i) {
            cls = "border-transparent " + th.soft + " " + th.softFg;
          } else {
            cls = th.line + " " + th.card + " " + th.hover;
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              className={"w-full text-left border rounded-lg px-4 py-3 leading-snug focus:outline-none focus:ring-2 " + th.ring + " " + cls}
            >
              {oText(q, i, lang)}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mb-6">
          <Scripture refStr={q.r} note={eText(q, lang)} xref={q.x} tr={tr} setTr={setTr} th={th} t={t} lang={lang} />
        </div>
      )}

      {answers[idx] === null && mode === "exam" && (
        <p className={"text-xs mb-4 " + th.dim3}>{t.comeBack}</p>
      )}

      <div>
        <div className="flex gap-2">
          <button
            onClick={() => go(idx - 1)}
            disabled={idx === 0}
            className={
              "flex-1 rounded-lg py-3 border focus:outline-none focus:ring-2 " + th.ring + " " +
              (idx === 0 ? th.line + " " + th.off : th.line2 + " " + th.dim)
            }
          >
            {t.prev}
          </button>
          <button
            onClick={() => go(idx + 1)}
            disabled={idx === total - 1}
            className={
              "flex-1 rounded-lg py-3 font-medium border border-transparent focus:outline-none focus:ring-2 " + th.ring + " " +
              (idx === total - 1 ? th.card + " " + th.off : th.soft + " " + th.softFg)
            }
          >
            {t.next}
          </button>
        </div>
        <button onClick={() => (answered < total ? setConfirming(true) : submit())} className={primary + " mt-7"}>
          {t.submit}
        </button>
      </div>

      {confirming && (
        <div className={"fixed inset-0 flex items-center justify-center px-6 z-10 " + th.overlay}>
          <div className={"border rounded-xl p-6 max-w-sm w-full " + th.card + " " + th.line2}>
            <h3 className="font-serif text-xl mb-2">{t.blankTitle(total - answered)}</h3>
            <p className={"text-sm mb-6 leading-relaxed " + th.dim}>{t.blankBody}</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const first = answers.findIndex((a) => a === null);
                  setConfirming(false);
                  go(first);
                }}
                className={primary}
              >
                {t.goBlank}
              </button>
              <button onClick={submit} className={outline}>{t.submitAnyway}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
