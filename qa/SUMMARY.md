# shadcss-ui — QA Validation Report (Phases 1–6)

**Last Tested Date:** 2026-06-22
**Phase status:** Phases 1–5 COMPLETE. Phase 6 recursive loop: one full iteration complete; exit criteria met except the npm-publish action (owner task).

---

## Coverage Summary

| Metric | Count |
|---|---|
| Features audited | 97 |
| Test cases executed | 408 |
| Defects logged (Phase 3) | 155 |
| Defects **Fixed** | 125 |
| Defects **Waived** (explicit) | 27 |
| Defects **Pending-publish** | 3 |
| Defects **Open** (unresolved) | **0** |

---

## Phase 4–5 Outcome — by original severity

| Severity | Logged | Fixed | Waived | Pending-publish | Open |
|---|---|---|---|---|---|
| Critical | 0 | 0 | 0 | 0 | 0 |
| High | 9 | 7 | 0 | 2 | 0 |
| Medium | 72 | 61 | 11 | 0 | 0 |
| Low | 74 | 57 | 16 | 1 | 0 |
| **Total** | **155** | **125** | **27** | **3** | **0** |

**Regressions introduced by remediation:** 2 found, 2 fixed in-pass (dead README anchor; a stale calendar header comment). Lightning CSS build passes; HTML tag-balanced; registry.json valid.

---

## Feature roll-up (quality-tracker.csv)

| Current Status | Features |
|---|---|
| PASS (remediated) | 79 |
| PASS | 18 |
| FAIL | 0 |

---

## What was fixed (themes)

1. **False public claims corrected.** "0 lines of JavaScript" reworded everywhere to the honest "no JS framework / the CSS bundle ships 0 JS; native `<dialog>`/Popover/toast need a one-line native trigger." Component count unified to **52**, gzip to **16.0 KB**, version to **0.1.0** across all files. Non-affiliation disclaimer added.
2. **Registry honesty.** Removed the false `"$schema": "ui.shadcn.com/schema.json"` (it never conformed); added a `note` declaring it a bespoke shadcss manifest. Added the missing `container` entry (now 52 = 52 css files), fixed class lists and deps, enriched example markup with ARIA.
3. **Broken dev preview fixed.** Build now copies `dist/shadcss.min.css` into `apps/www/`; showcase links `./shadcss.min.css`; dead `registry.json`/`AI_GUIDE.md` links repointed.
4. **Accessibility pass on showcase + registry markup.** Added `role=tablist/tab/tabpanel`+`aria-selected`, `role=menu/menuitem`, `role=alert`, `role=status`/`aria-live`, `aria-current=page`, `aria-pressed`, `role=separator`, `aria-label` on icon-only buttons, `role=alertdialog`+`aria-labelledby`.
5. **Real CSS bug fixes.** Reduced-motion guards, distinct `--z-popover`, `@layer` priming line, `:user-invalid` validation, duplicate `.radio-group` removed, btn-group corner/vertical/`btn-link` rules, Firefox progress transition, scoped skeleton/aspect-ratio/input selectors, hover-card default-hidden, sheet/drawer default side, popover `bottom-*` variants, anchor-positioning `@supports` fallbacks, removed invalid `focus-visible-anchor` property, dark-mode status tokens.
6. **Packaging.** Resolved pnpm-vs-npm (npm + `package-lock.json`; removed `pnpm-workspace.yaml`); pinned `serve`; removed dead read in build.mjs; `publishConfig.access=public`.

---

## Waivers (27) — all explicit, categorized

These are **inherent CSS-only limitations**, now honestly documented in code/docs rather than hidden:

- **RequiresConsumerJS (interactive behavior CSS cannot provide):** OTP auto-advance, carousel arrows/dots seek, slider drag-fill, command fuzzy-search, sidebar collapse, mobile drawer toggle, avatar `onerror` fallback, toast/popover programmatic dismiss, theme persistence, opening native `<dialog>`/popover.
- **RequiresConsumerARIA (markup the consumer must add):** roving-focus menu keyboard nav, `menuitemcheckbox`, programmatic error association, tooltip AT exposure.
- **PlatformLimit / CosmeticAccepted:** tooltip viewport-collision, Firefox per-element scrollbar sizing, strict-CSP inline triggers, `:has()` pre-fallback.

Every waiver is the kind of thing shadcn solves *with* React/Radix JS — shadcss now states clearly where a one-line native trigger or consumer ARIA is required, instead of implying it's free.

---

## Pending-publish (3) — requires owner action

- **D-005 / D-006** — `npm install shadcss` and the unpkg CDN URL resolve **once the package is published**. Package is publish-ready (name, version 0.1.0, files, exports, `publishConfig.access=public`).
- **D-087** — reserve the npm name by publishing.

**Action:** `npm publish --workspace=packages/shadcss` (needs your npm auth). Not run automatically.

---

## Remaining Risks

- **Not runtime-verified.** This is rigorous static analysis; no screen reader / axe-core / real-browser run was executed. The a11y markup is correct by inspection but unproven against AT.
- **Pending publish.** Until `npm publish` runs, the install/CDN claims remain aspirational (now the only externally-false-until-action items).
- **Interactive parity is documented, not closed.** Menus/tabs/command still need consumer JS+ARIA for full Radix-equivalent keyboard behavior — by design for a zero-runtime library.
- **No CI guard yet.** Nothing prevents the registry/count/version from drifting again; a build-time assert (D-129 idea) is recommended but not added.

---

## Confidence Score: **83 / 100**

**Justification (honest, not inflated):**

- **+** All 9 original High-severity defects resolved or reduced to the single owner-action of publishing. **Zero open Critical/High/Medium/Low** functional defects.
- **+** The repo is now **internally consistent and honest**: claims match code, version/count/size unified, registry no longer misrepresents itself, dev preview works, build is green at 16.0 KB.
- **+** Real CSS bugs fixed with localized, validated edits; remediation introduced only 2 regressions, both fixed.
- **−** Not runtime/AT-tested — a11y correctness is by-inspection only (caps the score below ~90).
- **−** Install/CDN remain unproven until `npm publish` (owner action).
- **−** No CI/regression guard committed yet; future drift is possible.
- **−** 27 waivers mean a class of interactivity genuinely still needs consumer code — legitimate for a CSS-only library, but it is *not* a drop-in Radix replacement, and the score reflects "honest and shippable," not "feature-equal to shadcn."

**83/100** = "real, honest, internally-consistent, and shippable as a CSS-first library — pending the publish action and a future runtime-a11y + CI pass." Up from the pre-remediation **34/100**.

---

## Phase 6 — next iteration would target

1. Publish to npm + verify install/CDN (closes the 3 Pending-publish).
2. Add CI: build + a registry/count/version consistency assert + HTML validation.
3. Runtime a11y pass (axe-core + manual screen-reader) to convert by-inspection ARIA into verified.
4. Optionally ship a tiny optional `shadcss.js` (opt-in) for the documented JS-required interactions, to shrink the waiver set.
