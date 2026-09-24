// Copies the pdf.js browser build into public/vendor so the app does not
// depend on a third-party CDN at runtime.
import { copyFileSync, mkdirSync } from "node:fs";

const files = ["pdf.min.mjs", "pdf.worker.min.mjs"];
mkdirSync("public/vendor", { recursive: true });
for (const file of files) {
  copyFileSync(`node_modules/pdfjs-dist/build/${file}`, `public/vendor/${file}`);
}
console.log(`Copied ${files.join(", ")} to public/vendor`);
