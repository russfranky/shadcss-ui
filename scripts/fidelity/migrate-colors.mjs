// ==========================================================================
// scripts/fidelity/migrate-colors.mjs
// Migrate the color architecture from the old `hsl(var(--token))` contract to
// shadcn/Tailwind-v4-faithful full-color refs:
//   hsl(var(--X) / N)  ->  color-mix(in oklab, var(--X) (N*100)%, transparent)
//   hsl(var(--X))      ->  var(--X)
// Processes every .css under packages/shadcss/src EXCEPT base/tokens.css (which
// now defines the tokens as full OKLCH/hsl color values). Idempotent.
// ==========================================================================

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "../../packages/shadcss/src");

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (e.endsWith(".css")) out.push(p);
  }
  return out;
}

const fmtPct = (op) => {
  const n = parseFloat(op) * 100;
  return Number.isInteger(n) ? String(n) : String(+n.toFixed(2));
};

const OPACITY = /hsl\(\s*var\((--[\w-]+)\)\s*\/\s*([0-9]*\.?[0-9]+)\s*\)/g;
const BARE = /hsl\(\s*var\((--[\w-]+)\)\s*\)/g;

let totalFiles = 0, totalOpacity = 0, totalBare = 0;
for (const file of walk(SRC)) {
  if (file.endsWith(path.join("base", "tokens.css"))) continue;
  let css = readFileSync(file, "utf8");
  const before = css;
  let oc = 0, bc = 0;
  css = css.replace(OPACITY, (_m, tok, op) => { oc++; return `color-mix(in oklab, var(${tok}) ${fmtPct(op)}%, transparent)`; });
  css = css.replace(BARE, (_m, tok) => { bc++; return `var(${tok})`; });
  if (css !== before) {
    writeFileSync(file, css);
    totalFiles++; totalOpacity += oc; totalBare += bc;
    console.log(`  ${path.relative(SRC, file).padEnd(34)} ${bc} bare, ${oc} opacity`);
  }
}
console.log(`\nMigrated ${totalFiles} files: ${totalBare} bare + ${totalOpacity} opacity = ${totalBare + totalOpacity} total.`);
