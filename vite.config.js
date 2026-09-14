import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Custom domain (johnsonsdomain.com) -> keep "/"
  // No custom domain (user.github.io/repo-name/) -> change to "/repo-name/"
  base: "/",
});
