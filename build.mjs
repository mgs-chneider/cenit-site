import { promises as fs } from "fs";
import path from "path";

const SRC_PAGES = "src/pages";
const PARTIALS = "src/partials";
const OUT_DIR = "dist";

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function copyDir(src, dest) {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

async function walkHtmlFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walkHtmlFiles(p)));
    else if (e.isFile() && e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

async function main() {
  // clean dist
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await ensureDir(OUT_DIR);

  const header = await fs.readFile(path.join(PARTIALS, "header.html"), "utf8");
  const footer = await fs.readFile(path.join(PARTIALS, "footer.html"), "utf8");

  const pages = await walkHtmlFiles(SRC_PAGES);

  for (const file of pages) {
    const rel = path.relative(SRC_PAGES, file); // e.g. index.html or zahlen-fakten/index.html
    const outPath = path.join(OUT_DIR, rel);

    const html = await fs.readFile(file, "utf8");
    const merged = html
      .replace("<!-- @@HEADER@@ -->", header)
      .replace("<!-- @@FOOTER@@ -->", footer);

    await ensureDir(path.dirname(outPath));
    await fs.writeFile(outPath, merged, "utf8");
  }

  // copy assets to dist/assets
  await copyDir("src/assets", path.join(OUT_DIR, "assets"));

  console.log("Build complete → dist/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
