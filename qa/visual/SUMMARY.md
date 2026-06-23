# Visual QA Summary

12 distinct defects across the shadcss showcase screenshots (deduped from 19 raw findings; light+dark pairs of the same defect collapsed into single rows).

## Counts by severity

| Severity | Count |
|----------|-------|
| Critical | 5 |
| High     | 0 |
| Medium   | 4 |
| Low      | 3 |
| **Total**| **12** |

Note: the Tooltip and Command-palette overlays were each flagged "critical" in light mode and "high" in dark mode (the panel just blends into the dark background — the underlying overlap is identical). They are recorded once at the higher (critical) severity, so no rows land in the High bucket.

## Must fix (critical + high)

- **V-001 / V-002 — Toasts fill the entire viewport.** Both toast overlays stretch to ~full width and height instead of rendering as compact corner cards, obscuring the page. Add width/height constraints to the toast container.
- **V-003 — Dropdown menu open and mis-anchored.** A dropdown renders open by default over the top-right, detached from any trigger, clipping the intro text (light + dark).
- **V-004 — Tooltip section overlay.** An opaque panel floats over the right half of the section, clipping the description; visible in light, blends into dark but still overlaps (light + dark).
- **V-005 — Command-palette section overlay.** Same mis-positioned/auto-open popover panel covering the right half and clipping the description mid-word (light + dark).

These five are all overlay/positioning regressions and likely share a root cause (Popover-API elements rendering open and/or unsized).

## Medium / Low

- **V-006 (medium)** — OTP filled cells use light backgrounds in dark mode (light-mode token leak).
- **V-007 (medium)** — Dark-mode badges use raw saturated light-mode colors; yellow 'Away' badge fails contrast with white text.
- **V-008 (medium)** — Dialog has a ~150px dead gap between the form and the footer (light + dark).
- **V-009 (medium)** — Sheet backdrop does not dim the sidebar / full viewport.
- **V-010 (low)** — 'Notifications' switch thumb bulges past the track edge.
- **V-011 (low)** — Alert dismiss 'X' vertically centered instead of aligned to the title row (light + dark).
- **V-012 (low)** — Spinner row has inconsistent sizes and stray red/green tints.

## Visually clean

39 screenshots were judged visually clean (no defects raised).

---

## Remediation (visual pass, 0.1.7)

**Real defects fixed (7 → 5 root causes):**
- **Floating sheet (V-003/4/5, critical) + sheet backdrop (V-009):** `dialog.sheet`/`dialog.drawer` set `display:flex` unconditionally, overriding the UA `dialog:not([open]){display:none}` — so the sheet rendered always-open over content. Re-asserted `dialog.sheet:not([open]){display:none}` (and drawer). Now opens only via `showModal()` with a full-page backdrop.
- **Toast stretched to full viewport (V-001/2, critical):** a `.sonner`/`.toast` opened as a `[popover]` inherits the UA `inset:0` and stretched. Pinned `.sonner[popover]`/`.toast[popover]` to a fixed-width corner card.
- **Dialog over-tall with empty gap (V-008):** modal `inset:0` + `width:100%` stretched the dialog to ~85vh. Added `height: fit-content` to `.dialog` and `.alert-dialog` (716px → 452px, hugs content).
- **OTP/inputs light fill in dark (V-006):** browser autofill painted valued inputs light. Added `:autofill` / `:-webkit-autofill` override to keep the theme background.

**Waived / false positives (4):** badge dark text is legible (V-007); alert dismiss X is top-aligned (V-011); spinner demo variety is intentional (V-012); switch-thumb metric is not a real defect (V-010).

**Verified:** dialog 452px, sheet modal with full backdrop, toast 384×67 corner card, OTP dark cells themed; a11y 0/0/0/0 both themes; consistency + markup green.
