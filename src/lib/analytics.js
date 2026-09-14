// Google Analytics 4. The measurement id comes from VITE_GA_ID at build time;
// with no id set the whole thing is inert, so dev and previews send nothing.
const ID = import.meta.env.VITE_GA_ID;

export function initAnalytics() {
  if (!ID || typeof window === "undefined" || window.__gaReady) return;
  window.__gaReady = true;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  // Router drives page_view itself, so the automatic one would double-count.
  window.gtag("config", ID, { send_page_view: false });
}

export function pageview(path, title) {
  if (!ID || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: title || document.title,
  });
}

export function track(name, params) {
  if (!ID || !window.gtag) return;
  window.gtag("event", name, params || {});
}
