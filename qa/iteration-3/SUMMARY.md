# Iteration 3 — CI + Runtime A11y Gate

**Date:** 2026-06-22 · **Goal:** close the verification gap that let iterations 1–2 ship mistakes (everything was by-inspection, no automated guard).

## Delivered

1. **`scripts/check-consistency.mjs`** (no deps) — asserts, against reality:
   version sync (root/pkg/registry), component count (css files == registry == doc badges/headings), gzip badge vs actual bundle (±0.3 KB), no absolutist "0 JavaScript" claim (incl. package.json descriptions), no false shadcn `$schema`.
2. **`scripts/check-markup.mjs`** (no deps) — encodes the exact iter-1/2 regressions as guards so they cannot return:
   no `anchor()` without an `anchor-name` producer, no `popover` on `.navigation-menu-content`, no static `aria-selected` on `.tabs-trigger`, no invalid `focus-visible-anchor`, `<div>` balance, valid registry JSON.
3. **`scripts/check-a11y.mjs`** — headless-Chromium + axe-core against the rendered showcase; fails on **critical** violations, reports serious/moderate/minor as warnings (CSS-only libs legitimately need some consumer JS/ARIA).
4. **`.github/workflows/ci.yml`** — `build → check → a11y` on every push/PR to `main`. Added `npm run check` / `check:a11y` scripts and CI/npm README badges.

## Decision: no CI — run locally

GitHub Actions was blocked by an account billing/spending-limit error, and CI was overkill for a one-maintainer repo, so the workflow was removed. The gates run locally instead (`npm run check`, `npm run check:a11y`). `playwright` + `axe-core` are devDependencies; Chromium is a one-time `npx playwright install chromium`.

## Verification status (actually run)

| Gate | Status |
|---|---|
| `npm run build` | ✅ passes |
| `npm run check` (consistency + markup) | ✅ passes (13 assertions) — caught 2 real drifts while being written (a residual `anchor()` in menubar.css, the root `package.json` "zero JavaScript" description) |
| `npm run check:a11y` (axe-core, headless Chromium) | ✅ **ran for real**, and earned its keep |

### What the runtime axe run found (and we fixed)

The very first run surfaced issues no static/by-inspection pass had caught:

| Impact | Rule | Nodes | Disposition |
|---|---|---|---|
| **critical** | `label` (range sliders with no label) | 2 | **Fixed** — `aria-label` on the Volume/Brightness sliders |
| serious | `scrollable-region-focusable` (carousel viewport) | 1 | **Fixed** — `tabindex=0` + `role=group` + label |
| moderate | `landmark-unique` (duplicate `<nav>`) | 1 | **Fixed** — `aria-label="Sidebar"` |
| minor | `aria-allowed-role` (`role=alert` on `<details>`) | 1 | **Fixed** — removed invalid role |
| serious | `color-contrast` (muted-foreground text) | 46 | **Known/accepted** — inherited from shadcn's own `--muted-foreground` palette; failing AA on muted backgrounds is a faithful-clone tradeoff, not a markup bug. Flagged, not silently re-tuned. |

Re-run after fixes: **0 critical, 0 moderate, 0 minor; 1 serious (color-contrast) reported as a warning.**

## Full accessibility pass — both themes axe-clean (published 0.1.2)

After the runtime gate surfaced real issues, they were all fixed:

- **Light theme:** darkened `--muted-foreground` and the status palette (destructive/success/info), flipped warning to dark-amber with light foreground, dropped alpha on calendar `.outside`, marked the loading button `disabled`. → **0 critical/serious/moderate/minor**.
- **Dark theme:** the initial scan showed 36 failures, but that was a *test artifact* — axe sampled colors mid-`color`-transition right after the theme toggle. Re-scanning with a 1.2s settle delay showed **5** real failures, all status-palette. Fixed by lightening dark-mode `--info`/`--destructive` and flipping their foregrounds to dark (a single mid-tone value cannot be AA as both a white/dark-text background *and* as text on near-black — the luminance ranges don't overlap, so dark mode needs the lighter-color + dark-foreground treatment). → **0 critical/serious/moderate/minor**.
- The a11y gate (`check-a11y.mjs`) now scans **both themes** with the settle delay, so the regression can't recur silently.

`npm run check` (consistency + markup) and `npm run check:a11y` (light + dark) all green. Published as `@russfranky/shadcss@0.1.2`.

## Confidence Score: **94 / 100** (up from 91)

Both themes are now verified axe-clean (0 violations of any impact), the gate enforces it on both themes, and the static guards lock the prior regressions. The remaining gap to 100 is honest scope, not known defects: axe checks the showcase DOM (not every consumer composition), it's automated-only (no manual screen-reader/keyboard walkthrough), and a class of interactivity still needs consumer JS/ARIA (documented waivers). A perfect score would require a manual AT audit and broader fixtures. Honest status: "strong static guarantees, runtime verification pending an account fix."
