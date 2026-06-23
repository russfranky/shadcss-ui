// ==========================================================================
// scripts/deploy.mjs — deploy the showcase to Vercel production.
//
//   VERCEL_TOKEN=xxx npm run deploy
//
// Builds the framework (which copies the CSS into apps/www), stages a
// self-contained deploy directory (CSS + index.html with the two ../../ doc
// links repointed to GitHub so nothing 404s on a flat host), and ships it.
// The token is read from the environment so it is never committed.
// ==========================================================================

import { execSync } from "node:child_process";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TOKEN = process.env.VERCEL_TOKEN;
const SCOPE = process.env.VERCEL_SCOPE || "team_fxAj717BuD1hQ9q3PeCu02hC"; // russfranky team
const PROJECT_ID = process.env.VERCEL_PROJECT_ID || "prj_4AlPHZyl2gA3n9E7Meing6GBAbvC"; // shadcss project
if (!TOKEN) {
  console.error(
    "error: VERCEL_TOKEN is required.\n" +
    "  Create a token at https://vercel.com/account/tokens, then:\n" +
    "  VERCEL_TOKEN=xxx npm run deploy\n" +
    "  (override the team with VERCEL_SCOPE=<team-id> if needed)"
  );
  process.exit(1);
}

// 1. Build — copies dist/shadcss.min.css into apps/www
console.log("→ Building framework…");
execSync("npm run build --workspace=packages/shadcss", { cwd: root, stdio: "inherit" });

const wwwIndex = path.join(root, "apps/www/index.html");
const wwwCss = path.join(root, "apps/www/shadcss.min.css");
if (!existsSync(wwwCss)) {
  console.error("error: apps/www/shadcss.min.css missing after build.");
  process.exit(1);
}

// 2. Stage a self-contained deploy dir
const stage = mkdtempSync(path.join(os.tmpdir(), "shadcss-deploy-"));
const gh = "https://github.com/russfranky/shadcss-ui/blob/main/packages/shadcss";
const html = readFileSync(wwwIndex, "utf8")
  .replaceAll('href="../../packages/shadcss/AI_GUIDE.md"', `href="${gh}/AI_GUIDE.md"`)
  .replaceAll('href="../../packages/shadcss/registry.json"', `href="${gh}/registry.json"`);
writeFileSync(path.join(stage, "index.html"), html);
copyFileSync(wwwCss, path.join(stage, "shadcss.min.css"));
try { copyFileSync(path.join(root, "apps/www/llms.txt"), path.join(stage, "llms.txt")); } catch {}
// Link the staging dir to the existing project so the random temp-dir name
// isn't used to create a new one.
mkdirSync(path.join(stage, ".vercel"), { recursive: true });
writeFileSync(
  path.join(stage, ".vercel", "project.json"),
  JSON.stringify({ projectId: PROJECT_ID, orgId: SCOPE })
);
console.log(`→ Staged self-contained build at ${stage}`);

// 3. Deploy to production
console.log("→ Deploying to Vercel (production)…");
execSync(
  `npx --yes vercel@latest deploy --prod --yes --scope ${SCOPE} --token ${TOKEN}`,
  { cwd: stage, stdio: "inherit" }
);
console.log("\n→ Done. Live at https://shadcss.vercel.app");
