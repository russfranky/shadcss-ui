// ==========================================================================
// @russfranky/shadcss-js/tabs
// Upgrades shadcss radio-based tabs to a full ARIA tab pattern.
// Opt in by adding `data-sc-tabs` to the .tabs element.
// Adds: role=tablist/tab/tabpanel, aria-selected (kept in sync), aria-controls
// / aria-labelledby wiring, and arrow-key / Home / End navigation. Zero deps.
// Without this, shadcss tabs are an honest, accessible native radiogroup.
// ==========================================================================

function enhance(tabs) {
  if (tabs.__scTabs) return;
  tabs.__scTabs = true;
  const list = tabs.querySelector(".tabs-list");
  if (!list) return;
  list.setAttribute("role", "tablist");

  const radios = [...list.querySelectorAll('input[type="radio"]')];
  const labels = radios.map((r) => list.querySelector(`label[for="${r.id}"]`));
  const panels = [...tabs.querySelectorAll(".tabs-panel")];

  function sync() {
    radios.forEach((r, i) => {
      const lab = labels[i];
      if (!lab) return;
      if (!lab.id) lab.id = `${r.id}-tab`;
      lab.setAttribute("role", "tab");
      lab.setAttribute("aria-selected", r.checked ? "true" : "false");
      lab.tabIndex = r.checked ? 0 : -1;
      const panel = panels[i];
      if (panel) {
        if (!panel.id) panel.id = `${r.id}-panel`;
        panel.setAttribute("role", "tabpanel");
        lab.setAttribute("aria-controls", panel.id);
        panel.setAttribute("aria-labelledby", lab.id);
        if (!panel.hasAttribute("tabindex")) panel.tabIndex = 0;
      }
    });
  }

  radios.forEach((r) => r.addEventListener("change", sync));

  list.addEventListener("keydown", (e) => {
    const i = radios.findIndex((r) => r.checked);
    if (i < 0) return;
    let j = null;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": j = (i + 1) % radios.length; break;
      case "ArrowLeft":  case "ArrowUp":   j = (i - 1 + radios.length) % radios.length; break;
      case "Home": j = 0; break;
      case "End":  j = radios.length - 1; break;
    }
    if (j !== null) {
      e.preventDefault();
      radios[j].checked = true;
      radios[j].dispatchEvent(new Event("change", { bubbles: true }));
      labels[j]?.focus();
    }
  });

  sync();
}

export function initTabs(root = document) {
  root.querySelectorAll(".tabs[data-sc-tabs]").forEach(enhance);
}

if (typeof document !== "undefined") {
  if (document.readyState !== "loading") initTabs();
  else document.addEventListener("DOMContentLoaded", () => initTabs());
}
