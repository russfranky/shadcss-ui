# shadcss-ui — Iteration 2 QA Summary

**QA date:** 2026-06-22
**Scope:** Re-validation of iteration-1 remediations plus fresh adversarial testing across the full component library, build/distribution pipeline, registry manifest, showcase markup, and cascade-layer integrity.

## Coverage Summary

| Metric | Count |
|---|---|
| Features tested | 102 |
| Test cases executed | 354 |
| PASS | 268 |
| WAIVED | 26 |
| FAIL | 60 |
| BLOCKED | 0 |
| Features PASS (all PASS/WAIVED) | 57 |
| Features FAIL (>=1 FAIL) | 45 |

WAIVED = genuine platform/CSS limits or accepted design tradeoffs, re-validated this iteration. BLOCKED = none. No live browser was available; vertical-slider and a few render-dependent cases are explicitly WAIVED on that basis, not blocked.

## NEW Defects by Severity

All 60 FAILs are open defects this iteration. No Critical findings.

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 9 |
| Medium | 13 |
| Low | 38 |

## Defect Breakdown by Kind

Across the 60 open defects:

| Kind | Defects |
|---|---|
| incorrect-fix | 31 |
| new | 17 |
| regression | 6 |
| waiver-revalidated (re-opened) | 5 |
| preexisting | 1 |

For context, across all 354 test cases the classification distributes as:

```
regression: 127   none: 99   waiver-revalidated: 34
new: 62           incorrect-fix: 31   preexisting: 1
```

The dominant defect signature is **incorrect-fix (31/60)**: iteration-1 remediations recorded as "Fixed" but applied to only one surface (a CSS comment, the tracking sheet, or the registry) and never propagated to the markup/registry/showcase the fix actually needed to touch. The library CSS is in good shape; the gap is consistently the wiring in apps/www/index.html and registry.json.

## Top Defects (by severity, then blast radius)

1. **D2-001 / D2-008 / D2-009 — CSS anchor-positioning has no anchor source (High).** OVL2-001-T1, SHO2-002-T1, MNU2-002-T1, REG2-003-T1: the @supports(anchor-name) blocks in popover.css, dropdown.css and menubar.css consume anchor(bottom)/anchor(start) and reset inset:auto, but no element sets anchor-name on a trigger or position-anchor on a panel. popovertarget does not establish an implicit anchor in shipping browsers, so on exactly the anchor-capable browsers the @supports block matches it strips the working [data-side] inset fallback and anchor() has no target — positioning is worse than before the fix. Highest-impact issue; recurs across popover/dropdown/menubar.
2. **D2-002 / D2-003 — Navigation-menu ships popover against its own contract (High).** navigation-menu.css:8-10 forbids popover (the D-002 fix), yet index.html:1356,1413 and the registry still add it, re-introducing the top-layer-vs-position:absolute detachment bug in the shipped demo and manifest.
3. **D2-004 / D2-005 — Tabs ARIA is permanently stale (High).** aria-selected is a static literal on label role=tab while selection lives on the hidden :checked radio. CSS cannot mutate the attribute, so a screen reader always reports the wrong selected tab after a switch. The honest CSS-only model is a radiogroup, not a tablist.
4. **D2-006 / D2-007 — Resizable handle broken for AT and layout (High).** Registry markup is a bare div.resizable-handle with no tabindex/role/aria so the :focus-visible style is dead; grid-auto-columns:1fr gives the handle its own full 1fr track so the "4px divider" renders as a wide empty column. Survived iteration-1 because the component is never demoed.
5. **Medium cluster — partial ARIA composites in showcase markup.** Calendar grid (role=grid with no role=row, gridcell on 2 of ~33 cells), carousel dots (role=tablist with non-tab children), hover-card touch fallback unwired, registry tablist containing focusable radios. Same root cause: roles added to one element without required siblings/relationships.
6. **Medium — absolutist "zero JavaScript" claim survives in shipped metadata.** package.json:4 (the npmjs.com surface) and registry.json:5 still say "zero JavaScript" while the READMEs were softened to "no JS framework / one-line triggers."

## Did any iteration-1 fix REGRESS?

Yes. Six FAILs are classified regression, and several incorrect-fix items are functionally regressions of D-002/D-043-class anchoring:

- D-002 navigation-menu popover (D2-002/D2-003): CSS contract set but markup re-added popover — original bug is live again.
- Anchor positioning (D-060/D-127/D-043 -> D2-001/D2-008/D2-009): the @supports fix removes the working inset fallback on anchor-capable browsers with no anchor wired.
- Resizable 1fr handle (D2-007): D-120's default grid-auto-columns:1fr directly causes the wide-handle regression.
- OTP eager :invalid (CTL2-003-T2): iter-1 upgraded input/textarea to :user-invalid but missed input-otp.css, so prefilled OTP flashes destructive red on load.
- Fresh-clone showcase (DST2-001-T2): the gitignored www copy plus a no-op apps/www build script means a clean clone renders unstyled with no surfaced instruction.

No iteration-1 CSS-internal fix that was applied to the actual rule regressed — every regression is a fix that lived only in a comment/sheet and was contradicted by un-updated markup.

## Remaining Risks

- Anchor-positioning is the largest open risk (4 components); the fallback removal makes modern browsers worse — top of the iter-3 queue.
- Showcase/registry markup is the systemic weak point — CSS is correct, wiring lags. A markup-vs-CSS reconciliation sweep (anchor-name, ARIA relationships, role children, focusability, role=switch, OTP labels, scope attributes) clears the bulk of the 31 incorrect-fix defects.
- Re-opened waivers (5): collapse/drawer/overlay/sidebar "needs JS" toggles are now achievable via :has()/:target/checkbox; the select:invalid validation gate is over-broad on load. Low but real.
- Publish hygiene: no prepublishOnly/prepack hook (DST2-007-T1) risks shipping stale dist; unpinned CDN URLs (REG2-007-T3); bare @import documented without a bundler caveat (SHO2-008-T2).
- No live-browser verification this iteration — vertical slider fill alignment and a couple of render-order cases are WAIVED on static-analysis grounds, not confirmed.

## Confidence Score: 78 / 100

Down from the prior 86.

- The build/distribution/packaging surface is genuinely solid: deterministic rebuilds, correct gitignore scoping, clean tarball (no qa/HANDOFF leakage), resolvable exports, accurate 52-component/16.0 KB-gzip claims, intact cascade-layer precedence. That breadth keeps confidence well above the midpoint.
- But this iteration uncovered 9 High defects, including a regression of the flagship D-002 fix and an anchor-positioning "fix" that makes modern browsers worse. Crucially, 31 of 60 defects are incorrect-fixes — items the iteration-1 record marked "Fixed" that were not actually delivered to the shipping surface. That systematically undermines trust in the prior pass's "Fixed" verdicts, which is the specific reason to revise confidence down rather than up despite the clean build pipeline.
- Severity is bounded (0 Critical; the Highs are positioning/ARIA correctness, not data-loss or security), and every defect has a concrete low-risk fix concentrated in two files (apps/www/index.html, registry.json) plus three anchor CSS blocks. That tractability is why the score lands at 78 and not lower.

## Note: Phases 4-6 (iteration-2 follow-up)

- Phase 4 — Remediation: prioritize the 9 Highs first: wire anchor-name/position-anchor (or guard @supports to preserve the inset fallback) across popover/dropdown/menubar; strip popover from navigation-menu markup; resolve tabs ARIA by reverting to radiogroup semantics or adding a one-line JS sync; fix the resizable handle track (flex or max-content grid). Then sweep the incorrect-fix cluster (markup/registry wiring) and re-opened waivers.
- Phase 5 — Re-verification: re-run this 354-case battery after remediation with live-browser confirmation of anchor positioning, vertical slider, tabs/calendar/carousel AT trees, and the fresh-clone showcase render — the cases WAIVED on static-analysis grounds this round.
- Phase 6 — Sign-off: gate release on 0 High open, no package.json/registry.json "zero JavaScript" absolutism, a prepublishOnly build hook, and pinned CDN URLs; target confidence >= 88 before publishing 0.1.x.
