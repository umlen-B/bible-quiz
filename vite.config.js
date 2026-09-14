import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";

// GitHub Pages has no server-side rewrite, so a direct hit on a deep link like
// /new-testament/mark/ch-1 is served 404.html. Shipping a copy of index.html
// under that name lets the router pick the URL up on the client.
function spaFallback() {
  return {
    name: "spa-fallback-404",
    closeBundle() {
      copyFileSync("dist/index.html", "dist/404.html");
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallback()],
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
