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

async function build() {
  const t0 = performance.now();
  await ensureDir(distDir);
  const { code } = readAndBundle();

  await fs.writeFile(outCss, code);
  const minified = await minify(code);
  await fs.writeFile(outMinCss, minified);

  // Copy the minified bundle into the showcase app for the local dev preview.
  await fs.writeFile(wwwCss, minified);

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
