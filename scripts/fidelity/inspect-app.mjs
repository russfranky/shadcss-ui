import { chromium } from "playwright";
const url = process.argv[2] || "http://127.0.0.1:4321/";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message.slice(0, 160)));
let status = "?";
try { const r = await page.goto(url, { waitUntil: "networkidle", timeout: 20000 }); status = r && r.status(); }
catch (e) { console.log("NAV FAIL:", e.message); }
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/hubzz-4321.png", fullPage: false });

const info = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const body = getComputedStyle(document.body);
  const tok = (n) => cs.getPropertyValue(n).trim();
  const sheets = [...document.styleSheets].map((s) => { try { return (s.href || "inline") + " (" + (s.cssRules ? s.cssRules.length : "?") + " rules)"; } catch { return (s.href || "inline") + " (blocked)"; } });
  const btn = document.querySelector('[data-slot="button"], button');
  const btnCs = btn ? getComputedStyle(btn) : null;
  return {
    htmlClass: document.documentElement.className || "(none)",
    bodyBg: body.backgroundColor, bodyColor: body.color, bodyFont: body.fontFamily,
    tokens: { background: tok("--background"), foreground: tok("--foreground"), primary: tok("--primary"), radius: tok("--radius") },
    rootText: document.body.innerText.slice(0, 120).replace(/\n+/g, " "),
    elementCount: document.querySelectorAll("*").length,
    btn: btnCs ? { text: btn.innerText.slice(0, 24), bg: btnCs.backgroundColor, radius: btnCs.borderRadius, color: btnCs.color } : "(no button found)",
    sheetCount: sheets.length, sheets: sheets.slice(0, 8),
  };
});
await browser.close();
console.log("HTTP status:", status);
console.log(JSON.stringify(info, null, 2));
console.log("console errors:", errors.length ? errors : "(none)");
