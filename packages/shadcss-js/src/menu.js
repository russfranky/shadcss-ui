// ==========================================================================
// @russfranky/shadcss-js/menu
// Keyboard navigation for shadcss Popover-API menus (dropdown, menubar).
// Opt in by adding `data-sc-menu` to the .dropdown-menu / .menubar-menu element.
// Adds: roving arrow-key focus, Home/End, type-ahead, Escape-to-close +
// focus return, and role=menu/menuitem + aria-haspopup. Zero dependencies.
// ==========================================================================

const ITEM_SELECTOR = ".dropdown-item, .dropdown-checkbox-item, .dropdown-radio-item";

function items(menu) {
  return [...menu.querySelectorAll(ITEM_SELECTOR)].filter(
    (el) => !el.disabled && el.getAttribute("aria-disabled") !== "true" && el.offsetParent !== null
  );
}

function focusAt(list, i) {
  if (!list.length) return;
  const el = list[((i % list.length) + list.length) % list.length];
  list.forEach((x) => (x.tabIndex = -1));
  el.tabIndex = 0;
  el.focus();
}

function enhance(menu) {
  if (menu.__scMenu) return;
  menu.__scMenu = true;
  if (!menu.getAttribute("role")) menu.setAttribute("role", "menu");

  const trigger = menu.id ? document.querySelector(`[popovertarget="${menu.id}"]`) : null;
  if (trigger) trigger.setAttribute("aria-haspopup", "menu");

  items(menu).forEach((el) => {
    if (!el.getAttribute("role")) el.setAttribute("role", "menuitem");
    el.tabIndex = -1;
  });

  // Focus the first item when the popover opens.
  menu.addEventListener("toggle", (e) => {
    if (e.newState === "open") focusAt(items(menu), 0);
  });

  menu.addEventListener("keydown", (e) => {
    const list = items(menu);
    if (!list.length) return;
    const cur = list.indexOf(document.activeElement);
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); focusAt(list, cur + 1); break;
      case "ArrowUp":   e.preventDefault(); focusAt(list, cur - 1); break;
      case "Home":      e.preventDefault(); focusAt(list, 0); break;
      case "End":       e.preventDefault(); focusAt(list, list.length - 1); break;
      case "Escape":
        if (menu.matches(":popover-open")) { menu.hidePopover(); trigger?.focus(); }
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const ch = e.key.toLowerCase();
          for (let k = 1; k <= list.length; k++) {
            const el = list[(cur + k) % list.length];
            if ((el.textContent || "").trim().toLowerCase().startsWith(ch)) { focusAt(list, cur + k); break; }
          }
        }
    }
  });
}

export function initMenus(root = document) {
  root.querySelectorAll("[data-sc-menu]").forEach(enhance);
}

if (typeof document !== "undefined") {
  if (document.readyState !== "loading") initMenus();
  else document.addEventListener("DOMContentLoaded", () => initMenus());
}
