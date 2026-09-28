import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  EMPTY_BODY_SHA256,
  MemoryNonceStore,
  authenticateBusinessOs,
  bodySha256,
  canonicalString,
  parseExportKeys,
  signHmac,
  type BosKey,
} from "./hmac";

const VECTORS = JSON.parse(
  readFileSync(
    "/Volumes/RomanSSD/Developer/simnetiq.store/contracts/business-os/v1/hmac/vectors.json",
    "utf8",
  ),
) as {
  vectors: Array<{
    id: string;
    method: string;
    canonical_utf8: string;
    body_utf8: string;
    body_sha256: string;
    secret_utf8: string;
    signature_hex: string;
    request_target: string;
    timestamp: string;
    nonce: string;
    key_id: string;
    project_id: string;
    environment: string;
  }>;
};

const SECRET = "test-secret-do-not-use-in-production";
const ACTIVE: BosKey = {
  keyId: "bos_test_doppler_production_v1",
  secret: SECRET,
  projectId: "doppler",
  environment: "production",
  status: "active",
};

function signedHeaders(input: {
  key?: BosKey;
  target?: string;
  timestamp?: string;
  nonce?: string;
  body?: string;
  signature?: string;
}): Headers {
  const key = input.key ?? ACTIVE;
  const target = input.target ?? "/api/business-os/v1/health";
  const timestamp = input.timestamp ?? "1759017600";
  const nonce = input.nonce ?? "nonce-health-0001";
  const body = input.body ?? "";
  const canonical = canonicalString({
    method: "GET",
    requestTarget: target,
    timestamp,
    nonce,
    bodySha256: bodySha256(body),
  });
  const headers = new Headers();
  headers.set("X-BOS-Key-Id", key.keyId);
  headers.set("X-BOS-Timestamp", timestamp);
  headers.set("X-BOS-Nonce", nonce);
  headers.set("X-BOS-Signature", input.signature ?? signHmac(key.secret, canonical));
  return headers;
}

async function auth(input: {
  headers: Headers;
  nowMs: number;
  store?: MemoryNonceStore;
  keys?: BosKey[];
  tls?: boolean;
  testTransport?: boolean;
  target?: string;
  body?: string;
  deploymentEnvironment?: "production" | "staging" | "test";
  deploymentProjectId?: string;
}) {
  return authenticateBusinessOs({
    method: "GET",
    requestTarget: input.target ?? "/api/business-os/v1/health",
    body: new TextEncoder().encode(input.body ?? ""),
    headers: input.headers,
    keys: input.keys ?? [ACTIVE],
    nonceStore: input.store ?? new MemoryNonceStore(),
    nowMs: input.nowMs,
    deploymentProjectId: input.deploymentProjectId ?? "doppler",
    deploymentEnvironment: input.deploymentEnvironment ?? "production",
    tls: input.tls ?? true,
    testTransport: input.testTransport ?? false,
    rateLimit: 60,
  });
}

describe("HMAC vectors", () => {
  it("matches the four frozen signatures and the empty-body digest", () => {
    expect(bodySha256("")).toBe(EMPTY_BODY_SHA256);
    expect(EMPTY_BODY_SHA256).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(VECTORS.vectors).toHaveLength(4);
    for (const vector of VECTORS.vectors) {
      const canonical = canonicalString({
        method: vector.method,
        requestTarget: vector.request_target,
        timestamp: vector.timestamp,
        nonce: vector.nonce,
        bodySha256: bodySha256(vector.body_utf8),
      });
      expect(canonical).toBe(vector.canonical_utf8);
      expect(bodySha256(vector.body_utf8)).toBe(vector.body_sha256);
      expect(signHmac(vector.secret_utf8, canonical)).toBe(vector.signature_hex);
    }
  });
});

describe("authenticateBusinessOs", () => {
  const nowMs = 1759017600 * 1000;

  it("accepts a fresh lowercase signature on the test transport", async () => {
    const result = await auth({
      headers: signedHeaders({}),
      nowMs,
      testTransport: true,
      tls: false,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects uppercase hex as bad_signature_encoding", async () => {
    const headers = signedHeaders({});
    headers.set("X-BOS-Signature", headers.get("X-BOS-Signature")!.toUpperCase());
    const result = await auth({ headers, nowMs, testTransport: true });
    expect(result).toMatchObject({ ok: false, status: 403, code: "bad_signature_encoding" });
  });

  it("rejects a timestamp 301 seconds away", async () => {
    const result = await auth({
      headers: signedHeaders({ timestamp: String(1759017600 - 301) }),
      nowMs,
      testTransport: true,
    });
    expect(result).toMatchObject({ ok: false, status: 403, code: "timestamp_out_of_range" });
  });

  it("rejects an unknown key without storing the nonce", async () => {
    const store = new MemoryNonceStore();
    const headers = signedHeaders({ key: { ...ACTIVE, keyId: "missing-key" } });
    const result = await auth({ headers, nowMs, store, testTransport: true });
    expect(result).toMatchObject({ ok: false, status: 403, code: "authentication_failed" });
    const again = await auth({ headers, nowMs, store, testTransport: true });
    expect(again).toMatchObject({ code: "authentication_failed" });
  });

  it("rejects a revoked key", async () => {
    const revoked = { ...ACTIVE, status: "revoked" as const };
    const result = await auth({
      headers: signedHeaders({ key: revoked }),
      nowMs,
      keys: [revoked],
      testTransport: true,
    });
    expect(result).toMatchObject({ ok: false, status: 403, code: "key_revoked" });
  });

  it("rejects a valid signature bound to another project or environment", async () => {
    const otherProject = await auth({
      headers: signedHeaders({}),
      nowMs,
      deploymentProjectId: "smscode",
      testTransport: true,
    });
    expect(otherProject).toMatchObject({ ok: false, code: "project_mismatch" });
    const otherEnv = await auth({
      headers: signedHeaders({}),
      nowMs,
      deploymentEnvironment: "staging",
      testTransport: true,
    });
    expect(otherEnv).toMatchObject({ ok: false, code: "environment_mismatch" });
  });

  it("stores a nonce before returning a bad signature, then rejects the replay", async () => {
    const store = new MemoryNonceStore();
    const headers = signedHeaders({ signature: "a".repeat(64) });
    const first = await auth({ headers, nowMs, store, testTransport: true });
    expect(first).toMatchObject({ ok: false, code: "invalid_signature" });
    const second = await auth({ headers, nowMs, store, testTransport: true });
    expect(second).toMatchObject({ ok: false, code: "nonce_replayed" });
  });

  it("lets one of two concurrent claims win", async () => {
    const store = new MemoryNonceStore();
    const [left, right] = await Promise.all([
      store.claim({
        keyId: ACTIVE.keyId,
        nonce: "nonce-concurrent-01",
        expiresAtMs: nowMs + 600_000,
        nowMs,
        rateLimit: 60,
        windowMs: 60_000,
      }),
      store.claim({
        keyId: ACTIVE.keyId,
        nonce: "nonce-concurrent-01",
        expiresAtMs: nowMs + 600_000,
        nowMs,
        rateLimit: 60,
        windowMs: 60_000,
      }),
    ]);
    expect([left, right].sort()).toEqual(["claimed", "replayed"]);
  });

  it("fails closed when a production key arrives without TLS", async () => {
    const result = await auth({
      headers: signedHeaders({}),
      nowMs,
      tls: false,
      testTransport: false,
    });
    expect(result).toMatchObject({ ok: false, status: 403, code: "authentication_failed" });
  });

  it("parses export keys and never includes the secret in a thrown message", () => {
    expect(() => parseExportKeys("{")).toThrow(/BOS_EXPORT_KEYS/);
    try {
      parseExportKeys("{");
    } catch (error) {
      expect(String(error)).not.toContain(SECRET);
    }
    const keys = parseExportKeys(JSON.stringify([ACTIVE]));
    expect(keys[0]?.status).toBe("active");
  });
});

describe("checkout isolation", () => {
  it("does not import the export authenticator from payment webhooks", () => {
    const root = "/Volumes/RomanSSD/Developer/doppler/doppler-web";
    const files = [
      `${root}/src/app/api/revolut/webhook/route.ts`,
      `${root}/src/app/api/oxapay/webhook/route.ts`,
      `${root}/src/app/api/checkout/init/route.ts`,
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("reporting/bos");
      expect(source).not.toContain("BOS_EXPORT_KEYS");
    }
  });
});
