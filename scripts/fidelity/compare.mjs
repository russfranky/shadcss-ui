// ==========================================================================
// scripts/fidelity/compare.mjs
// Diff shadcss's own component CSS against the shadcn target spec
// (qa/fidelity/shadcn-spec.json). Resolves both sides to pixels and reports,
// per component, every metric that differs. Output: qa/fidelity/gaps.csv +
// console summary. Foundation tokens (radius base, focus model) are reported
// once at the top since they cascade to every component.
// ==========================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "packages/shadcss/src");

const spec = JSON.parse(readFileSync(path.join(ROOT, "qa/fidelity/shadcn-spec.json"), "utf8"));

// ---- shadcss token table (resolve its CSS vars to px) ----
const tokensCss = readFileSync(path.join(SRC, "base/tokens.css"), "utf8");
function tokenVal(name) {
  const m = tokensCss.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
}
const REM = 16;
function toPx(v) {
  if (v == null) return null;
  v = String(v).trim();
  if (v.endsWith("px")) return parseFloat(v);
  if (v.endsWith("rem")) return parseFloat(v) * REM;
  if (v === "0") return 0;
  return null;
}
// resolve a shadcss value that may be var()/calc() into px (best effort)
function resolveShadcss(v) {
  if (v == null) return null;
  v = v.trim();
  // var(--space-4) etc.
  const varM = v.match(/^var\(--([\w-]+)\)$/);
  if (varM) return toPx(tokenVal(varM[1]));
  // calc(var(--radius) - 2px)
  const calcM = v.match(/^calc\(\s*var\(--([\w-]+)\)\s*([+\-])\s*([\d.]+)px\s*\)$/);
  if (calcM) {
    const base = toPx(tokenVal(calcM[1]));
    if (base == null) return null;
    return calcM[2] === "+" ? base + parseFloat(calcM[3]) : base - parseFloat(calcM[3]);
  }
  return toPx(v);
}
// resolve a shadcn radius var token ("var(--radius-md)" / "9999px" / "0")
function resolveRadiusToken(v, side) {
  if (v == null) return null;
  if (v === "9999px") return 9999;
  if (v === "0") return 0;
  const vm = v.match(/^var\(--([\w-]+)\)$/);
  if (vm) {
    // both sides use the same --radius* names; resolve via shadcss tokens for a
    // comparable number, OR via shadcn base for the target.
    if (side === "shadcn") return resolveShadcnRadius(vm[1]);
    return resolveShadcss(v);
  }
  return toPx(v);
}
// shadcn radius base = 0.625rem, registry subtract scale
const SHADCN_RADIUS = 0.625 * REM; // 10px
function resolveShadcnRadius(name) {
  switch (name) {
    case "radius-sm": return SHADCN_RADIUS - 4;
    case "radius-md": return SHADCN_RADIUS - 2;
    case "radius-lg": return SHADCN_RADIUS;
    case "radius-xl": return SHADCN_RADIUS + 4;
    default: return SHADCN_RADIUS;
  }
}

// ---- parse a flat declaration block for a shadcss selector ----
function readBlock(css, selector) {
  // match `.sel {` where sel is not followed by another class/pseudo char
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\w-])\\s*\\{", "g");
  const m = re.exec(css);
  if (!m) return null;
  const start = m.index + m[0].length;
  const end = css.indexOf("}", start);
  if (end === -1) return null;
  return css.slice(start, end);
}
function decl(block, prop) {
  if (!block) return null;
  const m = block.match(new RegExp(`(?:^|[;{\\s])${prop}\\s*:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
}
// shadcss metrics for a component selector
function shadcssMetrics(css, selector) {
  const b = readBlock(css, selector);
  if (b == null) return null;
  const out = { _found: selector };
  const h = decl(b, "height"); if (h) out.height = resolveShadcss(h);
  const pad = decl(b, "padding");
  if (pad) {
    const parts = pad.split(/\s+/);
    if (parts.length === 2) { out.paddingY = resolveShadcss(parts[0]); out.paddingX = resolveShadcss(parts[1]); }
    else if (parts.length === 1) { out.paddingY = out.paddingX = resolveShadcss(parts[0]); }
    else if (parts.length === 4) { out.paddingY = resolveShadcss(parts[0]); out.paddingX = resolveShadcss(parts[1]); }
  }
  const px = decl(b, "padding-inline") || decl(b, "padding-left"); if (px) out.paddingX = resolveShadcss(px);
  const py = decl(b, "padding-block") || decl(b, "padding-top"); if (py) out.paddingY = resolveShadcss(py);
  const r = decl(b, "border-radius"); if (r) out.radius = resolveShadcss(r);
  const fs = decl(b, "font-size"); if (fs) out.fontSize = resolveShadcss(fs);
  const fw = decl(b, "font-weight"); if (fw) out.fontWeight = parseInt(fw, 10);
  const g = decl(b, "gap"); if (g) out.gap = resolveShadcss(g);
  const bd = decl(b, "border"); if (bd) { const w = bd.match(/([\d.]+)px/); if (w) out.border = parseFloat(w[1]); }
  const bw = decl(b, "border-width"); if (bw) { const w = bw.match(/([\d.]+)px/); if (w) out.border = parseFloat(w[1]); }
  const sh = decl(b, "box-shadow"); if (sh) out.shadow = sh === "none" ? "none" : "present";
  // focus model: does it use outline (old) or box-shadow ring (shadcn)?
  out._focusBlock = readBlock(css, selector + ":focus-visible");
  return out;
}

// ---- name -> shadcss primary selector + css file ----
const MAP = {
  button: { file: "button", sel: ".btn" },
  badge: { file: "badge", sel: ".badge" },
  input: { file: "input", sel: ".input" },
  textarea: { file: "textarea", sel: ".textarea" },
  card: { file: "card", sel: ".card" },
  alert: { file: "alert", sel: ".alert" },
  switch: { file: "switch", sel: ".switch" },
  checkbox: { file: "checkbox", sel: ".checkbox" },
  "radio-group": { file: "radio", sel: ".radio" },
  select: { file: "select", sel: ".select" },
  label: { file: "label", sel: ".label" },
  avatar: { file: "avatar", sel: ".avatar" },
  skeleton: { file: "skeleton", sel: ".skeleton" },
  progress: { file: "progress", sel: ".progress" },
  separator: { file: "separator", sel: ".separator" },
  tooltip: { file: "tooltip", sel: ".tooltip" },
  popover: { file: "popover", sel: ".popover" },
  dialog: { file: "dialog", sel: ".dialog" },
  "alert-dialog": { file: "alert-dialog", sel: ".alert-dialog" },
  sheet: { file: "sheet", sel: ".sheet" },
  "dropdown-menu": { file: "dropdown", sel: ".dropdown-menu" },
  "context-menu": { file: "context-menu", sel: ".context-menu" },
  menubar: { file: "menubar", sel: ".menubar" },
  command: { file: "command", sel: ".command" },
  "navigation-menu": { file: "navigation-menu", sel: ".navigation-menu-trigger" },
  breadcrumb: { file: "breadcrumb", sel: ".breadcrumb" },
  pagination: { file: "pagination", sel: ".pagination" },
  table: { file: "table", sel: ".table" },
  toast: { file: "toast", sel: ".toast" },
  sonner: { file: "sonner", sel: ".sonner" },
  slider: { file: "slider", sel: ".slider" },
  "input-otp": { file: "input-otp", sel: ".otp-slot" },
  toggle: { file: "toggle", sel: ".toggle" },
  "toggle-group": { file: "toggle-group", sel: ".toggle-group" },
  kbd: { file: "kbd", sel: ".kbd" },
  spinner: { file: "spinner", sel: ".spinner" },
  "scroll-area": { file: "scroll-area", sel: ".scroll-area" },
  "aspect-ratio": { file: "aspect-ratio", sel: ".aspect-ratio" },
  carousel: { file: "carousel", sel: ".carousel" },
  calendar: { file: "calendar", sel: ".calendar" },
  resizable: { file: "resizable", sel: ".resizable" },
  "hover-card": { file: "hover-card", sel: ".hover-card-panel" },
  collapsible: { file: "collapsible", sel: ".collapsible" },
  sidebar: { file: "sidebar", sel: ".sidebar-menu-button" },
  accordion: { file: "accordion", sel: ".accordion-trigger" },
  tabs: { file: "tabs", sel: ".tabs-trigger" },
  "button-group": { file: "button", sel: ".btn-group" },
};

const NUMERIC = ["height", "paddingX", "paddingY", "radius", "fontSize", "fontWeight", "gap", "border"];
function shadcnNum(rm, key) {
  if (!rm) return null;
  if (key === "fontSize") return rm.fontSize ? toPx(rm.fontSize.split("/")[0]) : null;
  if (key === "radius") return rm.radius != null ? resolveRadiusToken(rm.radius, "shadcn") : null;
  const v = rm[key];
  if (v == null) return null;
  if (key === "fontWeight" || key === "border") return key === "border" ? toPx(v) : v;
  return toPx(v);
}

const rows = [["component", "selector", "metric", "shadcn(px)", "shadcss(px)", "delta", "note"]];
const missing = [];
const focusGaps = [];

for (const [name, { file, sel }] of Object.entries(MAP)) {
  const fpath = path.join(SRC, "components", `${file}.css`);
  if (!existsSync(fpath)) { missing.push(`${name}: no css file ${file}.css`); continue; }
  const css = readFileSync(fpath, "utf8");
  const sm = shadcssMetrics(css, sel);
  if (!sm) { missing.push(`${name}: selector ${sel} not found in ${file}.css`); continue; }
  const target = spec[name]?.rootMetrics;
  if (!target) { missing.push(`${name}: no shadcn spec`); continue; }

  for (const key of NUMERIC) {
    const want = shadcnNum(target, key);
    const have = sm[key] ?? null;
    if (want == null) continue;
    if (have == null) { rows.push([name, sel, key, want, "MISSING", "", "shadcss omits"]); continue; }
    if (Math.abs(want - have) > 0.6) {
      rows.push([name, sel, key, want, have, +(have - want).toFixed(1), ""]);
    }
  }
  // focus model
  const wantsRing = target.focusRingWidth === "3px";
  const fb = sm._focusBlock || "";
  const usesOutline = /outline\s*:/.test(fb) && !/outline\s*:\s*none/.test(fb);
  const usesRing = /box-shadow\s*:/.test(fb);
  if (wantsRing && usesOutline && !usesRing) {
    focusGaps.push(name);
    rows.push([name, sel, "focus-model", "ring-3px/50+border-ring", "outline-2px", "", "signature shadcn focus differs"]);
  }
}

const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
writeFileSync(path.join(ROOT, "qa/fidelity/gaps.csv"), csv);

console.log(`\n=== FIDELITY GAPS (${rows.length - 1} metric diffs across ${Object.keys(MAP).length} mapped components) ===\n`);
for (const r of rows.slice(1)) {
  console.log(`  ${r[0].padEnd(16)} ${r[2].padEnd(13)} shadcn=${String(r[3]).padEnd(22)} shadcss=${String(r[4]).padEnd(10)} ${r[6]}`);
}
console.log(`\n  focus-model gap in ${focusGaps.length} components: ${focusGaps.join(", ")}`);
if (missing.length) {
  console.log(`\n=== NOT COMPARED (${missing.length}) ===`);
  for (const x of missing) console.log("  " + x);
}
console.log(`\nWrote qa/fidelity/gaps.csv`);
