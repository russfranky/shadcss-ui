// ==========================================================================
// scripts/check-consistency.mjs
// Guards against the version / count / size / claim drift that QA iterations
// 1 and 2 kept finding. Run after build. Exits non-zero on any mismatch.
// No dependencies — plain Node.
// ==========================================================================

import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const r = (p) => path.join(root, p);
const read = (p) => readFileSync(r(p), "utf8");
const json = (p) => JSON.parse(read(p));

const errors = [];
const ok = [];
const fail = (m) => errors.push(m);
const pass = (m) => ok.push(m);

// 1) Version consistency across the three sources of truth
const vRoot = json("package.json").version;
const vPkg = json("packages/shadcss/package.json").version;
const vReg = json("packages/shadcss/registry.json").version;
if (vRoot === vPkg && vPkg === vReg) pass(`version consistent (${vRoot})`);
else fail(`version drift: root=${vRoot} pkg=${vPkg} registry=${vReg}`);

// 2) Component count: css files == registry entries == doc claims
const cssFiles = readdirSync(r("packages/shadcss/src/components")).filter((f) => f.endsWith(".css"));
const nCss = cssFiles.length;
const nReg = json("packages/shadcss/registry.json").components.length;
if (nCss === nReg) pass(`component count consistent (${nCss} css == ${nReg} registry)`);
else fail(`component count drift: ${nCss} css files vs ${nReg} registry entries`);

const docFiles = ["README.md", "packages/shadcss/README.md", "apps/www/index.html"];
for (const f of docFiles) {
  const t = read(f);
  const badge = t.match(/components-(\d+)/);
  if (badge && Number(badge[1]) !== nCss) fail(`${f}: components badge says ${badge[1]}, actual ${nCss}`);
  const heading = t.match(/Components \((\d+)\)/);
  if (heading && Number(heading[1]) !== nCss) fail(`${f}: "Components (${heading[1]})" heading, actual ${nCss}`);
}
pass(`doc component-count references checked against ${nCss}`);

// 3) gzip size badge matches the actual built bundle (±0.3 KB tolerance)
const minPath = "packages/shadcss/dist/shadcss.min.css";
let actualGz = null;
try {
  actualGz = gzipSync(readFileSync(r(minPath))).length / 1024;
} catch {
  fail(`${minPath} missing — run the build before this check`);
}
if (actualGz != null) {
  for (const f of ["README.md", "packages/shadcss/README.md"]) {
    const t = read(f);
    const badge = t.match(/gzipped-([\d.]+)%20KB/);
    if (badge) {
      const claimed = Number(badge[1]);
      if (Math.abs(claimed - actualGz) > 0.3) fail(`${f}: gzip badge ${claimed} KB vs actual ${actualGz.toFixed(1)} KB`);
    }
  }
  pass(`gzip badge checked against actual ${actualGz.toFixed(1)} KB`);
}

// 4) No absolutist "0 JavaScript" claims (the iter-1 false-claim defect)
const claimRe = /0 lines of JavaScript|zero JavaScript/i;
for (const f of ["README.md", "packages/shadcss/README.md", "packages/shadcss/AI_GUIDE.md", "apps/www/index.html", "package.json", "packages/shadcss/package.json"]) {
  if (claimRe.test(read(f))) fail(`${f}: re-introduced an absolutist "0 JavaScript" claim`);
}
pass(`no absolutist 0-JS claims`);

// 5) registry must NOT claim the shadcn $schema (it does not conform)
const regRaw = json("packages/shadcss/registry.json");
if ("$schema" in regRaw && String(regRaw.$schema).includes("ui.shadcn.com")) fail(`registry.json re-added the shadcn $schema (non-conforming)`);
else pass(`registry has no false shadcn $schema`);

// Report
for (const m of ok) console.log(`  ok   ${m}`);
if (errors.length) {
  console.error(`\nCONSISTENCY CHECK FAILED (${errors.length}):`);
  for (const m of errors) console.error(`  ✗ ${m}`);
  process.exit(1);
}
console.log(`\nConsistency check passed (${ok.length} checks).`);
