// Route table. Every screen is a separate chunk, so the first paint ships
// the shell and nothing else.
import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext.jsx";
import { paths } from "./lib/routes.js";
import { ROUTES } from "./routes/index.js";
import { initAnalytics, pageview } from "./lib/analytics.js";

const LAZY = ROUTES.map((r) => lazy(r.load));

function Splash() {
  const { th } = useApp();
  return <div className={"min-h-screen " + th.page} />;
}

function ScrollAndTrack() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    pageview(pathname);
  }, [pathname]);
  return null;
}

function Shell() {
  return (
    <>
      <ScrollAndTrack />
      <Suspense fallback={<Splash />}>
        <Routes>
          {ROUTES.map((r, i) => {
            const Screen = LAZY[i];
            return <Route key={r.path} path={r.path} element={<Screen />} />;
          })}
          <Route path="*" element={<Navigate to={paths.home} replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  useEffect(() => { initAnalytics(); }, []);
  return (
    <BrowserRouter>
      <AppProvider>
        <Shell />
      </AppProvider>
    </BrowserRouter>
  );
}
