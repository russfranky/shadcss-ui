// ==========================================================================
// scripts/fidelity/fix-lineheights.mjs
// Align component line-heights (and a few font-size/weight) to shadcn canon,
// per the comprehensive compare.mjs report:
//   - titles        -> line-height: 1        (shadcn leading-none)
//   - descriptions  -> line-height: 1.5      (shadcn type-scale/normal)
//   - field-label   -> 1.375                 (leading-snug)
//   - field desc/err-> 1.5 + font-size text-sm (shadcn text-sm, was text-xs)
//   - accordion body-> 1.5
//   - popover-title -> font-weight 500       (shadcn font-medium)
// Single-line controls keep line-height:1 (functionally identical under
// inline-flex + items-center; not touched).
// ==========================================================================

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(__dirname, "../../packages/shadcss/src/components");

const TITLES = ["card", "dialog", "alert-dialog", "drawer", "sheet", "popover", "hover-card", "alert"];
const FIX = [
  ...TITLES.map((c) => ({ file: c, sel: `.${c}-title`, set: { "line-height": "1" } })),
  ...TITLES.map((c) => ({ file: c, sel: `.${c}-description`, set: { "line-height": "1.5" } })),
  { file: "accordion", sel: ".accordion-content", set: { "line-height": "1.5" } },
  { file: "field", sel: ".field-label", set: { "line-height": "1.375" } },
  { file: "field", sel: ".field-description", set: { "line-height": "1.5", "font-size": "var(--text-sm)" } },
  { file: "field", sel: ".field-error", set: { "line-height": "1.5", "font-size": "var(--text-sm)" } },
  { file: "popover", sel: ".popover-title", set: { "font-weight": "500" } },
];

function setDecl(block, prop, val) {
  const re = new RegExp(`(^|[;{\\s])${prop}\\s*:\\s*[^;]+;`);
  if (re.test(block)) return block.replace(re, `$1${prop}: ${val};`);
  return block.replace(/\s*$/, `\n    ${prop}: ${val};\n  `);
}

let fixed = 0, missed = [];
for (const { file, sel, set } of FIX) {
  const p = path.join(DIR, `${file}.css`);
  let css;
  try { css = readFileSync(p, "utf8"); } catch { missed.push(`${file} (no file)`); continue; }
  const re = new RegExp(sel.replace(/[.]/g, "\\.") + "(?![\\w-])\\s*\\{([^}]*)\\}");
  const m = css.match(re);
  if (!m) { missed.push(`${file} ${sel}`); continue; }
  let block = m[1];
  for (const [prop, val] of Object.entries(set)) block = setDecl(block, prop, val);
  const open = m[0].indexOf("{");
  const newFull = m[0].slice(0, open + 1) + block + "}";
  css = css.slice(0, m.index) + newFull + css.slice(m.index + m[0].length);
  writeFileSync(p, css);
  console.log(`  fixed ${file} ${sel} -> ${JSON.stringify(set)}`);
  fixed++;
}
console.log(`\n${fixed} rules updated.` + (missed.length ? `  Missed: ${missed.join(", ")}` : ""));
