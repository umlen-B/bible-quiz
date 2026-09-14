// Question preparation and per-language text selection.
import { rng, shuffle } from "./rng.js";

export function prepare(list, seed) {
  const rand = rng(seed);
  return shuffle(list, rand).map((q) => {
    const pairs = q.o.map((text, idx) => ({
      text,
      hi: q.hi && q.hi.o ? q.hi.o[idx] : null,
      correct: idx === q.a,
    }));
    const mixed = shuffle(pairs, rand);
    return {
      ...q,
      opts: mixed.map((p) => p.text),
      optsHi: mixed.map((p) => p.hi),
      ans: mixed.findIndex((p) => p.correct),
    };
  });
}

export function qText(d, lang) {
  return lang === "hi" && d.hi && d.hi.q ? d.hi.q : d.q;
}
export function oText(d, i, lang) {
  if (i === null || i === undefined) return null;
  return lang === "hi" && d.optsHi && d.optsHi[i] ? d.optsHi[i] : d.opts[i];
}
export function eText(d, lang) {
  return lang === "hi" && d.hi && d.hi.e ? d.hi.e : d.e;
}

export function clock(s) {
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}
