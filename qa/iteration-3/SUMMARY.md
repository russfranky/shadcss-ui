# Iteration 3 — CI + Runtime A11y Gate

**Date:** 2026-06-22 · **Goal:** close the verification gap that let iterations 1–2 ship mistakes (everything was by-inspection, no automated guard).

## Delivered

1. **`scripts/check-consistency.mjs`** (no deps) — asserts, against reality:
   version sync (root/pkg/registry), component count (css files == registry == doc badges/headings), gzip badge vs actual bundle (±0.3 KB), no absolutist "0 JavaScript" claim (incl. package.json descriptions), no false shadcn `$schema`.
2. **`scripts/check-markup.mjs`** (no deps) — encodes the exact iter-1/2 regressions as guards so they cannot return:
   no `anchor()` without an `anchor-name` producer, no `popover` on `.navigation-menu-content`, no static `aria-selected` on `.tabs-trigger`, no invalid `focus-visible-anchor`, `<div>` balance, valid registry JSON.
3. **`scripts/check-a11y.mjs`** — headless-Chromium + axe-core against the rendered showcase; fails on **critical** violations, reports serious/moderate/minor as warnings (CSS-only libs legitimately need some consumer JS/ARIA).
4. **`.github/workflows/ci.yml`** — `build → check → a11y` on every push/PR to `main`. Added `npm run check` / `check:a11y` scripts and CI/npm README badges.

## Verification status (honest)

| Gate | Status |
|---|---|
| `npm run build` | ✅ passes locally |
| `npm run check` (consistency + markup) | ✅ passes locally (13 assertions) — and immediately caught 2 real drifts while being written: a residual `anchor()` and the root `package.json` "zero JavaScript" description |
| `npm run check:a11y` (axe-core runtime) | ⚠️ **unverified** — Playwright/Chromium not run locally; **GitHub Actions is blocked by an account billing/spending-limit error**, so CI has not executed yet |

## Blocker (owner action)

GitHub Actions reports: *"The job was not started because recent account payments have failed or your spending limit needs to be increased."* The workflow is valid but cannot run until **Billing & plans** is resolved on the `russfranky` account (or run the checks locally / via another runner). Until Actions runs, the runtime axe-core gate remains unproven.

## Confidence Score: **88 / 100** (held, not raised)

The static guards are real and passing, and they permanently encode the prior regressions — a genuine improvement. But the score does **not** rise above 88 because the headline goal of iteration 3 — a *verified* runtime a11y pass — has not actually executed (billing-blocked). Confidence rises to ~92 the moment CI runs green; if axe surfaces criticals, it tells us something real we currently can't see. Honest status: "strong static guarantees, runtime verification pending an account fix."
