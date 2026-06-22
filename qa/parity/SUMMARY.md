# shadcss Component-Parity Audit (vs shadcn/ui)

**Total gaps: 39** across 28 component files.

This is a parity-gap inventory, not a defect list. shadcss already mirrors shadcn closely on layout, color tokens, sizes, and core interaction states; the gaps below are mostly missing sub-parts (e.g. submenu surfaces, group wrappers) and missing attribute-driven states (notably `aria-invalid`).

## Breakdown by impact

| Impact | Count |
|--------|-------|
| High   | 1     |
| Medium | 22    |
| Low    | 16    |

## Breakdown by type

| Type    | Count |
|---------|-------|
| part    | 17    |
| state   | 13    |
| variant | 5     |
| a11y    | 2     |
| size    | 1     |
| polish  | 1     |

## Confidence

| Confidence | Count |
|------------|-------|
| High   | 21 |
| Medium | 15 |
| Low    | 3  |

## Cross-cutting theme: aria-invalid error state

The single biggest pattern is that form controls key their error state off native CSS pseudo-classes (`:invalid`, `:user-invalid`) instead of the `[aria-invalid="true"]` attribute that shadcn (and react-hook-form / the Field component) actually sets. This means form-library-driven validation — the standard shadcn path — produces **no destructive styling** in shadcss. Affected: `input`, `textarea`, `select`, `checkbox`, `radio`, and `field` (`data-invalid`). `.input` is the only one already using a destructive treatment, but even it lacks the `aria-invalid` hook. Fixing this family is low-risk (additive selectors) and high-value for real forms.

## Recommended to implement (high/medium impact AND high confidence) — 19

1. **dropdown.css — disabled item state** (HIGH / high) — only High-impact gap. Disabled items currently stay fully interactive and opaque.
2. **input.css — aria-invalid error state** (med/high) — see cross-cutting note.
3. **textarea.css — aria-invalid error state** (med/high)
4. **select.css — aria-invalid error state** (med/high)
5. **checkbox.css — aria-invalid error state** (med/high)
6. **radio.css — aria-invalid error state** (med/high)
7. **field.css — horizontal orientation** (med/high) — needed for switch/checkbox rows and settings forms.
8. **button.css — auto-size child SVG icons** (med/high) — size-4 + pointer-events:none + shrink-0.
9. **badge.css — auto-size child SVG icons** (med/high) — size-3.
10. **accordion — :focus-visible ring** (med/high, a11y) — keyboard focus ring missing; inconsistent with sibling .collapsible-trigger.
11. **alert-dialog.css — responsive footer** (med/high) — flex-col-reverse on mobile, right-aligned row on sm+.
12. **drawer.css — drag-handle part** (med/high) — the vaul pill handle.
13. **dropdown.css — submenu primitives** (med/high) — SubTrigger + SubContent.
14. **menubar.css — open-trigger state** (med/high) — data-state=open keeps trigger highlighted.
15. **carousel.css — vertical orientation** (med/high)
16. **command.css — disabled item state** (med/high)
17. **tabs — disabled trigger state** (med/high)
18. **sidebar — SidebarMenuAction part** (med/high) — trailing per-item action button.
19. **kbd.css — KbdGroup wrapper** (med/high) — multi-key shortcut spacing.

(Also high-confidence but lower impact, reasonable quick wins: breadcrumb ellipsis part, sidebar separator part.)

## Skip / low-confidence (one-line reasons)

- **input-otp.css — active-slot caret** (low/low, polish) — native text caret of the focused input is functionally equivalent; no real gap.
- **field.css — FieldSeparator** (low/low) — niche divider; only needed for multi-section forms, easy to add later.
- **empty.css — EmptyContent body wrapper** (low/low) — consumers can compose body content with existing .empty-actions + utilities.
- **button.css — destructive-colored focus ring** (low/medium) — neutral ring is acceptable; cosmetic.
- **dropdown.css — inset item variant** (low/medium) — alignment nicety only relevant when mixing plain and check/radio items.
- **accordion — disabled trigger** (low/medium) — rarely used; revisit if disabled accordions appear in real usage.
- **calendar.css — primary fill on range endpoints** (low/medium) — current dual-attribute path renders correctly when both attrs are set; refactor, not a missing feature.
- **navigation-menu.css — active/current link** (low/medium) — apps often handle current-route highlight at the app level.
- **pagination — labelled prev/next buttons** (low/medium) — present but unstyled; defer to polish pass.
- **empty.css — default media slot** (low/medium) — only needed for image/avatar empty states.
- **field.css — FieldGroup** (low/medium) — spacing achievable with utilities today.
- **field.css — FieldSet/FieldLegend** (low/medium) — semantic-only grouping; add when radio/checkbox groups need a caption.
- **field.css — data-invalid hook** (med/medium) — valuable but ships naturally with the aria-invalid family work above; medium confidence on exact selector behavior.
- **slider.css — thumb keyboard focus ring** (med/medium, a11y) — worth doing, but pseudo-element focus targeting is browser-fragile; verify across engines before shipping.
- **context-menu.css — sub-content + disabled** (med/medium) — pairs with the dropdown submenu work; confirm context-menu reuses dropdown internals first.
- **toast.css — ToastAction part** (med/medium) — sonner.css already covers the action pattern; only needed if Radix Toast is used.
- **sidebar — menu-button size variants** (low/medium) — add when a tall brand/profile row is actually needed.
- **typography.css — large/small/muted helpers** (low/medium) — easily replicated with utilities; low demand.

## Where shadcss already has parity

Core variants/sizes, color tokens, hover/active/checked/disabled (on most controls), focus-visible rings (except accordion + slider thumb), animations, and dark mode are in place. `.input` already carries a destructive treatment (just not the aria-invalid hook). `sonner.css` already provides the action-button pattern that `toast.css` lacks. The audit surfaced **no** broken existing styles — only additive coverage gaps.

---

## Implemented (0.1.5)

Closed 21 of the recommended gaps (plus card-action + dropdown checkbox/radio in 0.1.4):

- **aria-invalid error state** (cross-cutting): input, textarea, select, checkbox, radio, and field (`data-invalid` / `:has([aria-invalid])`) — real forms drive validation via `aria-invalid`, which shadcss now honors.
- **Auto-size inline icons**: `.btn > svg` (size-4), `.badge > svg` (size-3).
- **Disabled states**: dropdown item, command item, tabs trigger.
- **States/parts**: accordion `:focus-visible` ring, menubar open-trigger highlight, alert-dialog responsive footer, drawer drag-handle, dropdown submenu (sub-trigger/sub-content), carousel vertical orientation, field horizontal orientation + field-group, sidebar menu-action + separator, kbd-group, breadcrumb-ellipsis.

**Deferred** (low impact/confidence, documented in gaps.csv): field-set/legend/separator, slider-thumb focus ring (browser-fragile pseudo targeting), context-menu sub-content (verify it reuses dropdown internals first), toast-action (sonner already covers it), navigation-menu active link, pagination labelled prev/next, empty media/content slots, dropdown inset variant, typography large/small/muted helpers, sidebar button size variants, calendar range-endpoint fill, destructive-colored button focus ring, OTP caret, accordion disabled.
