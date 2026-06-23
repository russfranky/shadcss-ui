// ==========================================================================
// scripts/fidelity/migrate-focus.mjs
// Replace shadcss's old `outline: 2px solid var(--ring); outline-offset: 2px`
// focus-visible treatment with shadcn's signature ring:
//   outline: none;
//   border-color: var(--ring);
//   box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent);
// Works for any `var(--*-ring)` token; removes the paired outline-offset line.
// Idempotent.
// ==========================================================================

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMP = path.resolve(__dirname, "../../packages/shadcss/src/components");

const block = (indent, ring) =>
  `${indent}outline: none;\n` +
  `${indent}border-color: var(${ring});\n` +
  `${indent}box-shadow: 0 0 0 3px color-mix(in oklab, var(${ring}) 50%, transparent);`;

// (a) outline + paired outline-offset
const WITH_OFFSET = /^([ \t]*)outline:\s*2px solid var\((--[\w-]+)\);\n[ \t]*outline-offset:\s*[^;]+;/gm;
// (b) standalone outline (no offset)
const STANDALONE = /^([ \t]*)outline:\s*2px solid var\((--[\w-]+)\);/gm;

let files = 0, count = 0;
for (const f of readdirSync(COMP).filter((x) => x.endsWith(".css"))) {
  const p = path.join(COMP, f);
  let css = readFileSync(p, "utf8");
  const before = css;
  css = css.replace(WITH_OFFSET, (_m, indent, ring) => { count++; return block(indent, ring); });
  css = css.replace(STANDALONE, (_m, indent, ring) => { count++; return block(indent, ring); });
  if (css !== before) { writeFileSync(p, css); files++; console.log(`  ${f}`); }
}
console.log(`\nFocus model updated in ${files} files (${count} blocks).`);
