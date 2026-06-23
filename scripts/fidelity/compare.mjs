// ==========================================================================
// scripts/fidelity/compare.mjs  (v2 — comprehensive)
// Diff shadcss CSS against the shadcn target spec across EVERY data-slot
// (root + sub-elements like titles/descriptions), covering: line-height,
// colors/foreground tokens, and box metrics (height/padding/radius/font/gap/
// border). v1 only diffed 8 numeric metrics on root elements, which is why
// line-heights and the badge foreground convention slipped through.
// Output: qa/fidelity/gaps.csv + console report.
// ==========================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "packages/shadcss/src");
const spec = JSON.parse(readFileSync(path.join(ROOT, "qa/fidelity/shadcn-spec.json"), "utf8"));
const tokensCss = readFileSync(path.join(SRC, "base/tokens.css"), "utf8");

const REM = 16;
function tokenVal(name) { const m = tokensCss.match(new RegExp(`--${name}:\\s*([^;]+);`)); return m ? m[1].trim() : null; }
function toPx(v) { if (v == null) return null; v = String(v).trim(); if (v.endsWith("px")) return parseFloat(v); if (v.endsWith("rem")) return parseFloat(v) * REM; if (v === "0") return 0; return null; }
function resolveShadcss(v) {
  if (v == null) return null; v = v.trim();
  const vm = v.match(/^var\(--([\w-]+)\)$/); if (vm) return toPx(tokenVal(vm[1]));
  const cm = v.match(/^calc\(\s*var\(--([\w-]+)\)\s*([+\-])\s*([\d.]+)px\s*\)$/);
  if (cm) { const b = toPx(tokenVal(cm[1])); if (b == null) return null; return cm[2] === "+" ? b + parseFloat(cm[3]) : b - parseFloat(cm[3]); }
  return toPx(v);
}
const SHADCN_RADIUS = 0.625 * REM;
function resolveShadcnRadius(name) { switch (name) { case "radius-sm": return SHADCN_RADIUS - 4; case "radius-md": return SHADCN_RADIUS - 2; case "radius-lg": return SHADCN_RADIUS; case "radius-xl": return SHADCN_RADIUS + 4; default: return SHADCN_RADIUS; } }
function resolveRadiusToken(v) { if (v == null) return null; if (v === "9999px") return 9999; if (v === "0") return 0; const vm = v.match(/^var\(--([\w-]+)\)$/); if (vm) return resolveShadcnRadius(vm[1]); return toPx(v); }

function readBlock(css, selector) {
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\w-])\\s*\\{", "g");
  const m = re.exec(css); if (!m) return null;
  const start = m.index + m[0].length; const end = css.indexOf("}", start);
  return end === -1 ? null : css.slice(start, end);
}
function decl(block, prop) { if (!block) return null; const m = block.match(new RegExp(`(?:^|[;{\\s])${prop}\\s*:\\s*([^;]+);`)); return m ? m[1].trim() : null; }

// normalize a shadcss color value to a comparable token name
function colorToken(v) {
  if (!v) return null; v = v.trim();
  if (/color-mix/.test(v)) { const m = v.match(/var\(--([\w-]+)\)/); return m ? "mix:" + m[1] : "mix"; }
  const m = v.match(/var\(--([\w-]+)\)/); if (m) return m[1];
  if (/^(#fff|#ffffff|white)$/i.test(v)) return "white";
  if (/^(#000|#000000|black)$/i.test(v)) return "black";
  if (v === "transparent" || v === "currentColor" || v === "inherit") return v;
  return v.slice(0, 18);
}
// shadcn colorRef -> comparable token
function shadcnColor(ref) { if (!ref) return null; if (ref.token === "white") return "white"; return ref.token; }

function shadcssAt(css, selector) {
  const b = readBlock(css, selector); if (b == null) return null;
  const out = { _sel: selector };
  const h = decl(b, "height"); if (h) out.height = resolveShadcss(h);
  const pad = decl(b, "padding");
  if (pad) { const p = pad.split(/\s+/); if (p.length === 2) { out.paddingY = resolveShadcss(p[0]); out.paddingX = resolveShadcss(p[1]); } else if (p.length === 1) { out.paddingY = out.paddingX = resolveShadcss(p[0]); } else if (p.length >= 4) { out.paddingY = resolveShadcss(p[0]); out.paddingX = resolveShadcss(p[1]); } }
  const r = decl(b, "border-radius"); if (r) out.radius = resolveShadcss(r);
  const fs = decl(b, "font-size"); if (fs) out.fontSize = resolveShadcss(fs);
  const fw = decl(b, "font-weight"); if (fw) out.fontWeight = parseInt(fw, 10);
  const g = decl(b, "gap"); if (g) out.gap = resolveShadcss(g);
  out.lineHeightRaw = decl(b, "line-height");
  out.color = colorToken(decl(b, "color"));
  out.bg = colorToken(decl(b, "background") || decl(b, "background-color"));
  return out;
}

// name -> shadcss primary file + root selector (root only; sub-slots derive .{slot})
const MAP = {
  button: { file: "button", sel: ".btn" }, badge: { file: "badge", sel: ".badge" },
  input: { file: "input", sel: ".input" }, textarea: { file: "textarea", sel: ".textarea" },
  card: { file: "card", sel: ".card" }, alert: { file: "alert", sel: ".alert" },
  switch: { file: "switch", sel: ".switch" }, checkbox: { file: "checkbox", sel: ".checkbox" },
  "radio-group": { file: "radio", sel: ".radio" }, select: { file: "select", sel: ".select" },
  label: { file: "label", sel: ".label" }, avatar: { file: "avatar", sel: ".avatar" },
  skeleton: { file: "skeleton", sel: ".skeleton" }, progress: { file: "progress", sel: ".progress" },
  separator: { file: "separator", sel: ".separator" }, tooltip: { file: "tooltip", sel: ".tooltip" },
  popover: { file: "popover", sel: ".popover" }, dialog: { file: "dialog", sel: ".dialog" },
  "alert-dialog": { file: "alert-dialog", sel: ".alert-dialog" }, sheet: { file: "sheet", sel: ".sheet" },
  "dropdown-menu": { file: "dropdown", sel: ".dropdown-menu" }, menubar: { file: "menubar", sel: ".menubar" },
  command: { file: "command", sel: ".command" }, breadcrumb: { file: "breadcrumb", sel: ".breadcrumb" },
  pagination: { file: "pagination", sel: ".pagination" }, table: { file: "table", sel: ".table" },
  sonner: { file: "sonner", sel: ".sonner" }, slider: { file: "slider", sel: ".slider" },
  toggle: { file: "toggle", sel: ".toggle" }, "toggle-group": { file: "toggle-group", sel: ".toggle-group" },
  kbd: { file: "kbd", sel: ".kbd" }, accordion: { file: "accordion", sel: ".accordion" },
  tabs: { file: "tabs", sel: ".tabs" }, "hover-card": { file: "hover-card", sel: ".hover-card" },
  sidebar: { file: "sidebar", sel: ".sidebar" }, field: { file: "field", sel: ".field" },
  calendar: { file: "calendar", sel: ".calendar" }, "navigation-menu": { file: "navigation-menu", sel: ".navigation-menu" },
};

const NUMERIC = ["height", "paddingX", "paddingY", "radius", "fontSize", "fontWeight", "gap"];
function shadcnNum(rm, key) {
  if (!rm) return null;
  if (key === "fontSize") return rm.fontSize ? toPx(rm.fontSize) : null;
  if (key === "radius") return rm.radius != null ? resolveRadiusToken(rm.radius) : null;
  const v = rm[key]; if (v == null) return null;
  if (key === "fontWeight") return v;
  return toPx(v);
}

const rows = [["component", "slot", "metric", "shadcn", "shadcss", "note"]];
const lineHeightRows = [];
const colorRows = [];

function compareSlot(comp, slotName, sel, css, target) {
  const have = shadcssAt(css, sel);
  if (!have) { rows.push([comp, slotName, "—", "", "(selector " + sel + " not found)", "skip"]); return; }
  // numeric box metrics
  for (const key of NUMERIC) {
    const want = shadcnNum(target, key); if (want == null) continue;
    const got = have[key]; if (got == null) continue;
    if (Math.abs(want - got) > 0.6) rows.push([comp, slotName, key, want + "px", got + "px", ""]);
  }
  // line-height
  const src = target._lhSource;
  if (src) {
    const wantLH = String(target.lineHeight);
    const rawLH = have.lineHeightRaw;
    if (src.startsWith("leading-")) {
      const canon = parseFloat(wantLH);
      const num = rawLH && /^[0-9.]+$/.test(rawLH) ? parseFloat(rawLH) : null;
      if (num == null) lineHeightRows.push([comp, slotName, `${src} (${canon})`, rawLH || "(none)", "shadcss not a matching unitless ratio"]);
      else if (Math.abs(num - canon) > 0.03) lineHeightRows.push([comp, slotName, `${src} (${canon})`, rawLH, `off by ${(num - canon).toFixed(3)}`]);
    } else if (src === "type-scale") {
      // Only prose (descriptions/content/body) needs to track the type-scale ratio;
      // single-line controls legitimately use line-height:1 (identical under
      // inline-flex+items-center), and titles legitimately use leading-none.
      const isProse = /description|content|body|caption/.test(slotName);
      if (isProse && rawLH && /^[0-9.]+$/.test(rawLH)) {
        const fs = target.fontSize ? parseFloat(target.fontSize) : null;
        const ratio = fs ? parseFloat(wantLH) / fs : null;
        const got = parseFloat(rawLH);
        if (ratio && Math.abs(got - ratio) > 0.18)
          lineHeightRows.push([comp, slotName, `type-scale ≈${ratio.toFixed(2)}`, rawLH, `off by ${(got - ratio).toFixed(2)}`]);
      }
    }
  }
  // colors
  const wantText = shadcnColor(target.text), wantBg = shadcnColor(target.bg);
  if (wantText && have.color && wantText !== have.color && !(wantText === "white" && have.color === "white"))
    colorRows.push([comp, slotName, "color", wantText, have.color]);
  if (wantBg && have.bg && wantBg !== have.bg)
    colorRows.push([comp, slotName, "background", wantBg, have.bg]);
}

for (const [name, { file, sel }] of Object.entries(MAP)) {
  const fpath = path.join(SRC, "components", `${file}.css`);
  if (!existsSync(fpath)) continue;
  const css = readFileSync(fpath, "utf8");
  const sp = spec[name]; if (!sp) continue;
  if (sp.rootMetrics) compareSlot(name, "(root)", sel, css, sp.rootMetrics);
  for (const [slot, m] of Object.entries(sp.slots || {})) {
    if (slot === name) continue; // root handled
    compareSlot(name, slot, "." + slot, css, m);
  }
}

const csv = [...rows, [], ["LINE-HEIGHT DEVIATIONS"], ["component","slot","shadcn canon","shadcss","note"], ...lineHeightRows, [], ["COLOR/TOKEN DEVIATIONS"], ["component","slot","metric","shadcn","shadcss"], ...colorRows]
  .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
writeFileSync(path.join(ROOT, "qa/fidelity/gaps.csv"), csv);

console.log(`\n=== LINE-HEIGHT DEVIATIONS (${lineHeightRows.length}) ===`);
for (const r of lineHeightRows) console.log(`  ${r[0]}/${r[1]}`.padEnd(34) + `want ${String(r[2]).padEnd(22)} have ${String(r[3]).padEnd(8)} ${r[4]}`);
console.log(`\n=== COLOR/FOREGROUND DEVIATIONS (${colorRows.length}) ===`);
for (const r of colorRows) console.log(`  ${r[0]}/${r[1]}`.padEnd(34) + `${r[2].padEnd(11)} shadcn=${String(r[3]).padEnd(20)} shadcss=${r[4]}`);
console.log(`\n=== BOX-METRIC DEVIATIONS (${rows.length-1}) ===`);
for (const r of rows.slice(1)) console.log(`  ${r[0]}/${r[1]}`.padEnd(30) + `${r[2].padEnd(12)} shadcn=${String(r[3]).padEnd(10)} shadcss=${String(r[4]).padEnd(12)} ${r[5]}`);
console.log(`\nWrote qa/fidelity/gaps.csv`);
