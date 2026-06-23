// ==========================================================================
// scripts/bench/parse.mjs
// Browser-side load cost in headless Chromium for each CSS framework:
//   - CSSOM parse time  (insert <style>, force cssRules access) — DOM-independent
//   - style recalc time (apply to a fixed neutral DOM, force reflow)
//   - selector count    (from the parsed CSSOM)
// Median over N runs. Pure CSS cost only — no framework JS involved.
// ==========================================================================

import { chromium } from "playwright";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(__dirname, "../../.refs/bench/css");
const N = 25;

// A fixed, framework-neutral DOM so recalc is measured against the same tree.
const NEUTRAL_DOM = `
  <main><nav><a href="#">A</a><a href="#">B</a></nav>
  ${Array.from({ length: 200 }, (_, i) => `
    <section><h2>H${i}</h2><p>para <a href="#">link</a> <code>code</code></p>
    <button>btn</button><input value="x"><label>lab</label>
    <ul><li>one</li><li>two</li></ul>
    <div class="card"><div class="card-body"><span class="badge">b</span></div></div>
    <table><thead><tr><th>h</th></tr></thead><tbody><tr><td>d</td></tr></tbody></table>
    </section>`).join("")}
  </main>`;

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<!doctype html><html><body>${NEUTRAL_DOM}</body></html>`);

const files = readdirSync(DIR).filter((x) => x.endsWith(".css"));
const results = [];
for (const f of files) {
  const css = readFileSync(path.join(DIR, f), "utf8");
  const r = await page.evaluate(({ css, N }) => {
    const parse = [], recalc = [];
    let selectors = 0;
    for (let i = 0; i < N; i++) {
      const el = document.createElement("style");
      el.textContent = css;
      // --- parse: time to build CSSOM (force by reading cssRules) ---
      const p0 = performance.now();
      document.head.appendChild(el);
      const sheet = el.sheet;
      let count = 0;
      const walk = (rules) => { for (const rule of rules) { count++; if (rule.cssRules) walk(rule.cssRules); } };
      walk(sheet.cssRules);
      const p1 = performance.now();
      parse.push(p1 - p0);
      selectors = count;
      // --- recalc: force a full style/layout pass with the sheet applied ---
      const r0 = performance.now();
      // invalidate + force layout
      document.body.style.zoom = String(1 + (i % 2) * 0.0001);
      void document.body.offsetHeight;
      getComputedStyle(document.querySelector("button")).color;
      getComputedStyle(document.querySelector("a")).color;
      const r1 = performance.now();
      recalc.push(r1 - r0);
      el.remove();
    }
    return { parse, recalc, selectors };
  }, { css, N });
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  results.push({ f: f.replace(".min.css", ""), parse: med(r.parse), recalc: med(r.recalc), selectors: r.selectors });
}
await browser.close();

results.sort((a, b) => a.parse - b.parse);
const pad = (s, n) => String(s).padEnd(n);
const padL = (s, n) => String(s).padStart(n);
console.log(pad("framework", 14) + padL("parse ms", 12) + padL("recalc ms", 12) + padL("CSSOM rules", 14));
console.log("-".repeat(52));
for (const r of results) {
  console.log(pad(r.f, 14) + padL(r.parse.toFixed(2), 12) + padL(r.recalc.toFixed(2), 12) + padL(r.selectors, 14));
}
console.log(`\n(median of ${N} runs; recalc against a fixed neutral DOM)`);
