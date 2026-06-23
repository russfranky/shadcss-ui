// Capture full-resolution vertical strips of the showcase for detail review.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../../qa/fidelity/shots");
mkdirSync(OUT, { recursive: true });
const url = process.argv[2] || "http://127.0.0.1:3333/index.html";
const theme = process.argv[3] || "light";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 950 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" });
if (theme === "dark") await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
await page.waitForTimeout(300);

const height = await page.evaluate(() => document.body.scrollHeight);
const step = 900;
let i = 0;
for (let y = 0; y < height; y += step) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(OUT, `${theme}-strip-${String(i).padStart(2, "0")}.png`) });
  i++;
}
await browser.close();
console.log(`captured ${i} ${theme} strips (page height ${height}px)`);
