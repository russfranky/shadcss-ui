// ==========================================================================
// scripts/bench/sizes.mjs
// Transfer-size comparison of shadcss vs peer CSS frameworks: raw / gzip /
// brotli bytes + a rough rule count. CSS-only libraries only (shadcn is not a
// standalone CSS file — see bench/SUMMARY for that architectural comparison).
// ==========================================================================

import { readFileSync, readdirSync } from "node:fs";
import { gzipSync, brotliCompressSync, constants } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(__dirname, "../../.refs/bench/css");

// scope labels for honest comparison (these libs differ wildly in intent)
const SCOPE = {
  "shadcss.min.css": "52 components + thin utils (BYO Tailwind for grid/full utils)",
  "bootstrap.min.css": "full framework (components+utilities+grid)",
  "bulma.min.css": "full framework (components+helpers)",
  "pico.min.css": "classless + semantic elements",
  "openprops.min.css": "design tokens only (no components)",
  "tachyons.min.css": "atomic utilities",
  "water.min.css": "classless drop-in",
};

const kb = (n) => (n / 1024).toFixed(1);
const rows = [];
for (const f of readdirSync(DIR).filter((x) => x.endsWith(".css"))) {
  const buf = readFileSync(path.join(DIR, f));
  const gz = gzipSync(buf, { level: 9 }).length;
  const br = brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
  const rules = (buf.toString().match(/}/g) || []).length; // rough rule-block count
  rows.push({ f, raw: buf.length, gz, br, rules, scope: SCOPE[f] || "" });
}
rows.sort((a, b) => a.gz - b.gz);

const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);
console.log(pad("framework", 20) + padL("raw KB", 9) + padL("gzip KB", 9) + padL("brotli KB", 11) + padL("rules", 8) + "  scope");
console.log("-".repeat(95));
for (const r of rows) {
  console.log(
    pad(r.f.replace(".min.css", ""), 20) +
    padL(kb(r.raw), 9) + padL(kb(r.gz), 9) + padL(kb(r.br), 11) + padL(r.rules, 8) +
    "  " + r.scope
  );
}
console.log("\nNote: gzip is the common over-the-wire metric; brotli is what modern CDNs serve.");
