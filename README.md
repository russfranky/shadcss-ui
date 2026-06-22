# shadcss/ui

Beautifully designed HTML/CSS components. Minimal JavaScript. Copy and paste into your projects.

> A lightweight alternative to [shadcn/ui](https://ui.shadcn.com) — no framework required.

---

## What is this?

shadcss/ui gives you the same polished component aesthetic as shadcn/ui but with plain HTML and CSS. No React, no build step, no framework lock-in. Drop a stylesheet, copy the markup, done.

Designed to be AI-friendly — LLMs can read, generate, and modify pure HTML/CSS with far less friction than JSX + Tailwind.

## Usage

1. Copy the component stylesheet into your project (or import the npm package).
2. Paste the HTML markup.
3. Customize with CSS variables.

```html
<link rel="stylesheet" href="node_modules/shadcss/src/components/button/button.css" />

<button class="sc-btn sc-btn-default">Click me</button>
<button class="sc-btn sc-btn-outline sc-btn-sm">Small outline</button>
```

## Theming

All design tokens are CSS custom properties on `:root`:

```css
:root {
  --sc-primary: #18181b;
  --sc-primary-fg: #fafafa;
  --sc-border: #e4e4e7;
  --sc-accent: #f4f4f5;
  --sc-destructive: #ef4444;
  --sc-radius: 0.375rem;
}
```

## Components

| Component | Status |
|-----------|--------|
| Button    | ✅ Done |
| Input     | 🚧 Planned |
| Card      | 🚧 Planned |
| Badge     | 🚧 Planned |
| Dialog    | 🚧 Planned |

## Structure

```
shadcss-ui/
├── apps/
│   └── www/          # Docs + component showcase
└── packages/
    └── shadcss/      # The component library (publishable)
        └── src/
            └── components/
```

## License

MIT
