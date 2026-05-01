# About Page Compact — Design Spec

**Date:** 2026-05-01
**Page:** `deploy/about.html` ("Who We Are")
**Live URL:** https://link-renovations.dustin-link0209.workers.dev/about.html
**Goal:** Reduce dead space and redundancy on the About page so visitors scan it in one continuous read instead of fighting through 7 padded sections.

---

## Problem

The current About page has eight sections, each with `padding: 100px 80px`, totaling roughly 2400px of vertical scroll. Three of those sections — **Story**, **Values**, **Standard** — restate the same three themes (craftsmanship, communication, integrity) in three different framings. The Stats Band on this page now duplicates the same content the home hero overlay already shows. The result feels padded and repetitive; users lose interest before reaching Meet Nick or the CTA.

## Confidence Targets (must hit ≥95% before any implementation)

| Dimension | Target | How we hit it |
|-----------|--------|---------------|
| User-friendly | ≥95% | Cut redundancy only; preserve all unique copy and trust signals |
| Same look and feel | ≥95% | Reuse all existing CSS classes; keep section padding at 100px to match other pages |
| Desktop ↔ mobile parity | ≥95% | Pin mobile card grid explicitly; preview-deploy QA gate before production |

---

## Final Page Structure

Four content sections (down from seven), plus header and footer:

1. **Page header** (shrunk: 320px → 220px)
2. **Who We Are** — merged from Story + Values + Standard
3. **Meet Nick** — kept, lightly tightened
4. **Final CTA** — shrunk from 380px → 240px
5. **Footer** — unchanged

**Removed entirely:**
- Section-nav pills DOM (the 5-pill row under the top nav). The page is short enough that the existing back-to-top button covers any "scrolled too far" case.
- Values cards section (3 abstract cards — fully redundant with Standard cards' stronger writing).
- Stats Band section (4 stat cards — already shown on home hero overlay).

---

## Section Specs

### 1. Page Header

- Height: **220px** (was 320px). Includes the existing 74px top nav offset.
- Background: existing `photos/bath-06.jpg` with the same dark gradient overlay.
- Content unchanged: `.page-tag` eyebrow ("Who We Are"), `.page-title` ("About Link Renovations").
- Inner padding bottom: **40px** (was 56px).
- Mobile: existing `.page-header` rules in `mobile.css` continue to apply, scaled proportionally to the new 220px desktop baseline.

### 2. Who We Are (merged section)

Replaces three current sections with one. Section padding stays at **100px top/bottom** to preserve visual rhythm with portfolio.html / process.html / testimonials.html.

The section contains three stacked rows:

#### Row 1 — Photo + Prose (2-column grid, same as current `.story`)
- Left column: existing `photos/outdoor-04.jpg` background image, existing `.story-image` styling (incl. the inset shadow and the contrast/saturation filter already applied site-wide).
- Right column: prose, using existing `.story-text` typography.
- **Eyebrow:** "Our Story" (existing copy)
- **Section title:** "Built On Craftsmanship & Trust." (existing copy)
- **Section rule:** existing 44×3px red bar
- **Prose:** Two paragraphs, verbatim from current page:
  1. "Link Renovations specializes in **high-quality remodeling for residential and commercial properties** in Louisville, KY and the surrounding areas. We are fully insured and treat your home as if we are working in our own."
  2. "From custom tile and marble bathrooms to full kitchen renovations, custom woodworking, decks, and commercial projects — every job receives the same level of care and craftsmanship."
- **Cut:** the middle paragraph ("We strive to complete every job in a timely manner...") — its content overlaps with what the Standard cards say more concretely.

#### Row 2 — Trust strip (slim, replaces full Stats Band)
- Single horizontal line, ~40px tall on desktop, dark background (`#0d0d0d`).
- Centered text in Montserrat 700, 12.5px, letter-spacing 2.8px, uppercase.
- Content: `10+ YEARS    ·    200+ PROJECTS    ·    100% LICENSED & INSURED    ·    ★★★★★`
- Stars use existing `.count-stars` red color (`#b01020`).
- Sits as a visual rule between the prose row above and the cards row below.
- Margin: 40px top, 40px bottom (creates breathing room without ballooning section height).
- **Mobile:** content stays identical; uses `flex-wrap: wrap` with `justify-content: center` so the four items wrap onto 2 lines naturally as the viewport narrows. No copy abbreviation — the same `10+ YEARS · 200+ PROJECTS · 100% LICENSED & INSURED · ★★★★★` content, just wrapped.

#### Row 3 — Standard cards (4-up grid, existing copy)
- Reuses the existing `.standard-grid` and `.standard-card` CSS verbatim.
- Cards (all copy unchanged):
  1. **Premium Materials** — "Large-format slab marble, custom hardwood millwork, hand-selected stone, and architectural-grade hardware. We specify and source for longevity, not for the spec sheet."
  2. **Detail Obsession** — "Substrate prep. Waterproofing. Joinery alignment. Transitions where two materials meet. The parts you don't see are what separate good work from exceptional work."
  3. **Direct Communication** — "No subcontracting to crews you've never met. Nick is on every project, every day — making the calls, sweating the details, and answering the phone when you need him."
  4. **The Final Test** — "If we wouldn't put it in our own home, it doesn't go in yours. That single sentence drives every material choice, every cut, every finish — start to finish."
- **Desktop:** 4-column grid (`grid-template-columns: repeat(4, 1fr)`), 1px gap on `#1a1a1a` background. Note: shared.css default `.standard-grid` is 2-column, so this page needs an inline override to make it 4-column.
- **Card padding:** Keep existing 50px 44px on desktop.
- **Mobile (≤1280px):** **2×2 grid** (`grid-template-columns: repeat(2, 1fr)`). Note: current `mobile.css` line 222 sets `.standard-grid` to `1fr` (1-column) for the rest of the site. We need a per-page override on about.html to force 2×2 — implemented either via a more specific selector (e.g. `body[data-page="about"] .standard-grid`) or via an inline `<style>` block override that's more specific than the `mobile.css` rule. **2×2 chosen over 1-column** because 4 cards stacked single-column on mobile creates excessive scroll; 2×2 keeps them scannable at once. Card padding on mobile: 32px 24px.

### 3. Meet Nick

- Section padding: stays at **100px** (matches site rhythm).
- Photo height: **400px** (was 460px) — small tighten, keeps the photo prominent without dominating the section.
- Layout, copy, eyebrow ("Meet The Owner"), title ("Renovator. Craftsman. Husband. Dad."), and bio: **all unchanged**.
- Mobile: existing breakpoint already stacks the 2-col grid; no changes needed.

### 4. Final CTA

- min-height: **240px** (was 380px).
- Internal padding tightens proportionally; CTA content margins reduce by ~30%.
- Same background photo (`photos/bath-11.jpg`), same h2 ("Let's Build Something Together."), same subline, same red button, same phone link.
- Mobile: existing `.cta-final` rules continue to apply.

### 5. Footer

Unchanged.

---

## Mobile Behavior (per existing `mobile.css` breakpoint at ≤1280px)

The merged section stacks fully vertically on mobile in this exact order:
1. Photo (full-width, max-height ~280px)
2. Prose (2 paragraphs)
3. Trust strip (2 lines, see Row 2 above)
4. Standard cards in 2×2 grid

All other section behaviors (hamburger drawer, fixed nav, back-to-top button) remain untouched. Section-nav pills CSS in `mobile.css` is left in place for sibling pages (process.html, portfolio.html etc.) — only the about.html `<nav class="section-nav">` element is removed from the DOM.

The about.html `<body>` currently has no class, so removing the `<nav class="section-nav">` element does not require any body-level padding adjustment (the only relevant rule, `body.has-section-nav`, never applied to this page in the first place). If implementation reveals that the page header was previously offset by the section-nav's stacking context, the implementer should adjust the page header's `padding-top` accordingly during the QA gate.

---

## CSS Changes

All edits are inside `deploy/about.html` `<style>` block. No changes to `shared.css` or `mobile.css` are required for this page.

**New rules to add:**
- `.trust-strip { ... }` — the slim horizontal line between prose and cards.
- `.standard-grid` override on this page only: `grid-template-columns: repeat(4, 1fr)` (the shared rule is 2-col; we want 4-col here).
- Page header tweaks: `height: 220px`, inner `padding-bottom: 40px`.
- `.cta-final { min-height: 240px }` override.
- `.nick-photo { height: 400px }` override.

**Mobile overrides (inside same `<style>` block, scoped to be more specific than `mobile.css` line 222):**
- `.standard-grid` becomes `grid-template-columns: repeat(2, 1fr)` at ≤1280px on this page (overriding the shared `1fr` rule).
- `.trust-strip` uses `flex-wrap: wrap` so its 4 items naturally wrap to 2 lines on narrow screens. No content change.

---

## What Stays Identical

- All photos (`bath-06.jpg`, `outdoor-04.jpg`, `bath-11.jpg`, Nick's portrait).
- All typography (Montserrat headings, Open Sans body).
- All brand colors (`#b01020` red, `#0a0a0a` / `#0d0d0d` darks).
- All hover states and animations (card border-color transitions, scroll-reveal).
- All shared assets (`shared.css`, `shared.js`, `mobile.css`) — untouched.
- Top nav, mobile drawer, footer, back-to-top button — untouched.
- Image filter (`contrast(1.10) brightness(1.04) saturate(1.18)`) — untouched.

---

## Total Page Height Impact

- **Before:** ~2400px desktop / ~3800px mobile (rough estimate).
- **After:** ~1500px desktop / ~2400px mobile.
- **Reduction:** ~37% on both breakpoints.

---

## QA Gate (mandatory before production deploy)

1. Build the change locally.
2. Deploy to a Wrangler **preview** URL (not the production `link-renovations` worker).
3. Visual QA at three widths in Chrome devtools: **1920px / 1280px / 375px**.
4. Open the preview URL on an **actual phone** (iPhone or Android).
5. Open the preview alongside `portfolio.html` and `process.html` and confirm visual consistency (padding rhythm, section header pattern, card grids).
6. **Only after all five checks pass** → deploy to production `link-renovations` worker.
7. If any check fails, fix in preview and re-QA. No rollback drama.

---

## Out of Scope

- Other pages (portfolio, process, testimonials, contact, index): no changes.
- Shared assets (`shared.css`, `shared.js`, `mobile.css`): no changes.
- Brand identity, copy rewrites, new photos, or new sections.
- Section-nav pill CSS in `mobile.css`: stays in place for sibling pages.

---

## Acceptance Criteria

A reviewer can confirm the change is correct by checking:

1. The page has exactly four content sections + header + footer.
2. The Story prose (2 paragraphs) and the 4 Standard cards both appear inside one merged "Who We Are" section.
3. A slim trust strip appears between prose and cards showing all four stat values.
4. The Values cards section is gone.
5. The full Stats Band section is gone.
6. The section-nav pills under the top nav are gone on this page only.
7. Page header is ~220px tall.
8. Final CTA section is ~240px tall.
9. At ≤1280px the Standard cards lay out as 2×2.
10. The page deploys successfully and renders correctly on iPhone, 1280px, and 1920px.
