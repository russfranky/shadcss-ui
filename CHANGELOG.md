# Changelog

All notable changes to shadcss are documented here. The framework follows
[Semantic Versioning](https://semver.org/) — within `0.x`, minor-version bumps
may include refinements; patch bumps are fixes and docs. Pin a version in
production (`@russfranky/shadcss@0.1.4`) so a future change can't surprise you.

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
