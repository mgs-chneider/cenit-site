import fs from "node:fs";
import path from "node:path";
import posthtml from "posthtml";
import include from "posthtml-include";

const SRC = path.resolve("src");
const PAGES = path.join(SRC, "pages");
const DIST = path.resolve("dist");

function rmDirSafe(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function listHtmlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listHtmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

async function build() {
  rmDirSafe(DIST);
  ensureDir(DIST);

  // Assets 1:1 kopieren
  const assetsSrc = path.join(SRC, "assets");
  const assetsDist = path.join(DIST, "assets");
  if (fs.existsSync(assetsSrc)) copyDir(assetsSrc, assetsDist);

  // HTML Pages verarbeiten (includes auflösen) und nach dist spiegeln
  const htmlFiles = listHtmlFiles(PAGES);

  for (const file of htmlFiles) {
    const rel = path.relative(PAGES, file);
    const outPath = path.join(DIST, rel);
    ensureDir(path.dirname(outPath));

    const html = fs.readFileSync(file, "utf8");
    const result = await posthtml([
      include({
        // include-Pfade relativ zu src/pages
        root: PAGES
      })
    ]).process(html);

    fs.writeFileSync(outPath, result.html, "utf8");
  }

  console.log(`Build done. Pages: ${htmlFiles.length}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});

