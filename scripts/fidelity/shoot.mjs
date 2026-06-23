// ==========================================================================
// scripts/fidelity/shoot.mjs
// Render the showcase in headless Chromium (light + dark) and save PNGs for
// visual fidelity review. Also captures a tight crop of the top controls.
// Usage: node scripts/fidelity/shoot.mjs [url]
// ==========================================================================

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../../qa/fidelity/shots");
mkdirSync(OUT, { recursive: true });
const url = process.argv[2] || "http://127.0.0.1:3333/index.html";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(400);

// light
await page.screenshot({ path: path.join(OUT, "light-full.png"), fullPage: true });
// a tight top crop (buttons/badges/inputs region) for detail
await page.screenshot({ path: path.join(OUT, "light-top.png"), clip: { x: 0, y: 0, width: 1440, height: 1000 } });

// dark
await page.evaluate(() => { document.documentElement.setAttribute("data-theme", "dark"); });
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "dark-full.png"), fullPage: true });
await page.screenshot({ path: path.join(OUT, "dark-top.png"), clip: { x: 0, y: 0, width: 1440, height: 1000 } });

await browser.close();
console.log("wrote light-full/light-top/dark-full/dark-top.png to qa/fidelity/shots/");
