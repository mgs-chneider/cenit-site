import Anthropic from "@anthropic-ai/sdk";
import { pinIsValid, takeDailyQuota } from "../lib/guard.js";
import { analysisSchema } from "../lib/schema.js";
import { buildSystemPrompt, buildUserText, DEFAULT_COMPANY_PROFILE } from "../lib/prompt.js";

const client = new Anthropic();

// Keep in sync with MAX_TEXT_CHARS in public/app.js.
const MAX_TEXT_CHARS = 600_000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { pin, filename, pdfBase64, extractedText, outputLanguage } = req.body ?? {};
  if (!pinIsValid(pin)) return res.status(401).json({ error: "PIN ungültig" });

  const hasPdf = typeof pdfBase64 === "string" && pdfBase64.length > 0;
  const hasText = typeof extractedText === "string" && extractedText.trim().length > 0;
  if (hasPdf === hasText) {
    return res.status(400).json({ error: "Bitte genau ein Dokument senden (PDF oder extrahierten Text)." });
  }
  if (hasText && extractedText.length > MAX_TEXT_CHARS) {
    return res.status(413).json({ error: "Das Dokument ist für die Demo zu lang." });
  }

  try {
    const quota = await takeDailyQuota();
    if (!quota.allowed) {
      return res.status(429).json({ error: `Tageslimit von ${quota.limit} Analysen erreicht. Bitte morgen erneut versuchen.` });
    }
  } catch (err) {
    console.error("Quota check failed", err);
    return res.status(503).json({ error: "Nutzungslimit konnte nicht geprüft werden. Bitte später erneut versuchen." });
  }

  const language = outputLanguage === "en" ? "en" : "de";
  const userContent = [];
  if (hasPdf) {
    userContent.push({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
    });
  }
  userContent.push({
    type: "text",
    text: buildUserText({ filename, extractedText: hasText ? extractedText : null }),
  });

  let message;
  try {
    const stream = client.beta.messages.stream({
      model: "claude-opus-5",
      max_tokens: 32000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: process.env.ANALYSIS_EFFORT ?? "medium",
        format: { type: "json_schema", schema: analysisSchema },
      },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: buildSystemPrompt({
        outputLanguage: language,
        companyProfile: process.env.COMPANY_PROFILE || DEFAULT_COMPANY_PROFILE,
      }),
      messages: [{ role: "user", content: userContent }],
    });
    message = await stream.finalMessage();
  } catch (err) {
    return res.status(apiErrorStatus(err)).json({ error: apiErrorMessage(err) });
  }

  if (message.stop_reason === "refusal") {
    return res.status(422).json({ error: "Das Dokument konnte nicht analysiert werden." });
  }
  if (message.stop_reason === "max_tokens") {
    return res.status(502).json({ error: "Die Analyse wurde abgeschnitten. Bitte ein kürzeres Dokument verwenden." });
  }

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
  try {
    const analysis = JSON.parse(text);
    return res.status(200).json({ analysis, model: message.model, usage: message.usage });
  } catch {
    console.error("Unparseable analysis", text.slice(0, 500));
    return res.status(502).json({ error: "Die Antwort des Modells war unvollständig. Bitte erneut versuchen." });
  }
}

function apiErrorStatus(err) {
  if (err instanceof Anthropic.RateLimitError) return 429;
  if (err instanceof Anthropic.BadRequestError) return 400;
  return 502;
}

function apiErrorMessage(err) {
  if (err instanceof Anthropic.RateLimitError) {
    return "Der KI-Dienst ist gerade ausgelastet. Bitte in einer Minute erneut versuchen.";
  }
  if (err instanceof Anthropic.BadRequestError) {
    console.error("Bad request to Claude API", err.message);
    return "Das Dokument konnte nicht verarbeitet werden (z. B. beschädigte oder passwortgeschützte PDF).";
  }
  if (err instanceof Anthropic.AuthenticationError) {
    console.error("Claude API authentication failed");
    return "Der KI-Dienst ist nicht korrekt konfiguriert.";
  }
  console.error("Claude API error", err);
  return "Der KI-Dienst ist nicht erreichbar. Bitte später erneut versuchen.";
}
