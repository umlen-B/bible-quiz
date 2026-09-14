import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, writeFileSync } from "node:fs";
import { allPaths, canonicalUrl, SITE } from "./src/lib/routes.js";

// GitHub Pages has no server-side rewrite, so a direct hit on a deep link like
// /new-testament/mark/ch-1 is served 404.html. Shipping a copy of index.html
// under that name lets the router pick the URL up on the client.
function spaFallback() {
  return {
    name: "spa-fallback-404",
    // Build only. In a dev server these hooks also fire when the server is
    // closed, which is how the prerenderer ended up overwriting 404.html with
    // an already-prerendered index.html.
    apply: "build",
    closeBundle() {
      copyFileSync("dist/index.html", "dist/404.html");
    },
  };
}

// Search engines get an explicit list of every paper URL rather than having to
// discover them by crawling, and the list is derived from the route table so it
// cannot fall out of step.
function seoFiles() {
  return {
    name: "seo-files",
    apply: "build",
    closeBundle() {
      const urls = allPaths()
        .map((p) => `  <url><loc>${canonicalUrl(p)}</loc></url>`)
        .join("\n");
      writeFileSync("dist/sitemap.xml",
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
      writeFileSync("dist/robots.txt",
        `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallback(), seoFiles()],
  // Custom domain (bible-quiz.bhengra.co.in) -> keep "/".
  // Serving from user.github.io/repo-name/ instead -> change to "/repo-name/".
  base: "/",
  build: {
    // Chapters and translations are split by dynamic import; keeping React in
    // its own chunk means it stays cached across content updates.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
