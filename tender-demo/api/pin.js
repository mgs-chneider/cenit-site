import { pinIsValid } from "../lib/guard.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!pinIsValid(req.body?.pin)) {
    return res.status(401).json({ error: "PIN ungültig" });
  }
  return res.status(200).json({ ok: true });
}
