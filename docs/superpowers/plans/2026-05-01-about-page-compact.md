# About Page Compact — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compact `deploy/about.html` from 8 padded sections (~2400px) down to 4 focused sections (~1500px) by cutting redundancy (Values cards, Stats Band) and merging Story + Standard into a single "Who We Are" section, while preserving all unique copy, photos, and brand identity.

**Architecture:** Single static HTML page with inline `<style>` block, deployed via Cloudflare Workers. Uses three shared assets (`shared.css`, `shared.js`, `mobile.css`) which remain untouched. All edits are scoped to `deploy/about.html`, plus a one-time infrastructure prerequisite that adds an `[env.preview]` block to `wrangler.jsonc` and a documentation update to `MOBILE_PARITY.md`.

**Tech Stack:** Static HTML/CSS/JS · Cloudflare Workers (`wrangler` CLI) · Open Sans / Montserrat fonts · No build step · No test framework (verification is visual QA at multiple breakpoints).

---

## File Structure

| File | Type | Purpose |
| --- | --- | --- |
| `/Users/dustinlink/link-renovations-website/wrangler.jsonc` | Modify | Add `env.preview` block (one-time infrastructure) |
| `/Users/dustinlink/link-renovations-website/deploy/MOBILE_PARITY.md` | Modify | Document both deploy targets in Deploy section |
| `/Users/dustinlink/link-renovations-website/deploy/about.html` | Modify | All About page changes (DOM + inline CSS) |

**Out of scope (do not touch):** `shared.css`, `shared.js`, `mobile.css`, all other `*.html` pages, `photos/`, `videos/`, `logo*.png`.

---

## Verification Strategy

This is a static HTML/CSS change with no test framework. Verification is **visual QA at multiple breakpoints on a Wrangler preview URL**, per the spec's QA Gate. Each Phase 2 task ends with a local file:// sanity check (open the HTML file in a browser) — full QA happens in Phase 3 once all source edits are committed.

**Working directory:** Most tasks run from the repo root `/Users/dustinlink/link-renovations-website/`. The git repository lives in `deploy/`, so `git` commands run from `/Users/dustinlink/link-renovations-website/deploy/`. Each task explicitly states its working directory.

---

## Phase 1 — Preview Environment Setup (Prerequisites)

These three tasks set up infrastructure that the QA gate depends on. Must complete before Phase 2.

### Task 1: Add `env.preview` block to `wrangler.jsonc`

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/wrangler.jsonc`

- [ ] **Step 1: Open the current `wrangler.jsonc`**

Working dir: `/Users/dustinlink/link-renovations-website/`

Read the file. Confirm the current contents are exactly:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "link-renovations",
  "compatibility_date": "2026-05-01",
  "observability": {
    "enabled": true
  },
  "assets": {
    "directory": "deploy"
  },
  "compatibility_flags": [
    "nodejs_compat"
  ]
}
```

If the file differs (e.g. someone edited it since this plan was written), STOP and reconcile before proceeding.

- [ ] **Step 2: Replace file contents with the new config**

Replace the entire file with:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "link-renovations",
  "compatibility_date": "2026-05-01",
  "observability": {
    "enabled": true
  },
  "assets": {
    "directory": "deploy"
  },
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "env": {
    "preview": {
      "name": "link-renovations-preview",
      "assets": {
        "directory": "deploy"
      },
      "compatibility_flags": [
        "nodejs_compat"
      ]
    }
  }
}
```

Note: `env.preview.assets` and `env.preview.compatibility_flags` are repeated explicitly because Wrangler does not always inherit top-level fields into named environments. `compatibility_date` and `observability` do inherit reliably and are not repeated.

- [ ] **Step 3: Validate JSONC syntax**

Working dir: `/Users/dustinlink/link-renovations-website/`

Run: `npx wrangler types --config wrangler.jsonc 2>&1 | head -20`

Expected: command runs without "ParseError" or "InvalidConfig" errors. (If wrangler types is unavailable, run `npx wrangler deploy --env preview --dry-run` instead — that also validates the config without deploying.)

If you see a syntax error, fix the JSONC and re-run.

- [ ] **Step 4: Commit the wrangler.jsonc change**

Working dir: `/Users/dustinlink/link-renovations-website/deploy/` (the git repo root).

Note: `wrangler.jsonc` lives one directory up from the git root. The current setup tracks files inside `deploy/` only. Verify with `git status` whether `wrangler.jsonc` is tracked by this repo. If it is NOT tracked, skip the commit step here — wrangler.jsonc is outside the tracked tree, and that is acceptable for this project's workflow. Document this in Task 3 (MOBILE_PARITY.md update) so future maintainers know.

If `wrangler.jsonc` IS tracked (unlikely given current layout), run:

```bash
git add ../wrangler.jsonc
git commit -m "$(cat <<'EOF'
Add Wrangler preview environment to enable preview-deploy QA gate

Adds env.preview block defining a separate worker (link-renovations-preview) that mirrors production assets. Enables npx wrangler deploy --env preview for QA before promoting changes to the production link-renovations worker.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

If `wrangler.jsonc` is not tracked, no commit happens — proceed directly to Task 2.

---

### Task 2: Verify the preview deploy works

**Files:**
- No file changes; this is a verification task only.

- [ ] **Step 1: Run the preview deploy**

Working dir: `/Users/dustinlink/link-renovations-website/`

Run: `npx wrangler deploy --env preview`

Expected output ends with something like:
```
Deployed link-renovations-preview triggers (X.YYsec)
  https://link-renovations-preview.dustin-link0209.workers.dev
Current Version ID: <some-uuid>
```

If the command errors out, capture the error and STOP. Do not proceed to Phase 2 until preview deploys cleanly. Common failure modes:
- "Worker name already in use" → choose a different `env.preview.name` (e.g. `link-renovations-stage`) and update wrangler.jsonc + this plan + the spec.
- "Asset directory not found" → verify `env.preview.assets.directory` is `"deploy"` (relative to `wrangler.jsonc` location).
- Authentication errors → user runs `npx wrangler login` themselves.

- [ ] **Step 2: Verify the preview URL renders the current site**

Open in a browser: `https://link-renovations-preview.dustin-link0209.workers.dev/`

Expected: the home page loads and looks visually identical to the production site at `https://link-renovations.dustin-link0209.workers.dev/`.

Then visit: `https://link-renovations-preview.dustin-link0209.workers.dev/about.html`

Expected: the current (pre-compaction) About page loads — long, with all 8 sections visible.

If the preview shows anything different from production at this point, STOP and reconcile. The preview environment must mirror production exactly before any About page changes are made.

- [ ] **Step 3: No commit needed (no source files changed in this task)**

---

### Task 3: Update `MOBILE_PARITY.md` Deploy section

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/deploy/MOBILE_PARITY.md` (lines 41-50, the Deploy section)

- [ ] **Step 1: Read the current Deploy section**

The current section (lines 41-50) reads:

```markdown
## Deploy

```bash
cd /Users/dustinlink/link-renovations-website
npx wrangler deploy
```

Worker name is `link-renovations`. Live at
https://link-renovations.dustin-link0209.workers.dev/.
```

- [ ] **Step 2: Replace with two-target deploy documentation**

Replace lines 41-50 with:

```markdown
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
```

- [ ] **Step 3: Commit the doc update**

Working dir: `/Users/dustinlink/link-renovations-website/deploy/`

```bash
git add MOBILE_PARITY.md
git commit -m "$(cat <<'EOF'
Document preview-and-production deploy targets in MOBILE_PARITY.md

Updates the Deploy section to describe both env.preview (link-renovations-preview, for QA) and the default production target (link-renovations). Adds a note clarifying that wrangler.jsonc lives outside the git-tracked deploy/ tree.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

Run `git log --oneline -3` to confirm the commit landed.

---

## Phase 2 — About Page Restructure

All Phase 2 tasks edit `/Users/dustinlink/link-renovations-website/deploy/about.html`. Each task is a single logical change with its own commit. Verification at the end of each task is a local `file://` open in a browser — no preview deploy until Phase 3.

### Task 4: Remove `<nav class="section-nav">` element

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/deploy/about.html` (lines 164-170)

- [ ] **Step 1: Locate the section-nav element**

The current markup at lines 164-170 reads:

```html
<nav class="section-nav" aria-label="Section navigation">
  <a href="#story" data-link="story">Story</a>
  <a href="#values" data-link="values">Values</a>
  <a href="#standard" data-link="standard">Standard</a>
  <a href="#stats" data-link="stats">By Numbers</a>
  <a href="#meet-nick" data-link="meet-nick">Meet Nick</a>
</nav>
```

- [ ] **Step 2: Delete the entire element**

Remove all 7 lines (the opening `<nav>` tag, all 5 inner `<a>` links, and the closing `</nav>` tag), plus the blank line above (line 163). The next element (`<div class="page-header">`) becomes the first element after `</nav>` of the main top nav.

- [ ] **Step 3: Verify the body class is unchanged**

The `<body>` element (line 149) should remain `<body>` with no class. If you see `<body class="has-section-nav">` or similar, also remove that class — but the current file has no such class, so nothing to do.

- [ ] **Step 4: Sanity-check by opening locally**

Open `file:///Users/dustinlink/link-renovations-website/deploy/about.html` in a browser. Confirm:
- Top nav (logo + Home / Portfolio / Who We Are / etc.) still renders.
- The 5-pill row that used to be just below the top nav is now gone.
- Page header below renders normally.

- [ ] **Step 5: Commit**

Working dir: `/Users/dustinlink/link-renovations-website/deploy/`

```bash
git add about.html
git commit -m "$(cat <<'EOF'
Remove section-nav pills from About page

The merged compact layout has only two content sections (Who We Are + Meet Nick), making the 5-pill jump-nav clutter rather than navigation aid. Back-to-top button (in shared.css) covers any "scrolled too far" case.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Shrink page header from 320px → 220px

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/deploy/about.html` (line 24, the `.page-header` rule; line 26, the `.page-header-content` rule)

- [ ] **Step 1: Update `.page-header` height**

Find line 24:

```css
.page-header { padding-top: 74px; height: 320px; position: relative; display: flex; align-items: flex-end; }
```

Replace with:

```css
.page-header { padding-top: 74px; height: 220px; position: relative; display: flex; align-items: flex-end; }
```

- [ ] **Step 2: Update `.page-header-content` padding-bottom**

Find line 26:

```css
.page-header-content { position: relative; z-index: 1; padding: 0 80px 56px; }
```

Replace with:

```css
.page-header-content { position: relative; z-index: 1; padding: 0 80px 40px; }
```

- [ ] **Step 3: Verify locally**

Open `file:///Users/dustinlink/link-renovations-website/deploy/about.html`. Confirm:
- Page header is visibly shorter (about 30% less photo than before).
- The eyebrow tag ("Who We Are") and title ("About Link Renovations") are still readable, still aligned to the bottom of the header, with breathing room above.
- No content overlaps the top nav.

- [ ] **Step 4: Commit**

```bash
git add about.html
git commit -m "$(cat <<'EOF'
Shrink About page header from 320px to 220px

Reduces dead space above the fold. Photo, eyebrow tag, and title all preserved; only the photo height and bottom padding tightened.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Remove the Values section

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/deploy/about.html` (DOM lines 191-214; CSS lines 41-49)

- [ ] **Step 1: Remove the Values DOM**

Find and delete lines 191-214:

```html
<div class="values" id="values">
  <div class="values-header">
    <div class="section-tag">What We Stand For</div>
    <div class="section-title">Our Values</div>
    <div class="section-rule"></div>
  </div>
  <div class="values-grid">
    <div class="value">
      <div class="value-num">01</div>
      <div class="value-title">Craftsmanship</div>
      <div class="value-desc">Every detail is finished by hand with the precision and care that defines a true craftsman.</div>
    </div>
    <div class="value">
      <div class="value-num">02</div>
      <div class="value-title">Communication</div>
      <div class="value-desc">Clear, honest updates from concept through completion. No surprises, no shortcuts.</div>
    </div>
    <div class="value">
      <div class="value-num">03</div>
      <div class="value-title">Integrity</div>
      <div class="value-desc">Fully insured, timely, and reasonable. We treat your home as if it were our own.</div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Remove the Values CSS rules**

Find lines 41-49 in the inline `<style>` block:

```css
/* Values */
.values { padding: 100px 80px; background: #060606; }
.values-header { text-align: center; margin-bottom: 60px; }
.values-header .section-rule { margin: 18px auto 0; }
.values-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #1a1a1a; }
.value { background: #0d0d0d; padding: 50px 40px; text-align: center; }
.value-num { font-family: 'Montserrat', sans-serif; font-size: 48px; font-weight: 900; color: #b01020; opacity: 0.18; line-height: 1; margin-bottom: 16px; }
.value-title { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; }
.value-desc { font-size: 13px; color: #777; line-height: 1.85; }
```

Delete all 9 lines.

**Caveat:** `shared.css` line 61-62 references `.value` in a hover transition rule:
```css
.value, .standard-card { transition: background 0.3s, border-color 0.3s, transform 0.3s; }
.value:hover, .standard-card:hover { transform: translateY(-3px); }
```
Leave that alone. Other pages may still use `.value` (none currently do, but the rule is defensive). Removing the about.html DOM removes the only consumer; the orphan rule is harmless.

- [ ] **Step 3: Verify locally**

Open the file in a browser. Confirm:
- No "Our Values" section appears between the Story and Standard sections.
- The Story section (with photo + prose) flows directly into the Standard section ("The Standard.").
- No visual gap, layout glitch, or broken background color transition.

- [ ] **Step 4: Commit**

```bash
git add about.html
git commit -m "$(cat <<'EOF'
Remove Values section from About page

The 3 abstract value cards (Craftsmanship/Communication/Integrity) restate themes already covered concretely by the Standard cards (Premium Materials/Detail Obsession/Direct Communication/The Final Test) and by the Story prose. Cutting eliminates the redundancy without losing any unique content.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Remove the Stats Band section

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/deploy/about.html` (DOM lines 248-267; CSS lines 64-72)

- [ ] **Step 1: Remove the Stats Band DOM**

Find and delete the `<div class="stats-band" id="stats">` block (originally lines 248-267):

```html
<div class="stats-band" id="stats">
  <div class="stats-band-inner">
    <div class="stat-card">
      <div class="stat-num"><span class="count" data-target="10" data-suffix="+">0</span></div>
      <div class="stat-label">Years of Craftsmanship</div>
    </div>
    <div class="stat-card">
      <div class="stat-num"><span class="count" data-target="200" data-suffix="+">0</span></div>
      <div class="stat-label">Projects Completed</div>
    </div>
    <div class="stat-card">
      <div class="stat-num"><span class="count" data-target="100" data-suffix="%">0</span></div>
      <div class="stat-label">Fully Licensed &amp; Insured</div>
    </div>
    <div class="stat-card">
      <div class="stat-num"><span class="count-stars" data-target="5">★★★★★</span></div>
      <div class="stat-label">Five-Star Client Rating</div>
    </div>
  </div>
</div>
```

Note: line numbers may have shifted from earlier deletions. Use the `class="stats-band"` selector to locate.

- [ ] **Step 2: Remove the Stats Band CSS**

Find the `/* Stats Band */` block in the inline `<style>` (originally lines 64-72):

```css
/* Stats Band */
.stats-band { background: #0d0d0d; padding: 80px 80px; border-top: 1px solid #161616; border-bottom: 1px solid #161616; }
.stats-band-inner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #1a1a1a; }
.stat-card { background: #111; padding: 40px 28px; text-align: center; position: relative; transition: background 0.3s, transform 0.3s; border-bottom: 3px solid transparent; }
.stat-card:hover { background: #161616; border-bottom-color: #b01020; transform: translateY(-2px); }
.stat-num { font-family: 'Montserrat', sans-serif; font-size: 52px; font-weight: 900; color: #fff; line-height: 1; margin-bottom: 14px; letter-spacing: -1px; }
.count-stars { color: #b01020; font-size: 36px; letter-spacing: 4px; display: inline-block; }
.stat-label { font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #888; }
.stat-card.in-view .stat-num { animation: stat-pop 0.5s ease both; }
@keyframes stat-pop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
```

Delete all those rules.

**Caveat:** the home hero overlay (`index.html`) reuses `.stats-band`, `.stat-card`, `.stat-num`, `.count-stars`, `.stat-label`. Those styles live in `index.html`'s own inline `<style>` block (or re-defined there). Verify by reading `deploy/index.html` and confirming the home hero's stats overlay does NOT depend on about.html's CSS. If it does, leave the rules in about.html intact — but per the conversation context, the home hero has its own self-contained overlay rules. Likely safe to remove from about.html.

To be safe: search across `.html` files for `class="stats-band"`:
```bash
cd /Users/dustinlink/link-renovations-website/deploy
grep -l "stats-band" *.html
```
If only `index.html` shows up, those CSS rules are duplicated there and safe to delete from about.html.

- [ ] **Step 3: Verify locally**

Open about.html in browser. Confirm:
- No "By the Numbers" / 4-stat-card row between Standard section and Meet Nick section.
- Standard section flows directly into Meet Nick section.
- No JS console errors (the `data-target` count animation in `shared.js` is a no-op when no `.count` elements exist).

Verify `index.html` still works: open `file:///Users/dustinlink/link-renovations-website/deploy/index.html`. The hero stats overlay (10+ Years / 200+ Projects / 100% Licensed / 5★) should still render correctly at the bottom of the hero.

- [ ] **Step 4: Commit**

```bash
git add about.html
git commit -m "$(cat <<'EOF'
Remove Stats Band section from About page

The 4 stat cards (10+ Years / 200+ Projects / 100% Licensed / 5★) now overlay the home hero (committed earlier as part of the homepage trim). Showing them again on About added scroll length without new information. A slim trust strip will replace this content within the merged Who We Are section in a later task.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Trim Story prose from 3 paragraphs to 2

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/deploy/about.html` (the `.story-text` content, originally lines 185-187)

- [ ] **Step 1: Locate the three current `<p>` elements**

Inside `<div class="story-text">`, the current prose is:

```html
<p>Link Renovations specializes in <strong>high-quality remodeling for residential and commercial properties</strong> in Louisville, KY and the surrounding areas. We are fully insured and treat your home as if we are working in our own.</p>
<p>We strive to complete every job in a timely manner, at a reasonable cost, with attention to design detail and clear client communication. As a result, <strong>a large portion of our business comes from repeat clientele and referrals</strong>.</p>
<p>From custom tile and marble bathrooms to full kitchen renovations, custom woodworking, decks, and commercial projects — every job receives the same level of care and craftsmanship.</p>
```

- [ ] **Step 2: Delete the middle paragraph**

Remove the entire second `<p>` (the one starting "We strive to complete every job..."). Keep paragraphs 1 and 3 verbatim.

After this step, the prose block is exactly:

```html
<p>Link Renovations specializes in <strong>high-quality remodeling for residential and commercial properties</strong> in Louisville, KY and the surrounding areas. We are fully insured and treat your home as if we are working in our own.</p>
<p>From custom tile and marble bathrooms to full kitchen renovations, custom woodworking, decks, and commercial projects — every job receives the same level of care and craftsmanship.</p>
```

- [ ] **Step 3: Verify locally**

Open about.html in browser. Confirm:
- Story section right column shows eyebrow + title + rule + exactly 2 paragraphs (not 3).
- Both paragraphs render with the existing `.story-text p` styling.
- The bolded portions (`<strong>`) render with the lighter color (`#ddd`).

- [ ] **Step 4: Commit**

```bash
git add about.html
git commit -m "$(cat <<'EOF'
Trim Story prose to 2 paragraphs on About page

The middle paragraph ("We strive to complete every job in a timely manner...") restates content the Standard cards cover more concretely (Detail Obsession, Direct Communication, The Final Test). Cutting it tightens the prose without losing brand voice.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Add the trust strip — CSS and DOM

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/deploy/about.html` (add CSS in inline `<style>` block; add DOM between `.story` and `.standard`)

- [ ] **Step 1: Add the trust strip CSS**

Add the following CSS rules to the inline `<style>` block. Place them after the existing `.story-text` rules and before the Standard section rules (or anywhere in the same `<style>` block — order doesn't affect cascade since these are unique selectors):

```css
/* Trust strip — replaces the full Stats Band, sits between prose row and cards row in the merged Who We Are section */
.trust-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 24px;
  padding: 22px 40px;
  background: #0a0a0a;
  border-top: 1px solid #1a1a1a;
  border-bottom: 1px solid #1a1a1a;
}
.trust-strip > span {
  font-family: 'Montserrat', sans-serif;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 2.8px;
  text-transform: uppercase;
  color: #ccc;
  white-space: nowrap;
  line-height: 1;
}
.trust-strip .trust-sep { color: #333; font-weight: 400; letter-spacing: 0; }
.trust-strip .trust-stars { color: #b01020; font-size: 16px; letter-spacing: 4px; }
```

- [ ] **Step 2: Add the trust strip DOM**

Insert this markup immediately AFTER the closing `</div>` of the `.story` section (the one wrapping `.story-image` + `.story-text`) and BEFORE the opening `<div class="standard" id="standard">`:

```html
<!-- Trust strip — slim divider between prose row and cards row -->
<div class="trust-strip">
  <span>10+ Years</span>
  <span class="trust-sep">·</span>
  <span>200+ Projects</span>
  <span class="trust-sep">·</span>
  <span>100% Licensed &amp; Insured</span>
  <span class="trust-sep">·</span>
  <span class="trust-stars">★★★★★</span>
</div>
```

- [ ] **Step 3: Verify locally**

Open about.html in browser at desktop width (≥1281px). Confirm:
- A thin horizontal strip appears between the Story section and the Standard section.
- Strip contains: `10+ YEARS · 200+ PROJECTS · 100% LICENSED & INSURED · ★★★★★`, all uppercase.
- Stars are red (`#b01020`).
- Separators (`·`) are dimmer than the text.
- Strip has subtle 1px borders top and bottom.
- Strip does not visibly overlap or break either neighboring section.

Resize the browser narrower (or use devtools to set 600px). Confirm the strip wraps to 2 lines as items naturally flow — no horizontal scroll, no clipping.

- [ ] **Step 4: Commit**

```bash
git add about.html
git commit -m "$(cat <<'EOF'
Add trust strip between Story and Standard sections on About page

A slim 40px-tall horizontal strip showing 10+ Years · 200+ Projects · 100% Licensed & Insured · 5-star rating. Replaces the full Stats Band section that was removed earlier; preserves the trust signals at ~10% the height. Uses flex-wrap so content flows naturally to 2 lines on narrow screens with no copy abbreviation.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Restructure Standard section — drop header, adjust padding/background

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/deploy/about.html` (DOM: remove `.standard-header`; CSS: tighten `.standard` padding and unify background)

- [ ] **Step 1: Remove the `.standard-header` DOM**

Inside `<div class="standard" id="standard">`, the current first child is:

```html
<div class="standard-header">
  <div class="section-tag">Materials &amp; Craftsmanship</div>
  <div class="section-title">The Standard.</div>
  <div class="section-rule"></div>
  <p class="standard-intro">Every Link Renovations project is held to the same uncompromising standard — the kind that turns first-time clients into repeat clients, and repeat clients into referrals.</p>
</div>
```

Delete this entire `<div class="standard-header">` block. The Standard section now contains only the cards grid.

Resulting markup inside `.standard`:

```html
<div class="standard" id="standard">
  <div class="standard-grid">
    <div class="standard-card">
      <div class="standard-card-num">01</div>
      <div class="standard-card-title">Premium Materials</div>
      <div class="standard-card-desc">...</div>
    </div>
    <!-- 3 more cards unchanged -->
  </div>
</div>
```

- [ ] **Step 2: Update `.standard` CSS — tighter top padding, unified background**

Find the existing rule:

```css
/* The Standard */
.standard { padding: 100px 80px; background: #0a0a0a; }
```

Replace with:

```css
/* The Standard (now Row 3 of merged Who We Are section) */
.standard { padding: 0 80px 100px; background: #0d0d0d; }
```

Rationale:
- `padding-top: 0` because the trust strip directly above already provides separation.
- `padding-bottom: 100px` keeps the section's bottom rhythm matching other pages.
- `background: #0d0d0d` matches `.story-text` background, unifying the merged section's color.

- [ ] **Step 3: Remove the orphaned `.standard-header` and `.standard-intro` CSS**

Find and delete:

```css
.standard-header { max-width: 720px; margin: 0 auto 60px; text-align: center; }
.standard-header .section-rule { margin: 18px auto 24px; }
.standard-intro { font-size: 15px; color: #888; line-height: 1.9; max-width: 600px; margin: 0 auto; font-weight: 300; }
```

These rules now have no consumer.

- [ ] **Step 4: Verify locally**

Open about.html in browser. Confirm:
- The "Materials & Craftsmanship / The Standard." header text is gone.
- The 4 Standard cards (Premium Materials / Detail Obsession / Direct Communication / The Final Test) appear directly below the trust strip with no extra breathing room above them.
- The card grid still uses 2-column layout (will become 4-column in the next task).
- Background color flows uninterrupted from story-text → trust strip → cards (no jarring color jumps).

- [ ] **Step 5: Commit**

```bash
git add about.html
git commit -m "$(cat <<'EOF'
Restructure Standard section into merged Who We Are layout

Removes the redundant Standard section header (now sourced from Story's eyebrow + title at the top of the merged section). Drops top padding to 0 since the trust strip directly above provides visual separation. Unifies background color to #0d0d0d so prose row, trust strip, and cards row read as one coherent section.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Update `.standard-grid` for 4-column desktop and 2×2 mobile

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/deploy/about.html` (the `.standard-grid` rule and add a mobile media query override)

- [ ] **Step 1: Update `.standard-grid` desktop rule**

Find the current rule:

```css
.standard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: #1a1a1a; max-width: 1200px; margin: 0 auto; }
```

Replace with:

```css
.standard-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #1a1a1a; max-width: none; margin: 0; }
```

Changes:
- 2 columns → 4 columns
- `max-width: 1200px` → `max-width: none` (cards span the full padded section width)
- `margin: 0 auto` → `margin: 0` (no centering needed when cards fill the row)

- [ ] **Step 2: Add a mobile override for 2×2 layout**

`mobile.css` line 222 currently sets `.standard-grid { grid-template-columns: 1fr !important; }` — that gives 1-column stacked layout on mobile by default. We want 2×2 on this page.

Add this media query inside the about.html inline `<style>` block (place it near the bottom of the existing inline mobile-tweaks comments around line 110-145, after the existing `/* MOBILE TWEAKS */` comments):

```css
/* About page mobile override: 2x2 standard cards grid (overrides mobile.css 1fr default) */
@media (max-width: 1280px) {
  .standard-grid { grid-template-columns: repeat(2, 1fr) !important; max-width: none !important; margin: 0 !important; }
  .standard-card { padding: 32px 24px !important; }
}
```

The `!important` flags are required because `mobile.css` line 222 also uses `!important`. Specificity alone is not enough.

- [ ] **Step 3: Verify locally at desktop width**

Open about.html in browser at ≥1281px width. Confirm:
- Standard cards lay out as 4 columns in a single row (Premium Materials | Detail Obsession | Direct Communication | The Final Test).
- 1px gap between cards on `#1a1a1a` background.
- Card hover still works (red border-bottom appears on hover, slight `translateY(-3px)` from `shared.css`).
- Cards fill the section width, padded by 80px from the section sides.

- [ ] **Step 4: Verify locally at mobile width**

In the browser, resize to 375px (iPhone) or 600px or 1024px (any width ≤1280px). Confirm:
- Standard cards lay out as 2×2 grid (2 cards per row, 2 rows total).
- Card padding is visibly tighter than desktop (32px 24px vs 50px 44px).
- Cards still readable and not overlapping.
- 1px gap still visible.

- [ ] **Step 5: Commit**

```bash
git add about.html
git commit -m "$(cat <<'EOF'
Update Standard cards grid: 4-column desktop, 2x2 mobile

Desktop: 4 cards in a single row spanning the full padded section width (was 2-column at 1200px max-width). Mobile (≤1280px): 2x2 grid via inline-style override of mobile.css's 1fr default — keeps all 4 cards scannable on a phone screen without excessive scroll. Card padding tightens from 50/44 to 32/24 on mobile to match the tighter grid.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Tighten Meet Nick photo (460px → 400px)

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/deploy/about.html` (line 77, the `.nick-photo` rule)

- [ ] **Step 1: Update `.nick-photo` height**

Find the current rule (originally line 77):

```css
.nick-photo { width: 100%; height: 460px; background: url('https://images.weserv.nl/?url=www.linkrenovations.com/uploads/1/7/3/7/17373825/13912397-858377754294560-661833225606140644-n_orig.jpg') center top/cover; }
```

Replace `height: 460px` with `height: 400px`. The full updated rule is:

```css
.nick-photo { width: 100%; height: 400px; background: url('https://images.weserv.nl/?url=www.linkrenovations.com/uploads/1/7/3/7/17373825/13912397-858377754294560-661833225606140644-n_orig.jpg') center top/cover; }
```

No other changes to this rule.

- [ ] **Step 2: Verify locally**

Open about.html in browser. Confirm:
- Nick's photo card is visibly slightly shorter than before.
- His face/composition still framed well (the photo uses `center top` so the top of the image is anchored).
- The right column (bio text) still aligns reasonably with the left photo card.

- [ ] **Step 3: Commit**

```bash
git add about.html
git commit -m "$(cat <<'EOF'
Tighten Meet Nick photo height from 460px to 400px

Small reduction to balance overall page rhythm with the now-shorter sections above. Photo composition preserved (center-top crop unchanged).

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: Shrink Final CTA from 380px → 240px

**Files:**
- Modify: `/Users/dustinlink/link-renovations-website/deploy/about.html` (line 85, the `.cta-final` rule; also lines 88-89 for inner content margins)

- [ ] **Step 1: Update `.cta-final` min-height**

Find the rule (originally line 85):

```css
.cta-final { position: relative; min-height: 380px; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; }
```

Replace with:

```css
.cta-final { position: relative; min-height: 240px; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; }
```

- [ ] **Step 2: Tighten inner content margins proportionally**

Find lines 88-89:

```css
.cta-content h2 { font-family: 'Montserrat', sans-serif; font-size: 38px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
.cta-content p { color: #aaa; font-size: 15px; margin-bottom: 36px; font-weight: 300; }
```

Replace with:

```css
.cta-content h2 { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
.cta-content p { color: #aaa; font-size: 14px; margin-bottom: 24px; font-weight: 300; }
```

Changes:
- h2 font-size 38 → 32 (proportional to the shorter section).
- h2 margin-bottom 16 → 12.
- p font-size 15 → 14, margin-bottom 36 → 24.

- [ ] **Step 3: Verify locally**

Open about.html in browser. Confirm:
- Final CTA section is visibly shorter (about 60% of its previous height).
- "Let's Build Something Together." headline still centered and readable.
- Subline ("Free consultations...") visible.
- Red button + phone link both visible without crowding.
- Background photo (`bath-11.jpg`) still renders with dark overlay.

- [ ] **Step 4: Commit**

```bash
git add about.html
git commit -m "$(cat <<'EOF'
Shrink Final CTA section from 380px to 240px

Tightens the closing CTA so it stays as a closer without feeling padded. Headline and subline font sizes reduce proportionally; button and phone link unchanged. Same h2 copy, same red button, same phone link, same photo background.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3 — QA and Production Deploy

### Task 14: Local file:// final spot check

**Files:**
- No changes — verification only.

- [ ] **Step 1: Open the page in a desktop browser**

Open `file:///Users/dustinlink/link-renovations-website/deploy/about.html` at full desktop width.

- [ ] **Step 2: Verify the spec's Acceptance Criteria checklist**

Walk through the spec's section "Acceptance Criteria" (lines 220-233) and tick each:

1. ☐ The page has exactly four content sections + header + footer (Page Header → Who We Are → Meet Nick → Final CTA → Footer).
2. ☐ The Story prose (2 paragraphs) and the 4 Standard cards both appear inside one merged "Who We Are" section.
3. ☐ A slim trust strip appears between prose and cards showing all four stat values.
4. ☐ The Values cards section is gone.
5. ☐ The full Stats Band section is gone.
6. ☐ The section-nav pills under the top nav are gone on this page only.
7. ☐ Page header is ~220px tall.
8. ☐ Final CTA section is ~240px tall.

If ANY check fails, go back and fix the corresponding Phase 2 task before continuing. Do not deploy until all acceptance criteria pass locally.

- [ ] **Step 3: No commit needed**

---

### Task 15: Deploy to preview environment

**Files:**
- No changes — deploy only.

- [ ] **Step 1: Run the preview deploy**

Working dir: `/Users/dustinlink/link-renovations-website/`

```bash
npx wrangler deploy --env preview
```

Expected output ends with:
```
Deployed link-renovations-preview triggers (X.YYsec)
  https://link-renovations-preview.dustin-link0209.workers.dev
```

If the deploy fails, capture the error and fix before continuing.

- [ ] **Step 2: Hard-refresh the preview URL**

Open `https://link-renovations-preview.dustin-link0209.workers.dev/about.html` in a desktop browser. Force-reload to bust cache:
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

Confirm the page now shows the compacted layout (not the old 8-section version).

---

### Task 16: Multi-width visual QA on the preview URL

**Files:**
- No changes — verification only.

- [ ] **Step 1: Default desktop width**

Open `https://link-renovations-preview.dustin-link0209.workers.dev/about.html` in your default browser window. Visually confirm:
- Page header is ~220px, photo + eyebrow + title look right.
- Who We Are section: photo on left, prose on right (2 paragraphs), trust strip below, then 4 Standard cards in a row.
- Meet Nick: photo card on left, bio on right.
- Final CTA: shorter, ~240px tall.
- Footer renders normally.
- No layout overflow, no horizontal scroll.

- [ ] **Step 2: 1920px width**

Open Chrome devtools (F12 / Cmd+Opt+I), toggle device toolbar, set width to 1920px (or use a "Responsive" preset and type 1920). Confirm everything looks right at this width — no excessive whitespace at the edges, content remains centered/balanced.

- [ ] **Step 3: 1280px width (the breakpoint boundary)**

Set devtools width to 1280px. This is the boundary where mobile rules in `mobile.css` kick in (`@media (max-width: 1280px)`). Confirm:
- At exactly 1280px, the desktop layout still shows (4-column standard cards, 2-column story).
- At 1279px (one pixel narrower), the mobile layout activates (2×2 cards, stacked story).
- The transition is clean — no broken layout at the boundary.

- [ ] **Step 4: 375px width (iPhone size)**

Set devtools width to 375px. Confirm:
- Page header still readable.
- Who We Are: photo on top, prose below, trust strip wraps to 2 lines, Standard cards in 2×2 grid.
- Meet Nick: stacks (photo above bio, or per existing mobile.css rules).
- Final CTA: shorter, button + phone link both visible.
- All text readable (no clipping, no overlap with the fixed top nav).

- [ ] **Step 5: Document any issues**

If any width shows broken layout, note the issue, return to the relevant Phase 2 task, fix the source in `deploy/about.html`, redeploy with `npx wrangler deploy --env preview`, and re-QA. Do not proceed to Task 17 until all four widths render cleanly.

---

### Task 17: Side-by-side comparison with sibling pages

**Files:**
- No changes — verification only.

- [ ] **Step 1: Open the preview alongside production siblings**

Open three browser windows or tabs side-by-side:
- Preview About: `https://link-renovations-preview.dustin-link0209.workers.dev/about.html`
- Production Portfolio: `https://link-renovations.dustin-link0209.workers.dev/portfolio.html`
- Production Process: `https://link-renovations.dustin-link0209.workers.dev/process.html`

(Open Process and Portfolio from the production worker — they haven't changed, so production is the reference.)

- [ ] **Step 2: Compare visual rhythm**

Scroll all three at similar pace. Confirm:
- Page header pattern matches across all three (eyebrow tag → title → photo background).
- Section padding "feels" similar (100px top/bottom on all three).
- Card grid pattern consistent (1px gap, dark background between cards, hover transforms).
- Typography matches (Montserrat headings, Open Sans body, red eyebrow tags).
- Color palette identical (`#0a0a0a` / `#0d0d0d` darks, `#b01020` red).

- [ ] **Step 3: Note any visual drift**

If About looks like a stranger compared to Portfolio/Process, identify what's different (padding? font size? color?) and fix in source. Re-deploy to preview and re-check until About reads as a sibling.

---

### Task 18: Real device check

**Files:**
- No changes — verification only.

- [ ] **Step 1: Open the preview URL on an actual phone**

On an iPhone or Android device, open `https://link-renovations-preview.dustin-link0209.workers.dev/about.html` in mobile Safari (iPhone) or Chrome (Android).

- [ ] **Step 2: Confirm mobile-specific behaviors**

Check:
- Top nav shows the hamburger button (not the full desktop nav links).
- Tapping the hamburger opens the mobile drawer (from `shared.js` `toggleDrawer()`).
- "Who We Are" link in the drawer is highlighted as active.
- The page reads top-to-bottom without horizontal scroll.
- 2×2 card grid renders correctly (4 cards visible without excessive scroll).
- Trust strip wraps cleanly to 2 lines.
- Photos render at acceptable resolution (no obvious blurriness from the existing image filter).
- Final CTA button is large enough to tap easily.
- Back-to-top button (from `shared.js`) appears after scrolling and works.

- [ ] **Step 3: Note any device-specific issues**

If anything looks broken on a real phone that didn't show in devtools, capture it (screenshot if possible), return to the relevant Phase 2 task, fix in source, redeploy to preview, re-test on the phone.

---

### Task 19: Production deploy

**Files:**
- No changes — deploy only.

- [ ] **Step 1: Final go/no-go check**

Confirm all the following before deploying to production:
- Local file:// spot check passed (Task 14).
- All four widths look right on the preview URL (Task 16).
- Sibling-page comparison shows visual consistency (Task 17).
- Real phone check passed (Task 18).
- All Phase 2 commits are in `git log`.

If any is "no" or "unsure", STOP and re-QA. Do not deploy to production with known issues.

- [ ] **Step 2: Deploy to production**

Working dir: `/Users/dustinlink/link-renovations-website/`

```bash
npx wrangler deploy
```

Note: NO `--env preview` flag. This deploys to the production `link-renovations` worker.

Expected output ends with:
```
Deployed link-renovations triggers (X.YYsec)
  https://link-renovations.dustin-link0209.workers.dev
```

- [ ] **Step 3: Hard-refresh the production URL**

Open `https://link-renovations.dustin-link0209.workers.dev/about.html` in a desktop browser. Hard-refresh (Cmd+Shift+R / Ctrl+Shift+R). Confirm the compacted layout is now live.

- [ ] **Step 4: Production smoke test**

Quick sanity check on production:
- About page loads without errors.
- All 4 sections present (header, Who We Are, Meet Nick, CTA).
- Trust strip visible.
- 4 Standard cards in a row at desktop width.
- Top nav still works (click Home, click back to Who We Are).
- Free Estimate button at top-right still goes to contact.html.

- [ ] **Step 5: No commit needed (production deploy is the milestone)**

The work is complete. The git repo's `main` branch already contains all the source commits from Phase 2; Phase 3 is purely deployment + verification with no code changes.

---

## Self-Review Notes

**Spec coverage:** Each numbered Acceptance Criteria from the spec maps to a Phase 2 task: criterion 1 → Tasks 4/6/7/10 (sections removed/restructured); 2 → Tasks 8/10; 3 → Task 9; 4 → Task 6; 5 → Task 7; 6 → Task 4; 7 → Task 5; 8 → Task 13; 9 → Task 11; 10 → Tasks 15-19.

**Placeholder scan:** No "TBD"/"TODO"/"implement later" anywhere. Each step contains the actual edit (CSS or HTML) verbatim, exact file paths, exact commands, and expected outputs.

**Type/identifier consistency:** `.trust-strip`, `.trust-sep`, `.trust-stars` introduced in Task 9 and not renamed elsewhere. `env.preview` worker name `link-renovations-preview` is used consistently in Tasks 1, 2, 3, 15, 16, 17, 18. `mobile.css` line 222 is referenced in Task 11 (the `1fr` rule we override) — that line number reflects the file at time-of-spec; if mobile.css has been edited since, search for `.standard-grid` in mobile.css to find the actual line.

**Scope:** Single page change with one infrastructure prerequisite. Appropriate for a single plan.

**Out-of-scope creep avoided:** No edits to `shared.css`, `shared.js`, `mobile.css`, or any other HTML page. Wrangler config and MOBILE_PARITY.md are scoped to documented prerequisites only.
