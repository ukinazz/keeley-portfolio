# Keeley Zou — Portfolio

Personal portfolio for Keeley Zou, marketing designer. A single-page TanStack
Start + React site, prerendered to static HTML.

Everything the site needs — fonts, portrait, project screenshots — lives in this
repository. There is no build plugin, CDN, or runtime service required to build
or serve it.

## Development

Requires Node.js 22+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run build    # static output in dist/client, index.html prerendered
npm run preview  # serve the production build
```

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.

1. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` (or run the workflow manually from Actions → "Deploy to GitHub Pages").
3. The workflow prints the live URL on completion.

The site is built with a URL base of `/keeley-portfolio/`, which is correct for
`https://ukinazz.github.io/keeley-portfolio/`. If you publish it at a root
domain instead — a `ukinazz.github.io` repository or a custom domain — create a
repository variable `SITE_BASE` with the value `/` so assets resolve.

## Structure

- `src/routes/index.tsx` — the whole page; sections are anchored (`#about`, `#work`, `#contact`).
- `src/lib/portfolio-work.ts`, `src/lib/experience.ts` — content data, shared with the tests.
- `src/assets/` — fonts and images, imported through Vite so they are hashed and base-path aware.
- `vite.config.ts` — the toolchain: React, Tailwind v4, TanStack Start, prerender settings.
