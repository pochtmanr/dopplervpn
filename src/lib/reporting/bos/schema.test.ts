import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import { observationFromRevolut } from "../map-evidence";
import { MemoryReportingStore } from "../memory-store";
import { BUSINESS_OS_ROUTES, handleBusinessOs, type BosDeps } from "./handler";
import { MemoryNonceStore, bodySha256, canonicalString, signHmac, type BosKey } from "./hmac";

const CONTRACT = "/Volumes/RomanSSD/Developer/simnetiq.store/contracts/business-os/v1/schemas";
const KEY: BosKey = {
  keyId: "bos_test_doppler_production_v1",
  secret: "test-secret-do-not-use-in-production",
  projectId: "doppler",
  environment: "production",
  status: "active",
};
const NOW = new Date("2026-09-28T12:00:00Z");
const FROM = "2026-09-26T23:00:00Z";
const TO = "2026-09-27T23:00:00Z";

function validator() {
  const ajv = new Ajv({
    allErrors: true,
    strict: true,
    strictRequired: false,
    strictTypes: false,
    allowUnionTypes: true,
  });
  addFormats(ajv);
  for (const name of readdirSync(CONTRACT).filter((file) => file.endsWith(".json"))) {
    ajv.addSchema(JSON.parse(readFileSync(join(CONTRACT, name), "utf8")));
  }
  return ajv;
}

function signed(path: string, nonce: string): Request {
  const timestamp = String(Math.floor(NOW.getTime() / 1000));
  const canonical = canonicalString({
    method: "GET",
    requestTarget: path,
    timestamp,
    nonce,
    bodySha256: bodySha256(""),
  });
  return new Request(`https://export.test${path}`, {
    headers: {
      "X-BOS-Key-Id": KEY.keyId,
      "X-BOS-Timestamp": timestamp,
      "X-BOS-Nonce": nonce,
      "X-BOS-Signature": signHmac(KEY.secret, canonical),
    },
  });
}

function harness(): BosDeps {
  const store = new MemoryReportingStore();
  store.clock = () => NOW;
  return {
    store,
    nonceStore: new MemoryNonceStore(),
    keys: [KEY],
    now: () => NOW,
    environment: "production",
    projectId: "doppler",
    testTransport: true,
    rateLimit: 60,
    cache: new Map(),
  };
}

const CASES: Array<[string, string, string]> = [
  ["/api/business-os/v1/capabilities", "capabilities", "nonce-schema-cap01"],
  [`/api/business-os/v1/overview?from=${FROM}&to=${TO}`, "overview", "nonce-schema-over1"],
  [`/api/business-os/v1/finance/summary?from=${FROM}&to=${TO}`, "financeSummary", "nonce-schema-sum01"],
  [`/api/business-os/v1/finance/daily?from=${FROM}&to=${TO}`, "financeDaily", "nonce-schema-day01"],
  [`/api/business-os/v1/finance/records?from=${FROM}&to=${TO}`, "recordsPage", "nonce-schema-rec01"],
  [`/api/business-os/v1/finance/balances?from=${FROM}&to=${TO}&as_of=${TO}`, "financeBalances", "nonce-schema-bal01"],
  [`/api/business-os/v1/finance/reconciliation?from=${FROM}&to=${TO}`, "financeReconciliation", "nonce-schema-recon"],
  [`/api/business-os/v1/subscriptions/summary?from=${FROM}&to=${TO}`, "subscriptionsSummary", "nonce-schema-subs1"],
  [`/api/business-os/v1/operations/daily?from=${FROM}&to=${TO}`, "operationsDaily", "nonce-schema-ops01"],
  [`/api/business-os/v1/analytics/report?provider=ga4&report=ga4_period_unique_users&from=${FROM}&to=${TO}`, "analyticsReport", "nonce-schema-an001"],
  ["/api/business-os/v1/health", "health", "nonce-schema-hlth1"],
];

describe("implemented OpenAPI", () => {
  it("lists the same eleven routes the handler serves", () => {
    const document = JSON.parse(readFileSync(
      "/Volumes/RomanSSD/Developer/doppler/doppler-web/docs/business-os/openapi.json",
      "utf8",
    )) as { paths: Record<string, unknown> };
    expect(Object.keys(document.paths).sort()).toEqual([...BUSINESS_OS_ROUTES].sort());
  });
});

describe("C0 response schemas", () => {
  const ajv = validator();

  it("validates every implemented route", async () => {
    const deps = harness();
    await deps.store.apply(observationFromRevolut({
      orderId: "ord_schema",
      amountMinor: 1000,
      currency: "USD",
      occurredAt: "2026-09-27T12:00:00Z",
      environment: "production",
      planId: "monthly",
    }));
    for (const [path, definition, nonce] of CASES) {
      const response = await handleBusinessOs(signed(path, nonce), deps);
      const payload = await response.json();
      const validate = ajv.getSchema(`https://simnetiq.store/contracts/business-os/v1/schemas/responses.json#/$defs/${definition}`);
      expect(response.status, `${path} ${JSON.stringify(payload)}`).toBe(200);
      const ok = validate?.(payload);
      expect(ok, `${definition} ${JSON.stringify(validate?.errors)}`).toBe(true);
    }
  });
});
