# bit24wiseclone

A Bit24 homepage concept inspired by Wise's clarity-first fintech patterns, redesigned with Bit24's blue brand language and Persian RTL content.

## Included

- Persian RTL responsive homepage
- IRANSansX typography for Persian UI text, bundled locally under `src/assets/fonts/`
- Bit24-inspired blue palette and textual brand lockup
- Interactive exchange converter with currency swapping
- Live-market style ticker and switchable market tabs
- Services, trust, learning, and footer sections
- Mobile navigation drawer
- GitHub Pages deployment workflow

This is a frontend concept. Market values and metrics shown in the UI are illustrative presentation data and are not connected to a trading API.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds the Vite app and publishes `dist/` to GitHub Pages. The intended project URL is:

`https://rakhavanm.github.io/bit24wiseclone/`

## Design direction

The page uses Wise-inspired principles — product-first hero, clear conversion details, restrained color usage, generous whitespace, strong typography, and progressive trust-building — without copying Wise's proprietary layout or content.
