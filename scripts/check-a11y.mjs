// ==========================================================================
// scripts/check-a11y.mjs
// Runtime accessibility check: render the showcase in headless Chromium and
// run axe-core against it. Converts the by-inspection ARIA work into a
// verified gate. Fails on CRITICAL violations; reports serious/moderate/minor.
//
// Why only critical fails the build: shadcss is a CSS-only library, so some
// interactivity legitimately needs consumer-supplied JS/ARIA (documented
// waivers — menus keyboard nav, tooltip AT exposure, etc.). Critical axe
// violations indicate genuinely broken markup, which is what we gate on.
//
// Requires: playwright (chromium installed) + axe-core. CI installs these.
// Run a static server for apps/www first; pass A11Y_URL or default :3333.
// ==========================================================================

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core"), "utf8");

const url = process.env.A11Y_URL || "http://127.0.0.1:3333/index.html";

const browser = await chromium.launch();
const page = await browser.newPage();
try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
} catch (e) {
  console.error(`Could not load ${url} — is the showcase being served? (${e.message})`);
  await browser.close();
  process.exit(2);
}

await page.evaluate(axeSource);
const results = await page.evaluate(async () => {
  // eslint-disable-next-line no-undef
  return await axe.run(document, { resultTypes: ["violations"] });
});
await browser.close();

const byImpact = { critical: [], serious: [], moderate: [], minor: [] };
for (const v of results.violations) (byImpact[v.impact] || byImpact.minor).push(v);

const line = (v) => `    [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"}) — ${v.helpUrl}`;
console.log(`axe-core on ${url}`);
for (const impact of ["critical", "serious", "moderate", "minor"]) {
  const vs = byImpact[impact];
  console.log(`  ${impact}: ${vs.length}`);
  for (const v of vs) console.log(line(v));
}

if (byImpact.critical.length) {
  console.error(`\nA11Y CHECK FAILED: ${byImpact.critical.length} critical violation(s).`);
  process.exit(1);
}
console.log(`\nA11y check passed (no critical violations). ` +
  `serious=${byImpact.serious.length} moderate=${byImpact.moderate.length} minor=${byImpact.minor.length} reported as warnings.`);
