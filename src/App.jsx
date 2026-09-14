// Route table. Every screen is a separate chunk, so the first paint ships
// the shell and nothing else.
import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext.jsx";
import { BOOK_BASE, paths } from "./lib/routes.js";
import { initAnalytics, pageview } from "./lib/analytics.js";

const Landing = lazy(() => import("./routes/Landing.jsx"));
const Book = lazy(() => import("./routes/Book.jsx"));
const Quiz = lazy(() => import("./routes/Quiz.jsx"));

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
          <Route path={paths.home} element={<Landing />} />
          <Route path={BOOK_BASE} element={<Book />} />
          {/* One segment for every paper: ch-1 … ch-16, all, and the mock slugs.
              React Router v6 only binds a param to a whole segment, so the
              chapter number is parsed out of the slug in the route itself. */}
          <Route path={`${BOOK_BASE}/:slug`} element={<Quiz />} />
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
