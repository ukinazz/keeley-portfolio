import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves project sites under /<repo>/; set VITE_BASE to match when
// the site is not deployed to a root domain.
const base = process.env["VITE_BASE"] || "/";

export default defineConfig({
  base,
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart({
      router: { basepath: base.replace(/\/$/, "") || "/" },
      pages: [{ path: "/" }],
      prerender: { enabled: true, crawlLinks: false },
    }),
    react(),
  ],
});
