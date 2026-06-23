# shadcss — Load-Time Benchmark & Improvement Analysis

Measured locally (headless Chromium + Node zlib), not cited from memory.
Harness: `scripts/bench/sizes.mjs` (transfer), `scripts/bench/parse.mjs`
(browser parse/recalc). Peer CSS pulled from CDN into `.refs/bench/` (gitignored).

## Transfer size — shadcss vs CSS frameworks

| framework | raw | gzip | brotli | scope |
|---|---:|---:|---:|---|
| water | 22.1 | 3.5 | 3.0 | classless drop-in |
| open-props | 25.0 | 6.9 | 5.6 | design tokens only |
| pico | 80.3 | 11.3 | 9.7 | classless + semantic |
| tachyons | 72.2 | 12.8 | 7.5 | atomic utilities |
| **shadcss** | **101.2** | **15.4** | **13.1** | **52 components + thin utils** |
| bootstrap | 227.3 | 29.9 | 22.2 | full framework (utils + grid) |
| bulma | 661.4 | 63.2 | 35.4 | full framework (utils + grid) |

(KB.) **shadcss is the lightest *component* framework measured** — half of
Bootstrap's gzip, a quarter of Bulma's. The smaller libs (water/pico/open-props)
are classless or token-only, not component sets.

> **Scope caveat — not apples-to-apples on features.** shadcss is NOT a full
> framework. It ships the 52 components + a *thin* convenience utility layer
> (`base/theme.css`: ~73 rules — `.flex`/`.grid`/`.gap-*`/`.p-*`/`.bg-*`/
> `.container*`), but **no comprehensive utility system and no responsive grid**.
> That's deliberate: it mirrors shadcn/ui, which also ships only components and
> expects **Tailwind** for utilities + grid. So a chunk of Bootstrap's/Bulma's
> size is the utility+grid layer shadcss intentionally delegates. The fair claim
> is "lightest way to get the shadcn component aesthetic," not "a smaller
> Bootstrap." Decision (owner): stay shadcn-style (bring-your-own utilities).

## Browser parse cost (median of 25 runs, DOM-independent)

| framework | CSSOM parse | 
|---|---:|
| open-props | 0.10 ms |
| **shadcss** | **0.80 ms** |
| pico | 2.50 ms |
| bootstrap | 7.20 ms |
| bulma | 14.30 ms |

shadcss parses in **<1 ms** — ~9× faster than Bootstrap, ~18× faster than Bulma.

## vs shadcn/ui (structural — not a CSS file)

shadcn ships React components, so "load" is dominated by JS, not CSS. Measured
gzip floor any shadcn page pays *before app code*:

| | gzip |
|---|---:|
| react + react-dom (runtime floor) | **45 KB** (react-dom alone 41 KB) |
| @radix-ui/react-dialog | ~3 KB (+ shared deps) |
| @radix-ui/react-dropdown-menu | ~2.4 KB (+ shared deps) |
| + compiled Tailwind CSS | ~10–20 KB |

A shadcn page with a handful of interactive components ships **~60–90+ KB gz of
JS** that must also parse, execute, and hydrate. **shadcss ships 15.4 KB gz of
CSS, 0 JS** (13.1 KB brotli), parsed in <1 ms. The trade is real: shadcss gives
up the JS-driven interactivity Radix provides.

---

## Improvements

### 1. ✅ DONE — fix Lightning CSS target encoding (−13% gzip, truer color)
`build.mjs` passed `{ chrome: 111 }`, but Lightning encodes versions as
`major << 16`, so `111` meant browser **0.0.111** → maximum downleveling:
`oklch()` was expanded to hex + `lab()` (99 `lab()` decls, ~1191 rules).
Fixed to real versions (`111 << 16`, all of which support `oklch()`/`color-mix()`
natively — a baseline already implied by the framework's Popover API / `:has()`).
**Result: 17.8 → 15.4 KB gz (−13%), 15.1 → 13.1 KB brotli, 1191 → 945 rules,
and the output now ships true `oklch()` (exact shadcn values, wide-gamut) instead
of hex approximations.** Verified: build green, a11y unchanged, render identical.

### 2. Per-component tree-shaking (recommended)
The bundle is 15.4 KB, but components are independent (median **565 B gz**,
heaviest `sidebar` 1.5 KB, `button` 1.1 KB). A consumer using ~8 components could
ship **~3–5 KB** instead of 15.4. The registry already maps per-component deps;
shipping `dist/components/*.min.css` (and documenting the import path) would let
consumers load only what they use. Build enhancement, not yet implemented.

### 3. Brotli messaging
Real-world CDN delivery (unpkg/jsDelivr negotiate brotli) is **13.1 KB**, not the
15.4 KB gzip the badge shows. Worth stating "13 KB over the wire" in docs.

### 4. Heaviest components (trim candidates)
`sidebar` 1.5 KB, `navigation-menu` 1.0 KB, `sonner`/`toast` ~0.9 KB each carry
the most bytes — first places to look if shrinking further.
