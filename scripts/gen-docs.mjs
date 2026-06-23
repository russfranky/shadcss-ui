// ==========================================================================
// scripts/gen-docs.mjs
// Generate a static docs site from registry.json into apps/www/docs/.
// One page per component (preview + markup + install + a11y contract + the
// status/js/support metadata), plus an index. Built from the registry so it
// stays in sync; the docs dogfood shadcss's own CSS.
// Exported as genDocs(repoRoot); also runnable directly.
// ==========================================================================

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const PKG = "@russfranky/shadcss";

const badge = (label, val) => {
  const tone = {
    stable: "badge-success", partial: "badge-warning", "visual-only": "badge-secondary",
    none: "badge-success", trigger: "badge-info", consumer: "badge-warning",
  }[val] || "badge-secondary";
  return `<span class="badge ${tone}">${esc(label)}: ${esc(val)}</span>`;
};

const DOCS_CSS = `
:root{--docs-side:15rem}
*{box-sizing:border-box}
body{margin:0;font-family:var(--font-sans,system-ui,sans-serif);background:hsl(var(--background));color:hsl(var(--foreground))}
.docs-layout{display:grid;grid-template-columns:var(--docs-side) minmax(0,1fr);min-height:100vh}
.docs-sidebar{border-inline-end:1px solid hsl(var(--border));padding:var(--space-5) var(--space-4);position:sticky;top:0;align-self:start;height:100vh;overflow:auto}
.docs-brand{display:flex;align-items:center;gap:var(--space-2);font-weight:600;margin-bottom:var(--space-5)}
.docs-brand svg{width:1.25rem;height:1.25rem}
.docs-nav{display:flex;flex-direction:column;gap:1px}
.docs-nav a{display:block;padding:var(--space-2) var(--space-3);border-radius:var(--radius-md);font-size:var(--text-sm);color:hsl(var(--muted-foreground));text-decoration:none}
.docs-nav a:hover{background:hsl(var(--accent));color:hsl(var(--accent-foreground))}
.docs-nav a[aria-current="page"]{background:hsl(var(--accent));color:hsl(var(--foreground));font-weight:500}
.docs-nav-label{font-size:var(--text-xs);font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:hsl(var(--muted-foreground));padding:var(--space-3) var(--space-3) var(--space-1)}
.docs-main{padding:var(--space-8) var(--space-10);max-width:64rem;min-width:0}
.docs-breadcrumb{font-size:var(--text-sm);color:hsl(var(--muted-foreground));margin-bottom:var(--space-3)}
.docs-breadcrumb a{color:inherit}
.docs-h1{font-size:var(--text-3xl);font-weight:700;letter-spacing:-.025em;margin:0 0 var(--space-2)}
.docs-lead{color:hsl(var(--muted-foreground));font-size:var(--text-lg);margin:0 0 var(--space-4)}
.docs-meta{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-bottom:var(--space-6)}
.docs-section{margin-top:var(--space-8)}
.docs-section h2{font-size:var(--text-xl);font-weight:600;margin:0 0 var(--space-3);padding-bottom:var(--space-2);border-bottom:1px solid hsl(var(--border))}
.docs-preview{padding:var(--space-8);border:1px solid hsl(var(--border));border-radius:var(--radius-lg);display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:center;background:hsl(var(--card))}
pre.docs-code{background:hsl(var(--muted));border:1px solid hsl(var(--border));border-radius:var(--radius-md);padding:var(--space-4);overflow:auto;font-family:var(--font-mono,ui-monospace,monospace);font-size:var(--text-sm);margin:var(--space-2) 0 0}
.docs-classes{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.docs-toolbar{position:absolute;top:var(--space-5);inset-inline-end:var(--space-6)}
@media(max-width:820px){.docs-layout{grid-template-columns:1fr}.docs-sidebar{display:none}.docs-main{padding:var(--space-6)}}
`;

function sidebar(components, current) {
  const links = components
    .map((c) => `<a href="./${c.name}.html"${c.name === current ? ' aria-current="page"' : ""}>${esc(c.name)}</a>`)
    .join("\n");
  return `<aside class="docs-sidebar">
  <div class="docs-brand"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> <a href="../index.html" style="color:inherit;text-decoration:none">shadcss</a></div>
  <div class="docs-nav-label">Getting started</div>
  <nav class="docs-nav"><a href="./index.html"${current === "__index" ? ' aria-current="page"' : ""}>Overview</a><a href="../index.html">Live demo</a></nav>
  <div class="docs-nav-label">Components</div>
  <nav class="docs-nav">${links}</nav>
</aside>`;
}

const themeToggle = `<div class="docs-toolbar"><button class="btn btn-ghost btn-sm" aria-pressed="false" onclick="const d=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=d;this.setAttribute('aria-pressed',d==='dark')">Toggle theme</button></div>`;

function shell(title, body, components, current) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)} — shadcss docs</title>
<link rel="stylesheet" href="../shadcss.min.css">
<style>${DOCS_CSS}</style>
</head>
<body>
<div class="docs-layout">
${sidebar(components, current)}
<main class="docs-main">${themeToggle}
${body}
</main>
</div>
</body>
</html>`;
}

function componentPage(c, components) {
  const meta = [badge("status", c.status || "stable"), badge("js", c.js || "none"), `<span class="badge badge-outline">support: ${esc(c.support || "baseline")}</span>`].join(" ");
  const classes = (c.classes || []).map((cl) => `<span class="badge badge-secondary">.${esc(cl)}</span>`).join(" ");
  const importLine = `@import "${PKG}/${c.file}";`;
  const cli = `npx ${PKG}-cli add ${c.name}`;
  const a11y = c.a11y ? `<div class="docs-section"><h2>Accessibility</h2><div class="alert alert-info" role="alert"><div><div class="alert-description">${esc(c.a11y)}</div></div></div></div>` : "";
  const body = `
<div class="docs-breadcrumb"><a href="./index.html">Components</a> / ${esc(c.name)}</div>
<h1 class="docs-h1">${esc(c.name)}</h1>
<p class="docs-lead">${esc(c.description || "")}</p>
<div class="docs-meta">${meta}</div>

<div class="docs-section"><h2>Preview</h2>${
  c.js === "trigger"
    ? `<div class="docs-preview" style="justify-content:center;color:hsl(var(--muted-foreground));font-size:var(--text-sm)">This overlay stays hidden until triggered — <a href="../index.html" style="color:hsl(var(--primary));font-weight:500">open it in the live demo →</a></div>`
    : `<div class="docs-preview">${c.markup || ""}</div>`
}</div>

<div class="docs-section"><h2>Markup</h2><pre class="docs-code"><code>${esc(c.markup || "")}</code></pre></div>

<div class="docs-section"><h2>Install</h2>
<p style="color:hsl(var(--muted-foreground));font-size:var(--text-sm);margin:.25rem 0">Import the component CSS (depends on <code>base/tokens.css</code>):</p>
<pre class="docs-code"><code>${esc(importLine)}</code></pre>
<p style="color:hsl(var(--muted-foreground));font-size:var(--text-sm);margin:.75rem 0 .25rem">…or copy it into your repo with the CLI:</p>
<pre class="docs-code"><code>${esc(cli)}</code></pre>
</div>

${a11y}

<div class="docs-section"><h2>Classes</h2><div class="docs-classes">${classes}</div></div>

<div class="docs-section"><h2>Dependencies</h2><div class="docs-classes">${(c.deps || []).map((d) => `<span class="badge badge-outline">${esc(d)}</span>`).join(" ") || '<span class="badge badge-outline">none</span>'}</div></div>
`;
  return shell(c.name, body, components, c.name);
}

function indexPage(reg) {
  const cards = reg.components.map((c) => `
  <a class="card card-interactive" href="./${c.name}.html" style="text-decoration:none;color:inherit;padding:var(--space-4);min-width:0">
    <div class="card-title" style="font-size:var(--text-base)">${esc(c.name)}</div>
    <div class="card-description">${esc(c.description || "")}</div>
    <div style="margin-top:var(--space-2);display:flex;gap:.375rem;flex-wrap:wrap">${badge("js", c.js || "none")}</div>
  </a>`).join("\n");
  const body = `
<div class="docs-breadcrumb">Documentation</div>
<h1 class="docs-h1">Components</h1>
<p class="docs-lead">${reg.components.length} zero-runtime HTML + CSS components. ${esc(reg.description || "")}</p>
<div class="docs-meta"><span class="badge badge-success">${reg.components.filter((c) => (c.js || "none") === "none").length} zero-JS</span> <span class="badge badge-info">${reg.components.filter((c) => c.js === "trigger").length} one-line trigger</span> <span class="badge badge-warning">${reg.components.filter((c) => c.js === "consumer").length} consumer-JS</span></div>
<div class="docs-section" style="margin-top:var(--space-4)"><div class="demo-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(16rem,100%),1fr));gap:var(--space-4)">${cards}</div></div>
`;
  return shell("Components", body, reg.components, "__index");
}

export function genDocs(repoRoot) {
  const reg = JSON.parse(readFileSync(path.join(repoRoot, "packages/shadcss/registry.json"), "utf8"));
  const out = path.join(repoRoot, "apps/www/docs");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  writeFileSync(path.join(out, "index.html"), indexPage(reg));
  for (const c of reg.components) writeFileSync(path.join(out, `${c.name}.html`), componentPage(c, reg.components));
  return reg.components.length;
}

// run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const n = genDocs(root);
  console.log(`generated docs for ${n} components → apps/www/docs/`);
}
