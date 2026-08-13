// Edge-compatible auth primitives (Web Crypto only — no Node-only libs).
// Works identically in Cloudflare Workers and Node 18+ (seed scripts).

const PBKDF2_ITERATIONS = 100_000;
const COOKIE_NAME = "onapookkal_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s);
  const buf = new ArrayBuffer(bin.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function b64url(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToB64(s: string): string {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return s;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ---- Password hashing (PBKDF2-SHA256) ----

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(new Uint8Array(bits))}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = parseInt(parts[1], 10);
  const salt = fromBase64(parts[2]);
  const expected = fromBase64(parts[3]);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return timingSafeEqual(new Uint8Array(bits), expected);
}

// ---- Signed session tokens (HMAC-SHA256) ----

import { getCloudflareContext } from "@opennextjs/cloudflare";

function getSecret(): string {
  // Production Workers: AUTH_SECRET is a Worker secret (env binding), NOT process.env.
  try {
    const ctx = getCloudflareContext();
    const s = (ctx?.env as { AUTH_SECRET?: string } | undefined)?.AUTH_SECRET;
    if (s) return s;
  } catch {
    // no Cloudflare context (standalone script) — fall through
  }
  return (
    process.env.AUTH_SECRET ??
    "onapookkal-dev-secret-change-me-9f3a2b1c4d5e6f708192a3b4c5d6e7f8"
  );
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64(new Uint8Array(sig));
}

export type SessionPayload = {
  sub: string; // admin id
  username: string;
  exp: number; // unix seconds
};

export async function createSessionToken(
  payload: Omit<SessionPayload, "exp">,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): Promise<string> {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = b64url(JSON.stringify(full));
  const sig = b64url(await hmacSign(body, getSecret()));
  return `${body}.${sig}`;
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = b64url(await hmacSign(body, getSecret()));
  if (sig !== expected) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(atob(b64urlToB64(body)));
  } catch {
    return null;
  }
  if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) {
    return null;
  }
  return payload;
}

export { COOKIE_NAME };
