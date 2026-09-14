// Header controls, icons and footer — shared by every route.
import React from "react";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.2v2M12 19.8v2M4.4 4.4l1.4 1.4M18.2 18.2l1.4 1.4M2.2 12h2M19.8 12h2M4.4 19.6l1.4-1.4M18.2 5.8l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M20.5 13.3A8.3 8.3 0 1 1 10.7 3.5a6.6 6.6 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function Segmented({ items, value, onChange, th, wide }) {
  return (
    <div className={"inline-flex rounded-full p-0.5 " + th.seg}>
      {items.map((it) => (
        <button
          key={it.v}
          onClick={() => onChange(it.v)}
          title={it.title}
          aria-label={it.title}
          aria-pressed={value === it.v}
          className={
            "rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 " +
            th.ring + " " + (wide ? "px-3 h-7 text-xs font-medium " : "w-8 h-7 ") +
            (value === it.v ? th.segOn : th.segOff)
          }
        >
          {it.node}
        </button>
      ))}
    </div>
  );
}

export function Controls({ theme, setTheme, lang, setLanguage, th, t }) {
  return (
    <div className="flex items-center gap-2">
      <Segmented
        th={th}
        value={theme}
        onChange={setTheme}
        items={[
          { v: "light", node: <SunIcon />, title: t.themeLight },
          { v: "dark", node: <MoonIcon />, title: t.themeDark },
        ]}
      />
      <Segmented
        th={th}
        wide
        value={lang}
        onChange={setLanguage}
        items={[
          { v: "en", node: "EN", title: t.langEn },
          { v: "hi", node: "हि", title: t.langHi },
        ]}
      />
    </div>
  );
}

export function Footer({ th }) {
  return (
    <p className={"text-xs text-center mt-10 pt-5 border-t " + th.line + " " + th.dim3}>
      © 2026 Johnson Bhengra. All rights reserved.
    </p>
  );
}

