# shadcss/ui

> **shadcn's beauty, no JS framework.**
> A complete HTML + CSS-only clone of the shadcn/ui aesthetic. 52 components. 16.0 KB gzipped. Zero-runtime — the CSS bundle ships 0 JS.

[![gzip size](https://img.shields.io/badge/gzipped-16.0%20KB-success)](./packages/shadcss/dist/shadcss.min.css)
[![no js framework](https://img.shields.io/badge/JS-no%20framework-black)](#)
[![components](https://img.shields.io/badge/components-52-blue)](./packages/shadcss#components-52)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE.md)

`shadcss` rebuilds every shadcn/ui component — every variant, every detail —
for the modern web platform. Where shadcn uses React + Radix + Tailwind,
shadcss uses `:has()`, the Popover API, native `<dialog>`, and modern CSS.
**No JS framework. Zero dependencies. Zero framework lock-in.** The CSS bundle
ships 0 JS; native `<dialog>`/Popover/toast need a one-line native trigger
(`showModal()`/`showPopover()`).

> Not affiliated with, endorsed by, or sponsored by shadcn/ui. Inspired by its
> design language.

## Install

```html
<!-- CDN — pin a version in production so a future major can't break you -->
<link rel="stylesheet" href="https://unpkg.com/@russfranky/shadcss@0.1.1/dist/shadcss.min.css">
```

```bash
# npm
npm install @russfranky/shadcss
```

```css
/* Bare-specifier @import — resolves ONLY through a bundler (Vite, webpack,
   Parcel, esbuild, etc.) that honors the package "exports"/"style" field.
   Plain CSS has no Node resolution, so this 404s without a bundler. */
@import "@russfranky/shadcss";

/* Plain CSS / no bundler: import the built file by path instead. */
@import "@russfranky/shadcss/dist/shadcss.min.css";
```

## Monorepo structure

This repository mirrors the [`shadcn-ui/ui`](https://github.com/shadcn-ui/ui) layout:

```
shadcss-ui/
├── apps/
│   └── www/              ← live component showcase + docs
└── packages/
    └── shadcss/          ← the framework (published to npm as `shadcss`)
        ├── src/          ← source CSS (base + 52 components)
        ├── dist/         ← built bundles
        ├── registry.json ← machine-readable component spec
        └── AI_GUIDE.md   ← patterns for AI code generation
```

## Develop

```bash
npm install        # install workspace deps
npm run build      # build the framework → packages/shadcss/dist
npm run dev        # rebuild on change (watch)
npm run www        # serve the showcase at http://localhost:3333
```

> The showcase (`apps/www/index.html`) links the built `shadcss.min.css`, which
> the framework build generates and copies in. Run `npm run build` first (the
> `www` dev/build scripts now do this for you) — opening the raw `index.html`
> before any build produces an unstyled page.

## Documentation

- **Framework README** — [`packages/shadcss/README.md`](./packages/shadcss/README.md)
- **AI guide** — [`packages/shadcss/AI_GUIDE.md`](./packages/shadcss/AI_GUIDE.md)
- **Component registry** — [`packages/shadcss/registry.json`](./packages/shadcss/registry.json)

## License

MIT
