// ==========================================================================
// shadcss · scripts/build.mjs
// Bundle src/shadcss.css → dist/shadcss.css + dist/shadcss.min.css using lightningcss.
// Supports `--watch` for development.
// ==========================================================================

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { bundle, transform } from "lightningcss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcEntry = path.join(root, "src", "shadcss.css");
const distDir = path.join(root, "dist");
const outCss = path.join(distDir, "shadcss.css");
const outMinCss = path.join(distDir, "shadcss.min.css");
const wwwCss = path.resolve(root, "..", "..", "apps", "www", "shadcss.min.css");
const registryPath = path.join(root, "registry.json");
const llmsOut = path.join(root, "llms.txt");
const wwwLlms = path.resolve(root, "..", "..", "apps", "www", "llms.txt");

const targets = {
  chrome: 111,
  firefox: 113,
  safari: 16,
  edge: 111,
};

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function readAndBundle() {
  const { code } = bundle({
    filename: srcEntry,
    targets,
    drafts: { customMedia: true },
    nonStandard: { deepSelectorCombinator: true },
  });
  return { code };
}

async function minify(code) {
  const { code: minified } = transform({
    filename: "shadcss.css",
    code,
    minify: true,
    sourceMap: false,
    targets,
  });
  return minified;
}

// Generate llms.txt from registry.json — an LLM-friendly, machine-readable
// index so agents emit correct, accessible shadcss markup. Kept in sync on
// every build.
async function genLlms() {
  const reg = JSON.parse(await fs.readFile(registryPath, "utf8"));
  const L = [];
  L.push("# shadcss", "");
  L.push("> shadcn/ui's aesthetic as zero-runtime HTML + CSS. " + reg.components.length + " components, no React/Radix/Tailwind, no JS framework, zero dependencies. Theme via CSS custom-property design tokens.", "");
  L.push("Live demo: https://shadcss.vercel.app  ·  npm: @russfranky/shadcss  ·  CLI: npx @russfranky/shadcss-cli add <component>", "");
  L.push("## How to use");
  L.push("- Import the bundle (`@import \"@russfranky/shadcss\"` via a bundler, or `dist/shadcss.min.css` by path / CDN), or copy individual `src/components/<name>.css` files (each depends only on `src/base/tokens.css`).");
  L.push("- Write semantic HTML with the classes below. Prefer native elements; only add ARIA where the component's a11y contract says to.");
  L.push("- `js` legend: none = zero JS · trigger = one native one-liner (showModal()/showPopover()) · consumer = you write real JS for full behavior.");
  L.push("- `status` legend: stable · partial (works, limited) · visual-only (styling only; behavior needs JS).", "");
  L.push("## Components");
  for (const c of reg.components) {
    L.push("", `### ${c.name} — status:${c.status || "stable"} · js:${c.js || "none"} · support:${c.support || "baseline"}`);
    if (c.description) L.push(c.description);
    L.push(`Classes: ${(c.classes || []).join(" ")}`);
    if (c.a11y) L.push(`A11y: ${c.a11y}`);
    if (c.markup) L.push("Markup: " + c.markup);
  }
  L.push("");
  await fs.writeFile(llmsOut, L.join("\n"));
  try { await fs.access(path.dirname(wwwLlms)); await fs.writeFile(wwwLlms, L.join("\n")); } catch {}
}

async function build() {
  const t0 = performance.now();
  await ensureDir(distDir);
  await genLlms();
  const { code } = readAndBundle();

  await fs.writeFile(outCss, code);
  const minified = await minify(code);
  await fs.writeFile(outMinCss, minified);

  // Copy the minified bundle into the showcase app for the local dev preview.
  // The showcase is a sibling app that may be absent (e.g. when the package is
  // built in isolation), so guard the copy and never fail the package build on
  // its account.
  try {
    await fs.access(path.dirname(wwwCss));
    await fs.writeFile(wwwCss, minified);
  } catch {
    // apps/www not present — skip the showcase copy.
  }

  const kbRaw = (code.length / 1024).toFixed(1);
  const kbMin = (minified.length / 1024).toFixed(1);
  const kbGzip = (gzipSync(minified).length / 1024).toFixed(1);
  const dt = (performance.now() - t0).toFixed(0);

  console.log(
    `\n  shadcss build complete (${dt}ms)\n` +
    `  ─────────────────────────────────────\n` +
    `  dist/shadcss.css        ${kbRaw.padStart(7)} KB  (expanded)\n` +
    `  dist/shadcss.min.css    ${kbMin.padStart(7)} KB  (minified)\n` +
    `  gzipped             ${kbGzip.padStart(7)} KB  (over the wire)\n`
  );
}

async function watch() {
  await build();
  console.log("  Watching for changes…\n");
  const srcDir = path.join(root, "src");
  let debounce;
  const { watch } = await import("node:fs");
  watch(srcDir, { recursive: true }, () => {
    clearTimeout(debounce);
    debounce = setTimeout(build, 100);
  });
}

const isWatch = process.argv.includes("--watch");
if (isWatch) {
  watch().catch((e) => { console.error(e); process.exit(1); });
} else {
  build().catch((e) => { console.error(e); process.exit(1); });
}
