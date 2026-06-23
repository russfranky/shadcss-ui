# shadcss

> **Zero-runtime UI with the shadcn aesthetic — no React, no Tailwind, no Radix, no hydration.**
> 52 HTML/CSS components and patterns for server-rendered, static, HTMX, Astro, and AI-generated apps. ~16.8 KB gzipped, zero dependencies, zero JS runtime. Complex widgets are clearly marked.

[![gzip size](https://img.shields.io/badge/gzipped-16.8%20KB-success)](./dist/shadcss.min.css)
[![no js framework](https://img.shields.io/badge/JS-no%20framework-black)](#)
[![components](https://img.shields.io/badge/components-52-blue)](#components-52)
[![deps](https://img.shields.io/badge/dependencies-0-blue)](#)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![AI-ready](https://img.shields.io/badge/AI--ready-registry%20%2B%20guide-orange)](./AI_GUIDE.md)

**▶ Live demo: [shadcss.vercel.app](https://shadcss.vercel.app)**

`shadcss` brings the shadcn/ui visual language to plain HTML and CSS. Where
shadcn uses React + Radix + Tailwind, shadcss is CSS you paste into any
server-rendered template — built on `:has()`, the Popover API, native
`<dialog>`, and design tokens.
**No JS framework. Zero dependencies. Zero framework lock-in.** The CSS bundle
ships 0 JS; native `<dialog>`/Popover/toast need a one-line native trigger
(`showModal()`/`showPopover()`).

> Not affiliated with, endorsed by, or sponsored by shadcn/ui. Inspired by its
> design language.

If you've ever looked at a shadcn component's `.tsx` file and thought *"why
is this a React hook?"* — this is for you.

---

## Why

shadcn changed how we think about components — copy them in, own the code.
But every component still ships a JavaScript file. Modern CSS can do it all:

| shadcn (React)         | shadcss (HTML + CSS)                       |
| ---------------------- | ------------------------------------------ |
| `<Dialog open={...}>`  | `<dialog open>` — native, with backdrop    |
| `<Accordion>`          | `<details><summary>` — free a11y           |
| `<DropdownMenu>`       | Popover API (`popover` attribute)          |
| `<Tabs>`               | `<input type="radio">` + `:has()`          |
| `<Tooltip>` + hook     | `::after` + `:hover`/`:focus-within`       |
| `<Progress>`           | `<progress>` — restyled native element     |
| `<Switch>` + state     | `<input type="checkbox">` styled as switch |
| `<Toast>` + viewport   | Popover API + CSS animation auto-dismiss   |
| `<Slider>` + state     | `<input type="range">` styled              |
| `<Command>` + `cmdk`   | Popover API + styled shell                 |
| `<Sheet>` + state      | `<dialog data-side>` + slide animation     |
| `<Sidebar>` (2500 LOC) | Pure CSS, 200 lines                        |

The cost of every kilobyte of JavaScript is parse time, hydration jank, and
framework lock-in. The cost of HTML + CSS is — nothing.

---

## Components (52)

shadcss covers the shadcn component set as CSS — 52 components and patterns; complex widgets are marked with their `js`/`support` needs (see [llms.txt](./llms.txt) or `shadcss info`):

| Component | File | Status |
| --- | --- | --- |
| accordion | `src/components/accordion.css` | ✅ |
| alert | `src/components/alert.css` | ✅ |
| alert-dialog | `src/components/alert-dialog.css` | ✅ |
| aspect-ratio | `src/components/aspect-ratio.css` | ✅ |
| avatar | `src/components/avatar.css` | ✅ |
| badge | `src/components/badge.css` | ✅ |
| breadcrumb | `src/components/breadcrumb.css` | ✅ |
| button | `src/components/button.css` | ✅ |
| calendar | `src/components/calendar.css` | ✅ |
| card | `src/components/card.css` | ✅ |
| carousel | `src/components/carousel.css` | ✅ |
| chart | (use tokens `--chart-1` through `--chart-5`) | ✅ |
| checkbox | `src/components/checkbox.css` | ✅ |
| collapsible | `src/components/collapsible.css` | ✅ |
| command | `src/components/command.css` | ✅ |
| container | `src/components/container.css` | ✅ |
| context-menu | `src/components/context-menu.css` | ✅ |
| data-table | (use `table.css` + dropdown) | ✅ |
| dialog | `src/components/dialog.css` | ✅ |
| drawer | `src/components/drawer.css` | ✅ |
| dropdown-menu | `src/components/dropdown.css` | ✅ |
| empty | `src/components/empty.css` | ✅ |
| field | `src/components/field.css` | ✅ |
| hover-card | `src/components/hover-card.css` | ✅ |
| input | `src/components/input.css` | ✅ |
| input-otp | `src/components/input-otp.css` | ✅ |
| kbd | `src/components/kbd.css` | ✅ |
| label | `src/components/label.css` | ✅ |
| menubar | `src/components/menubar.css` | ✅ |
| navigation-menu | `src/components/navigation-menu.css` | ✅ |
| pagination | `src/components/pagination.css` | ✅ |
| popover | `src/components/popover.css` | ✅ |
| progress | `src/components/progress.css` | ✅ |
| radio | `src/components/radio.css` | ✅ |
| radio-group | `src/components/radio-group.css` | ✅ |
| resizable | `src/components/resizable.css` | ✅ |
| scroll-area | `src/components/scroll-area.css` | ✅ |
| select | `src/components/select.css` | ✅ |
| separator | `src/components/separator.css` | ✅ |
| sheet | `src/components/sheet.css` | ✅ |
| sidebar | `src/components/sidebar.css` | ✅ |
| skeleton | `src/components/skeleton.css` | ✅ |
| slider | `src/components/slider.css` | ✅ |
| sonner | `src/components/sonner.css` | ✅ |
| spinner | `src/components/spinner.css` | ✅ |
| switch | `src/components/switch.css` | ✅ |
| table | `src/components/table.css` | ✅ |
| tabs | `src/components/tabs.css` | ✅ |
| textarea | `src/components/textarea.css` | ✅ |
| toast | `src/components/toast.css` | ✅ |
| toggle | `src/components/toggle.css` | ✅ |
| toggle-group | `src/components/toggle-group.css` | ✅ |
| tooltip | `src/components/tooltip.css` | ✅ |
| typography | `src/components/typography.css` | ✅ |

---

## Install

### CDN

```html
<!-- Pin a version in production so a future major can't silently break you. -->
<link rel="stylesheet" href="https://unpkg.com/@russfranky/shadcss@0.1.11/dist/shadcss.min.css">
```

### npm

```bash
npm install @russfranky/shadcss
```

```css
/* Bare-specifier @import resolves ONLY through a bundler (Vite, webpack,
   Parcel, esbuild…) that honors the package "exports"/"style" field. Plain
   CSS has no Node resolution, so this 404s without a bundler. */
@import "@russfranky/shadcss";

/* No bundler? Import the built file by explicit path instead: */
@import "@russfranky/shadcss/dist/shadcss.min.css";
```

### Copy a single component (shadcn-style)

Every component is a standalone CSS file in
[`src/components/`](./src/components). Copy what you need; the only shared
dependency is [`src/base/tokens.css`](./src/base/tokens.css).

---

## AI-friendly by design

shadcss ships three artifacts designed for AI agents to generate UI reliably:

### 1. `registry.json` — machine-readable component spec

Every component is described with: dependencies, classes, attributes, and
example markup. AI agents can parse this to know exactly which classes exist
and how to combine them.

```json
{
  "name": "button",
  "file": "src/components/button.css",
  "deps": ["base/tokens"],
  "classes": ["btn", "btn-secondary", "btn-outline", "btn-ghost",
              "btn-destructive", "btn-link", "btn-sm", "btn-lg",
              "btn-icon", "btn-group"],
  "markup": "<button class=\"btn\">Default</button>"
}
```

### 2. `AI_GUIDE.md` — pattern reference

The 7 patterns you'll use 95% of the time, with copy-paste examples:

1. Modal — `<dialog>` + `showModal()`
2. Dropdown — Popover API
3. Accordion — native `<details>`
4. Tabs — radios + `:has()`
5. Tooltip — `::after` + `:hover`
6. Selection — native inputs
7. Toast — Popover + CSS animation

Plus a checklist for generating code, common anti-patterns, and full
end-to-end examples (login form, app shell, data table, command palette,
settings page).

### 3. Predictable conventions

- Variants are **classes**, not data attributes: `class="btn btn-outline"`
- State uses **ARIA**: `aria-current`, `aria-pressed`, `aria-expanded`
- Styling uses **design tokens**: `hsl(var(--primary))`, never `#000000`
- Component files are **standalone** — copy one, get one
- The HTML is **semantic** — `<button>` not `<div>`, `<dialog>` not `<div>`

---

## Theming

All colors live as HSL channels in CSS custom properties. Override one
variable, the entire palette follows.

```css
:root {
  --primary: 250 84% 54%;       /* indigo */
  --primary-foreground: 0 0% 100%;
  --radius: 0.75rem;
}
```

Dark mode ships in two flavors:

```html
<!-- declarative -->
<html data-theme="dark">

<!-- automatic -->
<html>  <!-- follows prefers-color-scheme -->
```

Tokens are organized into 12 groups: surfaces, brand, status, borders,
sidebar, chart, radii, typography, spacing, elevation, motion, z-index.

---

## Build

```bash
npm install
npm run build          # one-shot
npm run dev            # watch
```

Output:

```
dist/shadcss.css        ~165 KB  (expanded)
dist/shadcss.min.css    ~137 KB  (minified)
gzipped             ~16.0 KB (over the wire)
```

[Lightning CSS](https://lightningcss.dev/) handles bundling, minification, and
syntax lowering. Browser targets: Chrome 111+, Firefox 113+, Safari 16+.

---

## Browser support

| Feature              | Chrome | Firefox | Safari |
| -------------------- | ------ | ------- | ------ |
| `:has()`             | 105    | 121     | 15.4   |
| Popover API          | 114    | 125     | 17     |
| `<dialog>`           | 37     | 98      | 15.4   |
| `dialog.showModal()` | 37     | 98      | 15.4   |
| `color-mix()`        | 111    | 113     | 16.2   |
| CSS Nesting          | 112    | 117     | 16.5   |
| `details[name]` exclusive | 129 | —     | TP     |
| `interpolate-size`   | 129    | —       | 26     |

The `interpolate-size: allow-keywords` feature (used by the accordion's smooth
open animation) is the only feature that requires the latest browsers.
Graceful degradation: the content still shows/hides, it just snaps instead of
animating.

---

## Comparison

| Framework       | JS?     | Gzipped | React dep? | Copy-paste? | Components |
| --------------- | ------- | ------- | ---------- | ----------- | ---------- |
| shadcn/ui       | ✅      | varies  | ✅         | ✅          | 50+        |
| Radix           | ✅      | varies  | ✅         | ❌         | 40+        |
| Mantine         | ✅      | varies  | ✅         | ❌         | 100+       |
| Bootstrap       | ✅      | ~25 KB  | ❌         | ❌         | 20+        |
| Bulma           | ❌      | ~20 KB  | ❌         | ❌         | 30+        |
| **shadcss**     | **no framework¹** | **16.0 KB** | **❌**  | **✅**      | **52**     |

¹ No JS framework: the CSS bundle ships 0 JS. Opening native `<dialog>`,
Popover, and toast components needs a one-line native call
(`showModal()`/`showPopover()`) — there is no runtime, hydration, or
state library.

---

## Project structure

This package (`packages/shadcss`) within the [`shadcss-ui`](https://github.com/russfranky/shadcss-ui) monorepo:

```
packages/shadcss/
├── src/
│   ├── base/
│   │   ├── reset.css        ← modern reset
│   │   ├── tokens.css       ← 12 token groups (REQUIRED)
│   │   └── theme.css        ← token helpers
│   ├── components/          ← 52 standalone component files
│   └── shadcss.css          ← main entry, @imports all
├── dist/
│   ├── shadcss.css          ← bundled (165 KB)
│   └── shadcss.min.css      ← minified (137 KB, 16.8 KB gzipped)
├── scripts/
│   └── build.mjs            ← Lightning CSS bundler
├── registry.json            ← machine-readable component registry
├── AI_GUIDE.md              ← patterns + rules for AI code generation
├── README.md                ← this file
├── LICENSE                  ← MIT
└── package.json
```

The live showcase of every component lives in [`apps/www`](../../apps/www).

---

## Contributing

PRs welcome. Each component is one file in `src/components/`. Keep it under
200 lines if you can. Use the design tokens, not raw values. Update
`registry.json` when adding a new component.

---

## License

MIT
