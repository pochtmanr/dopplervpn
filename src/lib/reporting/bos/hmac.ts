import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { parseExportKeys, type BosEnvironment, type BosKey } from "./keys";
import { MemoryNonceStore, type NonceStore } from "./nonce-store";

export const EMPTY_BODY_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
export const FRESHNESS_SECONDS = 300;
export const NONCE_TTL_SECONDS = 600;

const NONCE_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;
const TIMESTAMP_PATTERN = /^[0-9]{10}$/;
const SIGNATURE_PATTERN = /^[0-9a-f]{64}$/;

export { MemoryNonceStore, parseExportKeys };
export type { BosKey, NonceStore };

export function bodySha256(body: string | Uint8Array): string {
  const bytes = typeof body === "string" ? Buffer.from(body, "utf8") : Buffer.from(body);
  return createHash("sha256").update(bytes).digest("hex");
}

export function canonicalString(input: {
  method: string;
  requestTarget: string;
  timestamp: string;
  nonce: string;
  bodySha256: string;
}): string {
  return [
    input.method.toUpperCase(),
    input.requestTarget,
    input.timestamp,
    input.nonce,
    input.bodySha256,
  ].join("\n");
}

export function signHmac(secret: string, canonical: string): string {
  return createHmac("sha256", Buffer.from(secret, "utf8")).update(canonical, "utf8").digest("hex");
}

export interface AuthSuccess {
  ok: true;
  key: BosKey;
}

export interface AuthFailure {
  ok: false;
  status: 400 | 403 | 429;
  code: string;
  message: string;
  retryable: boolean;
  retryAfter?: number;
}

export async function authenticateBusinessOs(input: {
  method: string;
  requestTarget: string;
  body: Uint8Array;
  headers: Headers;
  keys: BosKey[];
  nonceStore: NonceStore;
  nowMs: number;
  deploymentProjectId: string;
  deploymentEnvironment: BosEnvironment;
  tls: boolean;
  testTransport: boolean;
  rateLimit: number;
}): Promise<AuthSuccess | AuthFailure> {
  const keyId = header(input.headers, "x-bos-key-id");
  const timestamp = header(input.headers, "x-bos-timestamp");
  const nonce = header(input.headers, "x-bos-nonce");
  const signature = header(input.headers, "x-bos-signature");
  if (!keyId || !timestamp || !nonce || !signature) {
    return fail(403, "missing_auth_headers", "Authentication headers are required.", false);
  }
  if (!TIMESTAMP_PATTERN.test(timestamp)) {
    return fail(403, "timestamp_out_of_range", "Timestamp is outside the allowed window.", false);
  }
  if (!NONCE_PATTERN.test(nonce)) {
    return fail(403, "authentication_failed", "Authentication failed.", false);
  }
  if (!SIGNATURE_PATTERN.test(signature)) {
    return fail(403, "bad_signature_encoding", "Signature must be lowercase hex.", false);
  }

  const key = input.keys.find((item) => item.keyId === keyId);
  if (!key) return fail(403, "authentication_failed", "Authentication failed.", false);
  if (key.status !== "active") return fail(403, "key_revoked", "The signing key is revoked.", false);

  const skew = Math.abs(Math.floor(input.nowMs / 1000) - Number(timestamp));
  if (skew > FRESHNESS_SECONDS) {
    return fail(403, "timestamp_out_of_range", "Timestamp is outside the allowed window.", false);
  }

  if (!input.testTransport && input.deploymentEnvironment === "production" && !input.tls) {
    return fail(403, "authentication_failed", "Authentication failed.", false);
  }

  const claim = await input.nonceStore.claim({
    keyId,
    nonce,
    expiresAtMs: input.nowMs + NONCE_TTL_SECONDS * 1000,
    nowMs: input.nowMs,
    rateLimit: input.rateLimit,
    windowMs: 60_000,
  });
  if (claim === "replayed") return fail(403, "nonce_replayed", "This nonce was already used.", false);
  if (claim === "rate_limited") {
    return fail(429, "rate_limited", "Too many requests for this key.", true, 60);
  }

  const canonical = canonicalString({
    method: input.method,
    requestTarget: input.requestTarget,
    timestamp,
    nonce,
    bodySha256: bodySha256(input.body),
  });
  const expected = signHmac(key.secret, canonical);
  const actualBytes = Buffer.from(signature, "hex");
  const expectedBytes = Buffer.from(expected, "hex");
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) {
    return fail(403, "invalid_signature", "Authentication failed.", false);
  }
  if (key.projectId !== input.deploymentProjectId) {
    return fail(403, "project_mismatch", "The key is bound to another project.", false);
  }
  if (key.environment !== input.deploymentEnvironment) {
    return fail(403, "environment_mismatch", "The key is bound to another environment.", false);
  }
  return { ok: true, key };
}

function header(headers: Headers, name: string): string {
  return headers.get(name)?.trim() ?? "";
}

function fail(
  status: AuthFailure["status"],
  code: string,
  message: string,
  retryable: boolean,
  retryAfter?: number,
): AuthFailure {
  return { ok: false, status, code, message, retryable, retryAfter };
}
