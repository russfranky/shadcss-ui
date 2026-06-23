# Changelog

All notable changes to shadcss are documented here. The framework follows
[Semantic Versioning](https://semver.org/) — within `0.x`, minor-version bumps
may include refinements; patch bumps are fixes and docs. Pin a version in
production (`@russfranky/shadcss@0.1.4`) so a future change can't surprise you.

## @russfranky/shadcss-js 0.1.0
- New optional helpers package: `menu` (dropdown/menubar keyboard nav — roving
  focus, type-ahead, Escape + focus return, menu roles) and `tabs` (full ARIA
  tabs + arrow-key nav). ~1 KB each, zero deps, opt-in via data-attributes,
  no global runtime. Components stay accessible native HTML without them.

## 0.1.10
- Docs: overlay components show a "open it in the live demo" note instead of an
  empty preview (closed overlays are correctly hidden). Component a11y notes now
  reference the optional shadcss-js helpers where relevant.

## 0.1.9
- **Honest per-component metadata + AI contracts.** registry.json now carries
  `status`, `js` (none/trigger/consumer), `support`, and an `a11y` contract for
  every component (35 zero-JS, 9 one-line-trigger, 8 consumer-JS). Generated
  `llms.txt` (served at /llms.txt) so AI agents emit correct, accessible markup.
  `shadcss info` surfaces the new fields.

## 0.1.8
- **Existential overlay hardening.** Add a global `dialog:not([open])` /
  `[popover]:not(:popover-open) { display:none !important }` guard in the reset
  layer so a closed overlay can never render — even if a component or a consumer
  sets `display` on it. Covers the bug class that shipped twice. A markup-check
  assertion prevents the guard from being removed; the runtime a11y gate already
  fails on any visible closed overlay.

## 0.1.7
- **Visual QA pass (rendered, not static).** A screenshot-based review of the live
  showcase caught what code gates couldn't: the **sheet/drawer dialogs rendered
  always-open** (display:flex overrode the UA closed-state), **toasts stretched to
  full-viewport** as popovers, the **dialog over-stretched** to 85vh, and **autofill**
  painted dark-mode inputs light. All fixed. See qa/visual/.

## 0.1.6
- **Fix: closed popovers could render visible.** Components that set `display` on
  a `[popover]` element (`.command`, `.sonner`) overrode the UA closed-state
  `display:none`, so they floated over the page until triggered (caught by an
  actual visual review of the deployed demo, not the automated gates). Re-assert
  `[popover]:not(:popover-open){display:none}` in the components layer.

## 0.1.5
- **Component parity pass (vs shadcn/ui).** Grounded 52-component audit found 39
  gaps; closed the 21 high-confidence ones: `aria-invalid` error state on all form
  controls + field, auto-sized inline icons on buttons/badges, disabled states
  (dropdown/command/tabs), accordion focus ring, menubar open-trigger highlight,
  responsive alert-dialog footer, drawer handle, dropdown submenu, carousel vertical
  orientation, field horizontal orientation + group, sidebar menu-action/separator,
  kbd-group, breadcrumb-ellipsis. See `qa/parity/`.

## @russfranky/shadcss-cli 0.1.0
- New CLI: `add` (copy components + deps), `diff` (compare your copy to upstream),
  `list`, `info`, and `check` (lint HTML for a11y/markup foot-guns). Zero deps;
  fetches from the jsDelivr CDN.

## @russfranky/shadcss 0.1.4
- Publish `registry.json` + `AI_GUIDE.md` in the npm tarball so the CLI and AI
  tools can fetch them from the CDN.

## 0.1.3
- **Responsive by default.** Overlays (`popover`, `popover-sm/-lg`, `hover-card`)
  clamp to `min(size, 100vw - 2rem)`; OTP wraps; carousel viewport gets
  `min-width: 0`; the calendar grid shrinks. No horizontal overflow at 375px+.
- Docs: "Why shadcss" section mapping the common shadcn complaints to answers.

## 0.1.2
- **WCAG AA accessibility pass.** Darkened the status palette (destructive /
  success / info) and `--muted-foreground`, dark-amber warning, and dark-theme
  status colors so white-on-color and color-on-surface both clear AA.
  axe-core: 0 violations of any impact in both light and dark themes.

## 0.1.1
- Scope the package as `@russfranky/shadcss` (npm rejected the bare name as too
  similar to `shadcn`). Honest install/CDN snippets.

## 0.1.0
- Initial release: 52 zero-runtime HTML/CSS components in a shadcn-ui-style
  monorepo (`apps/www` + `packages/shadcss`), built with Lightning CSS.
  ~16 KB gzipped, zero dependencies.
- Grounded multi-pass QA: 155 + 60 defects found and resolved/waived; consistency
  + markup guards and an axe-core a11y gate added to prevent regressions.
