// Scripture panel. The translation text and the cross-reference table are both
// fetched on demand — they are the largest payloads in the app and are not
// needed until a reader reveals an answer.
import React, { useState, useEffect } from "react";
import { passage, TRLABEL } from "../lib/passage.js";
import { loadScripture, loadXref } from "../lib/content.js";
import { XN_HI } from "../i18n/strings.js";

export function useScripture(tr) {
  const [state, setState] = useState({ book: null, xref: null, tr: null });

  useEffect(() => {
    let live = true;
    Promise.all([loadScripture(tr), loadXref()]).then(([book, xref]) => {
      if (live) setState({ book, xref, tr });
    });
    return () => { live = false; };
  }, [tr]);

  return state.tr === tr ? state : { book: null, xref: null, tr: null };
}

export function Scripture({ refStr, note, xref: xrefKey, tr, setTr, th, t, lang }) {
  const [wide, setWide] = useState(false);
  const { book, xref: xrefs } = useScripture(tr);

  const switcher = (
    <div className="flex gap-1">
      {["web", "kjv", "hin"].map((k) => (
        <button
          key={k}
          onClick={() => setTr(k)}
          className={
            "text-xs px-2 py-0.5 rounded focus:outline-none focus:ring-2 " + th.ring + " " +
            (tr === k ? th.pill : th.dim2)
          }
        >
          {TRLABEL[k]}
        </button>
      ))}
    </div>
  );

  // Keep the frame and the reference visible while the translation streams in,
  // so revealing an answer never collapses the layout.
  if (!book) {
    return (
      <div className={"border rounded-lg overflow-hidden " + th.line}>
        <div className={"flex items-center justify-between px-4 py-2 " + th.card}>
          <span className={"text-sm " + th.acc}>{refStr}</span>
          {switcher}
        </div>
        <div className="px-4 py-3 space-y-2" aria-hidden="true">
          <div className={"h-4 rounded animate-pulse " + th.track} />
          <div className={"h-4 rounded animate-pulse w-5/6 " + th.track} />
        </div>
      </div>
    );
  }

  const p = passage(refStr, book, wide);
  if (!p) return null;

  const XREF = xrefs ? xrefs.XREF : {};
  const HXREF = xrefs ? xrefs.HXREF : {};
  const entry = xrefKey ? XREF[xrefKey] : null;
  const xtext = xrefKey ? (tr === "hin" ? HXREF[xrefKey] : tr === "kjv" ? entry && entry.k : entry && entry.w) : null;
  const xnote = xrefKey ? (lang === "hi" ? XN_HI[xrefKey] || (entry && entry.n) : entry && entry.n) : null;

  return (
    <div className={"border rounded-lg overflow-hidden " + th.line}>
      <div className={"flex items-center justify-between px-4 py-2 " + th.card}>
        <span className={"text-sm " + th.acc}>{refStr}</span>
        {switcher}
      </div>

      <div className="px-4 py-3 space-y-1.5">
        {p.verses.map((v) => {
          const cited = p.cited.indexOf(v.n) > -1;
          return (
            <p key={v.n}
              className={"font-serif leading-relaxed " + (cited ? "text-base " + th.verse : "text-sm " + th.verseDim)}>
              <span className={"text-xs align-super mr-1 " + th.acc}>{v.n}</span>
              {v.text}
            </p>
          );
        })}
        {p.clipped && <p className={"text-xs " + th.dim3}>{t.clipped}</p>}
        <button
          onClick={() => setWide(!wide)}
          className={"text-xs pt-1 focus:outline-none focus:ring-2 rounded " + th.acc + " " + th.ring}
        >
          {wide ? t.justCited : t.around}
        </button>
      </div>

      {(note || xrefKey) && (
        <div className={"border-t px-4 py-3 space-y-3 " + th.line + " " + th.card}>
          {note && <p className={"text-sm leading-relaxed " + th.dim}>{note}</p>}
          {xrefKey && (
            <div className={"border-l-2 pl-3 " + th.line2}>
              <p className={"text-xs mb-1 " + th.dim2}>{xrefKey} — {xnote}</p>
              <p className={"font-serif text-sm leading-relaxed " + th.dim}>{xtext}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
