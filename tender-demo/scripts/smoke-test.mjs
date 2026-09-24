// End-to-end smoke test without a real API key: a mock Claude API streams a
// canned analysis, and the dev server exercises the real API handlers.

import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const sample = await readFile("scripts/fixtures/sample-analysis.json", "utf8");
const seen = [];

function sse(res, events) {
  res.writeHead(200, { "Content-Type": "text/event-stream" });
  for (const event of events) res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
  res.end();
}

const mock = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  seen.push({ headers: req.headers, body });
  const refuse = JSON.stringify(body.messages).includes("REFUSE-ME");
  sse(res, [
    { type: "message_start", message: { id: "msg_test", type: "message", role: "assistant", model: "claude-opus-5", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1200, output_tokens: 1 } } },
    { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } },
    ...(refuse ? [] : [
      { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: sample.slice(0, 500) } },
      { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: sample.slice(500) } },
    ]),
    { type: "content_block_stop", index: 0 },
    { type: "message_delta", delta: { stop_reason: refuse ? "refusal" : "end_turn", stop_sequence: null }, usage: { output_tokens: 900 } },
    { type: "message_stop" },
  ]);
});
await new Promise((resolve) => mock.listen(4011, resolve));

process.env.ANTHROPIC_BASE_URL = "http://127.0.0.1:4011";
process.env.ANTHROPIC_API_KEY = "test-key";
process.env.DEMO_PIN = "4711";
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

const { startServer } = await import("./dev-server.mjs");
const server = await startServer(4012);
const post = (path, body) =>
  fetch(`http://127.0.0.1:4012${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

try {
  assert.equal((await post("/api/pin", { pin: "0000" })).status, 401, "wrong PIN is rejected");
  assert.equal((await post("/api/pin", { pin: "4711" })).status, 200, "correct PIN is accepted");
  assert.equal((await post("/api/analyze", { pin: "0000", pdfBase64: "JVBERi0=" })).status, 401, "analyze requires PIN");
  assert.equal((await post("/api/analyze", { pin: "4711" })).status, 400, "analyze requires a document");

  const ok = await post("/api/analyze", { pin: "4711", filename: "tdr.pdf", pdfBase64: "JVBERi0xLjQK", outputLanguage: "de" });
  assert.equal(ok.status, 200, "analysis succeeds");
  const data = await ok.json();
  assert.equal(data.analysis.assessment.recommendation, "conditional");

  const request = seen.at(-1);
  assert.equal(request.body.model, "claude-opus-5");
  assert.equal(request.body.fallbacks, "default");
  assert.match(request.headers["anthropic-beta"], /server-side-fallback-2026-07-01/);
  assert.equal(request.body.output_config.format.type, "json_schema");
  assert.equal(request.body.messages[0].content[0].type, "document");
  assert.match(request.body.system, /German/);

  const text = await post("/api/analyze", { pin: "4711", extractedText: "[Page 1]\nTermes de référence …", outputLanguage: "en" });
  assert.equal(text.status, 200, "text path succeeds");
  assert.equal(seen.at(-1).body.messages[0].content[0].type, "text");
  assert.match(seen.at(-1).body.system, /English/);

  const refused = await post("/api/analyze", { pin: "4711", extractedText: "REFUSE-ME" });
  assert.equal(refused.status, 422, "refusal is surfaced as 422");

  console.log("Smoke test passed");
} finally {
  server.close();
  mock.close();
}
