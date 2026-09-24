// Minimal local stand-in for Vercel: serves public/ and routes /api/<name>
// to api/<name>.js with the req.body / res.status().json() helpers Vercel
// provides. Usage: DEMO_PIN=1234 ANTHROPIC_API_KEY=... node scripts/dev-server.mjs

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const PORT = Number(process.env.PORT ?? 3000);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json",
};

function withVercelHelpers(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(data));
    return res;
  };
  return res;
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : undefined;
}

export function startServer(port = PORT) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    try {
      if (url.pathname.startsWith("/api/")) {
        const name = url.pathname.slice(5).replace(/[^a-z-]/g, "");
        const { default: handler } = await import(`../api/${name}.js`);
        req.body = await readJsonBody(req);
        return await handler(req, withVercelHelpers(res));
      }
      const path = normalize(url.pathname === "/" ? "/index.html" : url.pathname);
      const body = await readFile(join("public", path));
      res.writeHead(200, { "Content-Type": TYPES[extname(path)] ?? "application/octet-stream" });
      res.end(body);
    } catch (err) {
      if (err.code === "ENOENT" || err.code === "ERR_MODULE_NOT_FOUND") {
        res.writeHead(404).end("Not found");
      } else {
        console.error(err);
        res.writeHead(500).end("Server error");
      }
    }
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await startServer();
  console.log(`TenderBrief dev server on http://localhost:${PORT}`);
}
