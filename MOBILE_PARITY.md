# Visual parity & shared assets contract

This site is composed of 7 HTML pages plus three shared assets that own
the cross-cutting concerns. Edit the shared file once and every page picks
it up.

## Shared assets

| File | Owns |
| --- | --- |
| `mobile.css`  | All `@media (max-width: 1280px)` rules. Mobile/tablet/small-laptop mirror the desktop visual identity (fonts, colors, photo treatments, button styles, pill nav, white logo block) — stacked into 1 column. Desktop layout fires only at 1281px and above, where it renders cleanly without overflow. |
| `shared.css`  | Polish pass (image filters, hover transitions, reveal animation), upgraded footer, `.section-nav` pills, `.back-to-top` button, hamburger/drawer default visibility. |
| `shared.js`   | `toggleDrawer()`, stat-card counters (no-op if no `.stats-band`), scroll-reveal IntersectionObserver, section-nav active state + smooth scroll + back-to-top show/hide. |

Each HTML page links them in `<head>`:

```html
<link rel="stylesheet" href="shared.css">
<link rel="stylesheet" href="mobile.css">
<!-- and just before </body>: -->
<script src="shared.js"></script>
```

## The contract

When you change anything that touches more than one page (nav, footer,
buttons, page-header, color, font, photo treatment, animation, behavior),
you **must** update the shared file — never copy the change into individual
HTML pages. If a new component will be used on multiple pages, add its
styling to `shared.css` (desktop) plus a matching rule in `mobile.css`
(mobile, stacked) before adding the markup to any page.

## What stays inline per page

- Page-specific layout: hero, section grids, page header, page-only
  components (filter bar, lightbox, contact form, etc.)
- Per-page metadata: `<title>`, page-specific `<meta>` tags
- Page-specific JS that wouldn't run on other pages (e.g., portfolio
  filtering / lightbox)

## Deploy

Two deploy targets exist. **Preview is for QA; production is live.**

### Preview (QA / staging)

```bash
cd /Users/dustinlink/link-renovations-website
npx wrangler deploy --env preview
```

Worker: `link-renovations-preview`. URL: https://link-renovations-preview.dustin-link0209.workers.dev/.
Use this for any change that touches layout, typography, or section structure. Visual-QA the preview URL on desktop (default / 1920 / 1280 / 375 widths) and a real phone before promoting to production.

### Production

```bash
cd /Users/dustinlink/link-renovations-website
npx wrangler deploy
```

Worker: `link-renovations`. URL: https://link-renovations.dustin-link0209.workers.dev/.
Only deploy here after the preview URL has been QA'd and approved.

### Note on `wrangler.jsonc` location

`wrangler.jsonc` lives at the repo root (`/Users/dustinlink/link-renovations-website/`), one directory up from the git-tracked `deploy/` subdirectory. The git repo only tracks files inside `deploy/`. Treat `wrangler.jsonc` as part of the project even though it lives outside the tracked tree.

## Don'ts

- Never add a `@media (max-width: 768px)` block inline in a page — it goes
  in `mobile.css`.
- Never duplicate polish-pass / footer / section-nav / back-to-top rules in
  a page — they live in `shared.css`.
- Never `display: none` a content element on mobile — the rule is parity,
  not omission.
- Never deploy from `deploy/`. Always deploy from the repo root so the
  single `wrangler.jsonc` is used.
