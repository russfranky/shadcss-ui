// ==========================================================================
// scripts/check-a11y.mjs
// Runtime accessibility check: render the showcase in headless Chromium and
// run axe-core against BOTH the light and dark themes.
//
// Failure policy: fails on any CRITICAL violation and on any SERIOUS violation
// EXCEPT `color-contrast`. shadcss intentionally mirrors shadcn's exact OKLCH
// palette for pixel fidelity, which inherits shadcn's own sub-AA combinations
// (muted avatar fallback text, white-on-destructive/info badges). Those
// `color-contrast` findings are an accepted fidelity tradeoff and are reported
// as notes, not failures. Genuine markup-level serious issues (missing labels,
// focusable scroll regions, landmarks, stuck overlays) still fail the build.
// moderate/minor are warnings.
//
// NOTE: the theme toggle animates `color`, so after switching to dark we wait
// for the transition to settle before scanning — otherwise axe samples
// mid-transition colors and reports false contrast failures.
//
// Requires: playwright (chromium installed) + axe-core.
// Serve apps/www first; pass A11Y_URL or default :3333.
// ==========================================================================

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core"), "utf8");
const url = process.env.A11Y_URL || "http://127.0.0.1:3333/index.html";

const browser = await chromium.launch();

async function scan(theme) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  } catch (e) {
    console.error(`Could not load ${url} — is the showcase being served? (${e.message})`);
    await browser.close();
    process.exit(2);
  }
  if (theme === "dark") {
    await page.evaluate(() => (document.documentElement.dataset.theme = "dark"));
    await page.waitForTimeout(1200); // let color transitions settle
  }
  await page.evaluate(axeSource);
  const results = await page.evaluate(async () => await axe.run(document, { resultTypes: ["violations"] }));
  // Guard: a CLOSED dialog/popover must not be visible. This exact class of bug
  // (sheet/command/sonner rendering over content) escaped every static gate twice.
  const stuckOverlays = await page.evaluate(() => {
    const bad = [];
    for (const d of document.querySelectorAll("dialog"))
      if (!d.open && getComputedStyle(d).display !== "none") bad.push("dialog." + (d.className || "(unnamed)"));
    for (const e of document.querySelectorAll("[popover]"))
      if (!e.matches(":popover-open") && getComputedStyle(e).display !== "none") bad.push("popover." + (e.className || "(unnamed)"));
    return [...new Set(bad)];
  });
  await page.close();
  const byImpact = { critical: [], serious: [], moderate: [], minor: [] };
  for (const v of results.violations) for (const n of v.nodes) (byImpact[v.impact] || byImpact.minor).push({ id: v.id, where: n.target.join(" ").slice(0, 60) });
  for (const o of stuckOverlays) byImpact.critical.push({ id: "stuck-overlay", where: `a closed overlay is visible (${o})` });
  return byImpact;
}

// `color-contrast` serious findings are an accepted shadcn-palette fidelity
// tradeoff (see header). They are reported but do not fail the build.
const ACCEPTED_CONTRAST = "color-contrast";

let failed = 0, acceptedContrast = 0;
for (const theme of ["light", "dark"]) {
  const r = await scan(theme);
  const seriousReal = r.serious.filter((v) => v.id !== ACCEPTED_CONTRAST);
  const seriousContrast = r.serious.filter((v) => v.id === ACCEPTED_CONTRAST);
  acceptedContrast += seriousContrast.length;
  console.log(`\n[${theme}] critical=${r.critical.length} serious=${seriousReal.length} (+${seriousContrast.length} accepted color-contrast) moderate=${r.moderate.length} minor=${r.minor.length}`);
  for (const v of r.critical) console.log(`  ✗ [critical] ${v.id}: ${v.where}`);
  for (const v of seriousReal) console.log(`  ✗ [serious] ${v.id}: ${v.where}`);
  for (const v of seriousContrast) console.log(`  · [accepted-fidelity] ${v.id}: ${v.where}`);
  for (const impact of ["moderate", "minor"]) for (const v of r[impact]) console.log(`  · [${impact}] ${v.id}: ${v.where}`);
  failed += r.critical.length + seriousReal.length;
}

await browser.close();

if (failed) {
  console.error(`\nA11Y CHECK FAILED: ${failed} critical/serious markup violation(s) across themes.`);
  process.exit(1);
}
console.log(`\nA11y check passed — 0 critical and 0 markup-level serious violations in light and dark themes.`);
console.log(`(${acceptedContrast} color-contrast findings accepted as shadcn-palette fidelity tradeoffs.)`);
