import { promises as fs } from "fs";
import path from "path";

const SRC_PAGES = "src/pages";
const PARTIALS = "src/partials";
const OUT_DIR = "dist";
const SRC_ASSETS = "src/assets";
const PUBLIC_DIR = "public";

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src, dest) {
  if (!(await pathExists(src))) return;

  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);

    if (e.isDirectory()) {
      await copyDir(s, d);
    } else {
      await fs.copyFile(s, d);
    }
  }
}

async function walkHtmlFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const e of entries) {
    const p = path.join(dir, e.name);

    if (e.isDirectory()) {
      out.push(...(await walkHtmlFiles(p)));
    } else if (e.isFile() && e.name.endsWith(".html")) {
      out.push(p);
    }
  }

  return out;
}

async function main() {
  // Clean dist
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await ensureDir(OUT_DIR);

  // Load partials
  const header = await fs.readFile(
    path.join(PARTIALS, "header.html"),
    "utf8"
  );
  const footer = await fs.readFile(
    path.join(PARTIALS, "footer.html"),
    "utf8"
  );

  // Process HTML pages
  const pages = await walkHtmlFiles(SRC_PAGES);

  for (const file of pages) {
    const rel = path.relative(SRC_PAGES, file);
    const outPath = path.join(OUT_DIR, rel);

    const html = await fs.readFile(file, "utf8");

    const merged = html
      .replace(/<!--\s*@@HEADER@@\s*-->/g, header)
      .replace(/<!--\s*@@FOOTER@@\s*-->/g, footer);

    await ensureDir(path.dirname(outPath));
    await fs.writeFile(outPath, merged, "utf8");
  }

  // Copy src/assets → dist/assets
  await copyDir(SRC_ASSETS, path.join(OUT_DIR, "assets"));

  // Copy public/* → dist/*
  await copyDir(PUBLIC_DIR, OUT_DIR);

  console.log("Build complete → dist/");
}

main().catch((e) => {
  console.error("Build failed:", e);
  process.exit(1);
});
