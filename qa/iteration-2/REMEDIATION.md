# Iteration 2 — Phase 4–6 Disposition

**Date:** 2026-06-22 · **Published:** `@russfranky/shadcss@0.1.1`

Iteration 2 found 60 open defects (0 Critical, 9 High, 13 Medium, 38 Low), dominated by **31 incorrect-fixes + 6 regressions** introduced by iteration 1's parallel remediation (cargo-culted ARIA/anchor fixes). All are now resolved or explicitly waived.

## Outcome

| Disposition | Count |
|---|---|
| Fixed | 56 |
| Waived (explicit, categorized) | 4 |
| **Open** | **0** |

Feature roll-up: 102 features, 0 FAIL (57 PASS, 45 PASS-remediated).

## The 9 High defects — root causes and fixes

1. **Broken anchor positioning (D2-001/004/009/021).** Iteration 1 added `@supports (anchor-name)` blocks that called `anchor()` with **no anchor producer** (popovertarget creates no implicit anchor) and clobbered the working `[data-side]` inset fallback — strictly worse on modern browsers. **Fix:** removed the broken `@supports` blocks from `popover.css`, `dropdown.css`, `menubar.css`; kept the dependency-free inset approximation; documented that real anchoring needs consumer-authored `anchor-name`/`position-anchor`.
2. **navigation-menu popover conflict (D2-002/003).** Iteration 1 "fixed" a comment but the showcase + registry still put `popover` on `.navigation-menu-content`, promoting it to the top layer where its `position:absolute` detached from the trigger — and the CSS had **no reveal mechanism at all**. **Fix:** added a pure-CSS `:hover`/`:focus-within` reveal to `navigation-menu.css` and removed `popover`/`popovertarget` from the markup.
3. **Lying tab ARIA (D2-005/008).** Static `aria-selected` on `role=tab` labels never updated (selection lives on the hidden radio; CSS can't sync attributes) → screen readers announced the wrong tab. **Fix:** dropped the fake `role=tab`/`role=tablist`/`aria-selected` and exposed the honest native `role=radiogroup` (labelled radios, arrow-key nav — genuinely accessible, zero JS).
4. **resizable handle (D2-006/007).** `grid-auto-columns:1fr` gave the divider its own full-width column; registry markup had no handle a11y. **Fix:** switched to flex (`panel flex:1`, handle fixed strip) and added `tabindex=0 role=separator aria-*` to the registry markup.

## Waivers (4) — honest, not faked

- **D2-010** PlatformLimit — a `popover` on the hover-card panel conflicts with the `:hover` reveal; touch support needs a separate author-wired popover instance (documented).
- **D2-039** RequiresConsumerJS — live `menuitemcheckbox` toggling needs JS; the static `role`/`aria-checked` is authored in the registry example.
- **D2-044** CosmeticAccepted — CSS-only icon-collapse stays attribute-driven; mobile collapse is delivered via the new `:checked ~ .sidebar` toggle (D2-013).
- **D2-052** Partial — visibility toggles re-opened and fixed (CSS `:has()`/`:checked`); genuine ARIA-role waivers remain.

## Key lesson encoded

The iteration-1 failure mode was **adding ARIA/anchor wiring that CSS cannot keep in sync** (static `aria-selected`/`aria-checked`, `anchor()` with no producer). The corrected rule, now applied throughout: if correct behavior needs consumer JS or consumer-authored ARIA, **expose the honest native semantics or waive with a reason — never fake it.**

## Confidence Score: **88 / 100** (up from 86)

- **+** All 9 iteration-2 High defects fixed and verified in code; 0 open; the cargo-culted iteration-1 fixes are corrected; published as 0.1.1.
- **+** The remediation made components *more* honest (native radiogroup tabs, real CSS nav reveal, flex resizable) rather than papering over with fake ARIA.
- **−** Still not runtime/AT-verified (by-inspection only); no CI guard yet — the same drift risk that let iteration 1's mistakes ship.
- **−** A class of interactivity still legitimately needs consumer JS/ARIA (waived, documented) — honest, but not a drop-in Radix replacement.

Next iteration would add CI (build + consistency assert + HTML/ARIA lint) and a runtime axe-core/screen-reader pass to convert by-inspection ARIA into verified — the only way past ~90.
