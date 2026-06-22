# AI Guide — shadcss for Code Generation

> This document is the canonical reference for AI agents generating UI with
> shadcss. Read it once, refer back often. Following these rules will
> produce code indistinguishable from a senior engineer's.

## TL;DR

shadcss is **shadcn/ui with no JS framework** — zero-runtime CSS. Every shadcn
component has an equivalent here built on HTML + CSS. The CSS bundle ships 0 JS;
native `<dialog>`/Popover/toast need a one-line native trigger
(`showModal()`/`showPopover()`). To use:

```html
<link rel="stylesheet" href="https://unpkg.com/@russfranky/shadcss/dist/shadcss.min.css">
```

Then write semantic HTML with shadcss class names. **No framework, no build
step, no JS bundle, no state hooks.** Interactivity comes from the platform:
Popover API, `<dialog>`, `<details>`, `:has()`, native form controls — with a
one-line native call to open `<dialog>`/Popover/toast where the platform
requires it.

---

## Mental model

| shadcn (React)              | shadcss (HTML + CSS)                                    |
| --------------------------- | ------------------------------------------------------- |
| `<Dialog open onOpenChange>` | `<dialog>` + `dialog.showModal()` / `<form method="dialog">` |
| `<DropdownMenu>` + state    | `<button popovertarget="X">` + `<div popover id="X">`   |
| `<Accordion>` + Radix       | `<details><summary>` (native)                            |
| `<Tabs>` + state            | `<input type="radio">` + `:has()`                        |
| `<Tooltip>` + hook          | `class="tooltip" data-tooltip="…"`                       |
| `<Switch>` + useState       | `<input type="checkbox" class="switch">`                 |
| `<Progress value={x}>`      | `<progress value="x">`                                   |
| `<Slider>` + useState       | `<input type="range" class="slider">`                    |
| `<Sonner toast>` + viewport | `<div class="sonner" popover>` + CSS auto-dismiss        |

If you find yourself reaching for `useState` to track UI state, **stop**.
There's a CSS-only pattern. The cheat-sheet below covers them all.

---

## The 7 patterns you'll use 95% of the time

### 1. Modal — `<dialog>` + `showModal()`

```html
<button class="btn" onclick="d.showModal()">Open</button>
<dialog class="dialog" id="d">
  <header class="dialog-header">
    <div class="dialog-title">Title</div>
    <div class="dialog-description">Description.</div>
  </header>
  <div class="dialog-body">…</div>
  <footer class="dialog-footer">
    <form method="dialog"><button class="btn btn-ghost">Cancel</button></form>
    <button class="btn">Confirm</button>
  </footer>
</dialog>
```

`<form method="dialog">` is the pure-HTML way to close — no JS needed for the
cancel button. The confirm button needs a one-liner if you want to do work
before closing.

### 2. Dropdown — Popover API

```html
<div class="dropdown">
  <button class="btn" popovertarget="menu">Open</button>
  <div class="dropdown-menu" popover id="menu" data-side="bottom-start">
    <a class="dropdown-item" href="#">Profile</a>
    <button class="dropdown-item">Settings</button>
    <div class="dropdown-separator"></div>
    <button class="dropdown-item dropdown-destructive">Delete</button>
  </div>
</div>
```

The `popovertarget` attribute is pure HTML — clicking the button opens the
menu. Light-dismiss (click outside) is built in.

### 3. Accordion — `<details>` (native)

```html
<div class="accordion">
  <details name="faq">
    <summary>Question?</summary>
    <div class="accordion-content">Answer.</div>
  </details>
</div>
```

The `name` attribute makes the group exclusive (only one open at a time) in
Chromium 129+. Without it, all can be open simultaneously.

### 4. Tabs — radios + `:has()`

```html
<div class="tabs">
  <div class="tabs-list">
    <input type="radio" name="t" id="t-1" checked>
    <label for="t-1" class="tabs-trigger">Tab 1</label>
    <input type="radio" name="t" id="t-2">
    <label for="t-2" class="tabs-trigger">Tab 2</label>
  </div>
  <div class="tabs-panel" data-tab="t-1">…</div>
  <div class="tabs-panel" data-tab="t-2">…</div>
</div>
```

**Convention**: pair each input's `id` with the panel's `data-tab`. shadcss
ships selectors for ids ending in `-1` through `-12`. For more, add one line
of CSS: `.tabs:has(#my-id-13:checked) .tabs-panel[data-tab="my-id-13"] { display: block; }`

### 5. Tooltip — `data-tooltip` attribute

```html
<button class="btn tooltip" data-tooltip="I'm a tooltip!">Hover me</button>
<button class="btn tooltip" data-tooltip="Bottom" data-position="bottom">…</button>
```

Triggers on `:hover` and `:focus-within` — keyboard accessible for free.

### 6. Selection controls — native inputs

```html
<input type="checkbox" class="checkbox" checked>
<input type="checkbox" class="checkbox" data-indeterminate="true">
<input type="radio"    class="radio"    name="r" checked>
<input type="checkbox" class="switch"   checked>
<input type="range"    class="slider"   value="50" style="--slider-fill: 50%">
```

All native. Keyboard, screen-reader, and form submission work automatically.

### 7. Toast — Popover + CSS animation

```html
<button class="btn" onclick="t.showPopover()">Show toast</button>
<div class="sonner sonner-success" popover id="t">
  <svg>…</svg>
  <div class="sonner-content">
    <div class="sonner-title">Saved</div>
    <div class="sonner-description">Your changes are saved.</div>
  </div>
</div>
```

The CSS animation runs for `--sonner-duration` (4s default) then hides the
toast. No JS timers.

---

## Component generation rules

When asked to generate a UI element, follow these rules strictly:

### Rule 1: Always use semantic HTML

✅ `<button>` for actions
✅ `<a>` for navigation
✅ `<input type="checkbox">` for toggles
✅ `<details>` for collapsibles
✅ `<dialog>` for modals
✅ `<progress>` for progress bars

❌ `<div onclick>` for buttons
❌ `<div role="button">` (use real `<button>`)
❌ `<div class="checkbox">` (use real `<input>`)

### Rule 2: Class names follow BEM-ish conventions

- Component: `.accordion`, `.card`, `.btn`
- Element: `.accordion-content`, `.card-title`, `.btn-icon`
- Modifier: `.btn-secondary`, `.card-interactive`, `.alert-destructive`
- State: `[aria-current="page"]`, `[aria-pressed="true"]`, `[data-side="bottom"]`

### Rule 3: Variants are separate classes, not modifiers

```html
<!-- ✅ Correct -->
<button class="btn btn-outline btn-sm">…</button>

<!-- ❌ Wrong -->
<button class="btn" data-variant="outline" data-size="sm">…</button>
```

Exceptions: `data-side`, `data-orientation`, `data-position`, `data-variant`
(for things like tabs underline vs default where the data attribute controls
multiple child styles).

### Rule 4: Always include focus states

Every interactive element should respond to `:focus-visible`. shadcss
components handle this in CSS — just don't override `outline: none` without
providing an alternative.

### Rule 5: Respect `prefers-reduced-motion`

All shadcss animations are auto-disabled under `prefers-reduced-motion:
reduce`. Don't add inline animations that bypass this.

### Rule 6: Use design tokens, not raw values

```css
/* ✅ Correct */
.my-card {
  background: hsl(var(--card));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-4);
}

/* ❌ Wrong */
.my-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 16px;
}
```

### Rule 7: Theme via `data-theme` attribute

```html
<html data-theme="dark">  <!-- forced dark -->
<html data-theme="light"> <!-- forced light -->
<html>                    <!-- auto via prefers-color-scheme -->
```

### Rule 8: Toggle theme with one line

```html
<button onclick="document.documentElement.dataset.theme =
  document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'">
  Toggle
</button>
```

### Rule 9: Icons are inline SVG

shadcss doesn't ship an icon library. Use inline SVGs (Lucide icons work
great: `https://lucide.dev`). Standard size inside components is `1rem` or
`1.125rem`.

```html
<button class="btn">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="…"/>
  </svg>
  Label
</button>
```

### Rule 10: Use `:has()` for parent state

When a parent needs to react to a child's state, use `:has()`:

```css
.field:has(:user-invalid) .field-error { display: flex; }
.card:has(img:hover) { transform: scale(1.02); }
```

---

## Common patterns

### Login form

```html
<form class="card" style="max-width: 24rem; margin: auto;">
  <div class="card-header">
    <div class="card-title">Sign in</div>
    <div class="card-description">Enter your credentials.</div>
  </div>
  <div class="card-content" style="display: flex; flex-direction: column; gap: var(--space-4);">
    <div class="field" data-required="true">
      <label class="field-label" for="email">Email</label>
      <div class="field-control">
        <input class="input" type="email" id="email" required placeholder="you@example.com">
      </div>
      <p class="field-description">We'll never share your email.</p>
      <p class="field-error"><svg>…</svg>Invalid email address.</p>
    </div>
    <div class="field" data-required="true">
      <label class="field-label" for="pw">Password</label>
      <div class="field-control">
        <input class="input" type="password" id="pw" required minlength="8">
      </div>
    </div>
    <label class="label" style="font-weight: 400;">
      <input type="checkbox" class="checkbox"> Remember me
    </label>
  </div>
  <div class="card-footer" data-justify="between">
    <a class="btn btn-link" href="#">Forgot password?</a>
    <button class="btn" type="submit">Sign in</button>
  </div>
</form>
```

### App shell with sidebar

```html
<div style="display: flex; min-height: 100vh;">
  <aside class="sidebar">
    <div class="sidebar-header">
      <a class="sidebar-brand" href="#">
        <span class="sidebar-brand-logo"><svg>…</svg></span>
        <span class="sidebar-brand-text">Acme</span>
      </a>
    </div>
    <nav class="sidebar-content">
      <div class="sidebar-group">
        <div class="sidebar-group-label">Main</div>
        <ul class="sidebar-menu">
          <li class="sidebar-menu-item">
            <a class="sidebar-menu-button" href="#" aria-current="page">
              <svg>…</svg><span>Dashboard</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-menu-button">
        <div class="avatar avatar-sm">U</div>
        <span>user@example.com</span>
      </div>
    </div>
  </aside>
  <main style="flex: 1; padding: var(--space-6);">
    <h1>Dashboard</h1>
  </main>
</div>
```

### Data table with actions

```html
<div class="table-wrapper">
  <table class="table">
    <thead>
      <tr><th>Email</th><th>Status</th><th data-align="end">Actions</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>jane@example.com</td>
        <td><span class="badge badge-success badge-dot">Active</span></td>
        <td data-align="end">
          <div class="dropdown" style="display: inline-block;">
            <button class="btn btn-ghost btn-sm btn-icon" popovertarget="row-1" aria-label="Actions">
              <svg>…</svg>
            </button>
            <div class="dropdown-menu" popover id="row-1" data-side="bottom-end">
              <a class="dropdown-item" href="#">Edit</a>
              <button class="dropdown-item dropdown-destructive">Delete</button>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Command palette

```html
<button class="btn" popovertarget="cmd">
  <kbd>⌘</kbd> <kbd>K</kbd> Search…
</button>
<div class="command" popover id="cmd">
  <div class="command-input-wrap">
    <svg>…</svg>
    <input class="command-input" placeholder="Type a command or search…">
  </div>
  <div class="command-list">
    <div class="command-group-heading">Suggestions</div>
    <button class="command-item">
      <svg>…</svg>
      <span>Create new project</span>
      <span class="command-shortcut">⌘N</span>
    </button>
    <div class="command-separator"></div>
    <div class="command-group-heading">Pages</div>
    <a class="command-item" href="#"><svg>…</svg><span>Dashboard</span></a>
  </div>
  <div class="command-footer">
    <span>↑↓ to navigate</span>
    <span>↵ to select</span>
  </div>
</div>
```

### Filter bar with toggle group

```html
<div class="toggle-group">
  <input type="radio" name="filter" id="filter-all" checked>
  <label for="filter-all" class="toggle-group-item">All</label>
  <input type="radio" name="filter" id="filter-active">
  <label for="filter-active" class="toggle-group-item">Active</label>
  <input type="radio" name="filter" id="filter-archived">
  <label for="filter-archived" class="toggle-group-item">Archived</label>
</div>
```

### Settings page with sidebar tabs

```html
<div class="tabs" data-orientation="vertical">
  <div class="tabs-list">
    <input type="radio" name="settings" id="settings-1" checked>
    <label for="settings-1" class="tabs-trigger">General</label>
    <input type="radio" name="settings" id="settings-2">
    <label for="settings-2" class="tabs-trigger">Security</label>
  </div>
  <div class="tabs-panel" data-tab="settings-1">
    <div class="card">
      <div class="card-header">
        <div class="card-title">General</div>
      </div>
      <div class="card-content">
        <label class="label" style="justify-content: space-between;">
          Email notifications
          <input type="checkbox" class="switch" checked>
        </label>
      </div>
    </div>
  </div>
</div>
```

---

## Don't do this

1. **Don't write JavaScript to manage UI state** that CSS can manage. If
   you're writing `useState` for "is the dropdown open?", you're doing it
   wrong. Use Popover API.

2. **Don't import a CSS-in-JS library**. shadcss is plain CSS. Use plain CSS
   for your custom styles. Cascade layers prevent conflicts.

3. **Don't override component styles with `!important`**. If you need to
   customize, use the design tokens instead.

4. **Don't use `<div>` for interactive elements**. Always use the right
   element (`<button>`, `<a>`, `<input>`).

5. **Don't forget accessibility**. Every interactive element needs:
   - `:focus-visible` styling (handled by shadcss)
   - Proper ARIA (`aria-current`, `aria-pressed`, `aria-expanded`)
   - Semantic markup (real buttons, real inputs)

6. **Don't invent class names** that aren't in the registry. Always check
   `registry.json` first. If you need something not covered, compose
   existing components.

---

## The 52-component inventory

```
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb,
button, calendar, card, carousel, checkbox, collapsible, command, container,
context-menu, dialog, drawer, dropdown, empty, field, hover-card, input,
input-otp, kbd, label, menubar, navigation-menu, pagination, popover,
progress, radio, radio-group, resizable, scroll-area, select, separator,
sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs,
textarea, toast, toggle, toggle-group, tooltip, typography
```

Each has a `src/components/<name>.css` file. The `registry.json` file
contains the full machine-readable spec including dependencies, classes,
attributes, and example markup.

---

## Generating code for users — checklist

Before returning generated code:

- [ ] All components used exist in `registry.json`
- [ ] Class names match exactly (case-sensitive)
- [ ] Variants are separate classes (`btn btn-outline`), not data attributes
- [ ] State uses correct attributes (`aria-current`, `aria-pressed`)
- [ ] HTML is semantic (`<button>` not `<div>`)
- [ ] No raw color values — use `hsl(var(--token))`
- [ ] No raw spacing values — use `var(--space-N)`
- [ ] Forms use `<form>` + native inputs
- [ ] Modals use `<dialog>` + `<form method="dialog">`
- [ ] Dropdowns use Popover API (`popovertarget`)
- [ ] Tabs use radio + `:has()` pattern with matching `data-tab`
- [ ] Icons are inline SVG at `16x16` or `18x18`
- [ ] Reduced motion is respected (don't add inline animations)
- [ ] The code works without any JavaScript (except one-liners for opening
      `<dialog>` and `<popover>` if not using `popovertarget`)

---

## Example: build me a settings page

**You (user):** Build me a settings page with sections for account, security,
and notifications. Include a sidebar nav and a save button.

**AI:**

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <title>Settings — Acme</title>
  <link rel="stylesheet" href="https://unpkg.com/@russfranky/shadcss/dist/shadcss.min.css">
</head>
<body>

<div style="display: grid; grid-template-columns: 16rem 1fr; min-height: 100vh;">

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <a class="sidebar-brand" href="#">
        <span class="sidebar-brand-logo">A</span>
        <span class="sidebar-brand-text">Acme</span>
      </a>
    </div>
    <nav class="sidebar-content">
      <div class="sidebar-group">
        <div class="sidebar-group-label">Settings</div>
        <ul class="sidebar-menu">
          <li class="sidebar-menu-item">
            <a class="sidebar-menu-button" href="#" aria-current="page">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Account</span>
            </a>
          </li>
          <li class="sidebar-menu-item">
            <a class="sidebar-menu-button" href="#">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Security</span>
            </a>
          </li>
          <li class="sidebar-menu-item">
            <a class="sidebar-menu-button" href="#">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <span>Notifications</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </aside>

  <!-- Main content -->
  <main style="padding: var(--space-8); max-width: 56rem;">

    <div class="tabs">
      <div class="tabs-list">
        <input type="radio" name="settings" id="settings-1" checked>
        <label for="settings-1" class="tabs-trigger">Account</label>
        <input type="radio" name="settings" id="settings-2">
        <label for="settings-2" class="tabs-trigger">Security</label>
        <input type="radio" name="settings" id="settings-3">
        <label for="settings-3" class="tabs-trigger">Notifications</label>
      </div>

      <!-- Account -->
      <div class="tabs-panel" data-tab="settings-1">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Account</div>
            <div class="card-description">Update your account information.</div>
          </div>
          <div class="card-content" style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div class="field" data-required="true">
              <label class="field-label" for="name">Name</label>
              <div class="field-control">
                <input class="input" id="name" value="Jane Doe" required>
              </div>
            </div>
            <div class="field" data-required="true">
              <label class="field-label" for="email">Email</label>
              <div class="field-control">
                <input class="input" type="email" id="email" value="jane@example.com" required>
              </div>
            </div>
          </div>
          <div class="card-footer" data-justify="end">
            <button class="btn btn-ghost">Cancel</button>
            <button class="btn">Save changes</button>
          </div>
        </div>
      </div>

      <!-- Security -->
      <div class="tabs-panel" data-tab="settings-2">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Password</div>
            <div class="card-description">Change your password.</div>
          </div>
          <div class="card-content" style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div class="field" data-required="true">
              <label class="field-label" for="current">Current password</label>
              <div class="field-control"><input class="input" type="password" id="current" required></div>
            </div>
            <div class="field" data-required="true">
              <label class="field-label" for="new">New password</label>
              <div class="field-control"><input class="input" type="password" id="new" required minlength="8"></div>
              <p class="field-description">At least 8 characters.</p>
            </div>
            <label class="label" style="justify-content: space-between;">
              Enable two-factor authentication
              <input type="checkbox" class="switch">
            </label>
          </div>
          <div class="card-footer" data-justify="end">
            <button class="btn">Update password</button>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="tabs-panel" data-tab="settings-3">
        <div class="card">
          <div class="card-header">
            <div class="card-title">Notifications</div>
            <div class="card-description">Choose what you want to hear about.</div>
          </div>
          <div class="card-content" style="display: flex; flex-direction: column; gap: var(--space-3);">
            <label class="label" style="justify-content: space-between;">
              Email notifications
              <input type="checkbox" class="switch" checked>
            </label>
            <label class="label" style="justify-content: space-between;">
              Push notifications
              <input type="checkbox" class="switch">
            </label>
            <label class="label" style="justify-content: space-between;">
              Marketing emails
              <input type="checkbox" class="switch">
            </label>
          </div>
          <div class="card-footer" data-justify="end">
            <button class="btn">Save preferences</button>
          </div>
        </div>
      </div>

    </div>
  </main>
</div>

</body>
</html>
```

That's the whole settings page — three tabs, three forms, full interactivity,
**no JS framework** (the tabs, forms, and switches need no JavaScript at all).

---

## When you do need JS

shadcss aims for zero JS, but a few patterns still need it (10 lines max):

1. **Opening `<dialog>`** — `dialog.showModal()` (one-liner inline onclick)
2. **Opening `<popover>` without `popovertarget`** — `el.showPopover()` (rare)
3. **Resizable panels** — pointer event handlers (10 lines)
4. **Slider fill %** — set `--slider-fill` on input event (one-liner)
5. **Command palette search** — filter DOM nodes by input value (10 lines)
6. **Sidebar collapse toggle** — toggle `data-collapsed` attribute (one-liner)

Everything else — accordions, tabs, dropdowns, tooltips, toasts, switches,
checkboxes, radios, progress, skeleton, cards, badges, alerts, avatars,
separators, navigation — works without any JS at all.
