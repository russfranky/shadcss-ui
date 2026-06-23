# @russfranky/shadcss-js

Optional, tiny, **dependency-free** progressive-enhancement helpers for [shadcss](https://github.com/russfranky/shadcss-ui) — only the interactions the platform doesn't fully solve yet.

shadcss is zero-runtime CSS **by default**. These helpers are opt-in, per-element, and tiny. There is no global runtime, no virtual DOM, no framework. Without them, the components stay accessible native HTML (e.g. tabs are a real radiogroup); with them, you get the full ARIA/keyboard pattern.

| Helper | Adds | Size (gzip) |
| --- | --- | --- |
| `./menu` | Arrow-key roving focus, Home/End, type-ahead, Escape-to-close + focus return, `role=menu/menuitem` — for `.dropdown-menu` / `.menubar-menu` | ~1.1 KB |
| `./tabs` | `role=tablist/tab/tabpanel`, synced `aria-selected`, `aria-controls`/`aria-labelledby`, arrow-key / Home / End nav — for `.tabs` | ~1.0 KB |

## Usage

Opt in per element with a `data-` attribute, then load the helper (it auto-initializes):

```html
<!-- Full keyboard menu -->
<button class="btn" popovertarget="acct">Account</button>
<div class="dropdown-menu" popover id="acct" data-sc-menu>
  <button class="dropdown-item">Profile</button>
  <button class="dropdown-item">Settings</button>
</div>

<!-- Full ARIA tabs -->
<div class="tabs" data-sc-tabs> … </div>

<script type="module">
  import "@russfranky/shadcss-js/menu";
  import "@russfranky/shadcss-js/tabs";
  // or import "@russfranky/shadcss-js" for everything
</script>
```

CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@russfranky/shadcss-js@0.1.0/src/menu.js"></script>
```

For dynamically added markup, re-scan:

```js
import { initMenus } from "@russfranky/shadcss-js/menu";
initMenus(someContainer); // defaults to document
```

## Principles

- **Zero dependencies**, no build needed, framework-neutral, works with plain HTML.
- **Opt-in** via `data-*`; nothing runs unless you ask for it.
- **Progressive**: the component is already accessible without the helper; the helper upgrades it.
- **Bounded**: each helper does one thing and stays under a strict size budget.

## License

MIT
