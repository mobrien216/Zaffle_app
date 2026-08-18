import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: if you deploy to GitHub Pages at
// https://<your-username>.github.io/<your-repo-name>/
// set `base` below to "/<your-repo-name>/" (with slashes on both ends).
// If you deploy to Vercel/Netlify, or a custom domain, leave it as "/".
export default defineConfig({
  base: "/zaffle/",
  plugins: [react()],
});
