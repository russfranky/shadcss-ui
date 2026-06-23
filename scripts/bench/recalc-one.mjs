// ==========================================================================
// scripts/bench/recalc-one.mjs
// Single-target style-recalc benchmark for the FRESHLY BUILT shadcss bundle.
// Unlike parse.mjs (which sweeps every peer framework and prints a table),
// this measures only dist/shadcss.min.css against a fixed neutral DOM and
// prints one machine-parseable line — the metric an optimization loop reads:
//
//   recalc_ms=<median>  parse_ms=<median>  rules=<n>
//
// Median of N inner iterations in one headless Chromium. Run it several times
// (the loop's `samples`) to get a cross-process noise floor.
// ==========================================================================

import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSS = path.resolve(__dirname, "../../packages/shadcss/dist/shadcss.min.css");
const N = 60;

// Same fixed, framework-neutral DOM as parse.mjs so recalc is measured against
// an identical tree (200 sections of mixed elements + a couple of card/badge
// class hooks that real shadcss rules actually match).
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

const css = readFileSync(CSS, "utf8");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<!doctype html><html><body>${NEUTRAL_DOM}</body></html>`);

const r = await page.evaluate(({ css, N }) => {
  const parse = [], recalc = [];
  let selectors = 0;
  for (let i = 0; i < N; i++) {
    const el = document.createElement("style");
    el.textContent = css;
    const p0 = performance.now();
    document.head.appendChild(el);
    const sheet = el.sheet;
    let count = 0;
    const walk = (rules) => { for (const rule of rules) { count++; if (rule.cssRules) walk(rule.cssRules); } };
    walk(sheet.cssRules);
    const p1 = performance.now();
    parse.push(p1 - p0);
    selectors = count;
    const r0 = performance.now();
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

await browser.close();
console.log(`recalc_ms=${median(r.recalc).toFixed(2)}  parse_ms=${median(r.parse).toFixed(2)}  rules=${r.selectors}`);
