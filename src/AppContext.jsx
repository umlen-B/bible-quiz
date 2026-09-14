// Theme, language, translation and marking mode. These outlive any single
// route, so they live here rather than in a screen.
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { readPref, writePref } from "./lib/prefs.js";
import { TH } from "./theme.js";
import { T } from "./i18n/strings.js";

const Ctx = createContext(null);

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside <AppProvider>");
  return v;
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => readPref("bq.theme", ["light", "dark"], "dark"));
  const [lang, setLang] = useState(() => readPref("bq.lang", ["en", "hi"], "en"));
  const [tr, setTr] = useState(() =>
    readPref("bq.tr", ["web", "kjv", "hin"], readPref("bq.lang", ["en", "hi"], "en") === "hi" ? "hin" : "web")
  );
  const [mode, setMode] = useState(() => readPref("bq.mode", ["exam", "instant"], "exam"));

  const th = TH[theme];
  const t = T[lang];

  useEffect(() => {
    writePref("bq.theme", theme);
    try { document.documentElement.style.backgroundColor = th.root; } catch (e) {}
  }, [theme, th.root]);

  useEffect(() => {
    writePref("bq.lang", lang);
    try { document.documentElement.lang = lang === "hi" ? "hi" : "en"; } catch (e) {}
  }, [lang]);

  useEffect(() => { writePref("bq.tr", tr); }, [tr]);
  useEffect(() => { writePref("bq.mode", mode); }, [mode]);

  function setLanguage(l) {
    setLang(l);
    if (l === "hi") setTr("hin");
    else if (tr === "hin") setTr("web");
  }

  const value = useMemo(
    () => ({ theme, setTheme, lang, setLanguage, tr, setTr, mode, setMode, th, t }),
    [theme, lang, tr, mode, th, t]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
