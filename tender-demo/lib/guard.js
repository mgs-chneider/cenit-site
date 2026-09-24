// Access control for the demo: a shared PIN plus an optional daily request
// limit backed by Upstash Redis (REST API), so a leaked URL cannot run up
// API costs.

import { timingSafeEqual } from "node:crypto";

export function pinIsValid(pin) {
  const expected = process.env.DEMO_PIN;
  if (!expected || typeof pin !== "string") return false;
  const a = Buffer.from(pin);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Returns { allowed, used, limit }. Without Upstash configured the limit is
// not enforced (local development).
export async function takeDailyQuota() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const limit = Number(process.env.DAILY_LIMIT ?? 25);
  if (!url || !token) return { allowed: true, used: 0, limit };

  const key = `tender-demo:analyses:${new Date().toISOString().slice(0, 10)}`;
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, 60 * 60 * 48],
    ]),
  });
  if (!res.ok) throw new Error(`Upstash request failed with status ${res.status}`);
  const [incr] = await res.json();
  const used = Number(incr.result);
  return { allowed: used <= limit, used, limit };
}
