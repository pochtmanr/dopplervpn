import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { observationFromRevolut } from "../map-evidence";
import { MemoryReportingStore } from "../memory-store";
import { MoneyBook, moneyPageView } from "../money";
import { contentHash } from "../canonical";
import { queryBinding } from "./cursors";
import { encodeCursor } from "./cursors";
import { handleBusinessOs, type BosDeps } from "./handler";
import { MemoryNonceStore, bodySha256, canonicalString, signHmac, type BosKey } from "./hmac";
import type { FinanceRecord } from "../types";

const SECRET = "test-secret-do-not-use-in-production";
const KEY: BosKey = {
  keyId: "bos_test_doppler_production_v1",
  secret: SECRET,
  projectId: "doppler",
  environment: "production",
  status: "active",
};
const NOW = new Date("2026-09-28T12:00:00Z");
const FROM = "2026-09-01T00:00:00Z";
const TO = "2026-10-01T00:00:00Z";

function signedGet(path: string, nonce: string, key: BosKey = KEY): Request {
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
      "X-BOS-Key-Id": key.keyId,
      "X-BOS-Timestamp": timestamp,
      "X-BOS-Nonce": nonce,
      "X-BOS-Signature": signHmac(key.secret, canonical),
    },
  });
}

function deps(store: MemoryReportingStore, extra: Partial<BosDeps> = {}): BosDeps {
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
    ...extra,
  };
}

async function bodyOf(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("export guards", () => {
  it("rejects a missing interval, a malformed instant, an inverted range, and an oversized range", async () => {
    const store = new MemoryReportingStore();
    const missing = await handleBusinessOs(signedGet("/api/business-os/v1/finance/summary?to=2026-10-01T00:00:00Z", "nonce-missing-00001"), deps(store));
    expect(missing.status).toBe(400);
    expect(await bodyOf(missing)).toMatchObject({ error: { code: "missing_required_parameter" } });

    const malformed = await handleBusinessOs(signedGet("/api/business-os/v1/finance/summary?from=yesterday&to=2026-10-01T00:00:00Z", "nonce-malformed-001"), deps(store));
    expect(malformed.status).toBe(400);
    expect(await bodyOf(malformed)).toMatchObject({ error: { code: "malformed_parameter" } });

    const inverted = await handleBusinessOs(signedGet(`/api/business-os/v1/finance/summary?from=${TO}&to=${FROM}`, "nonce-inverted-001"), deps(store));
    expect(inverted.status).toBe(422);
    expect(await bodyOf(inverted)).toMatchObject({ error: { code: "invalid_interval" } });

    const oversized = await handleBusinessOs(
      signedGet("/api/business-os/v1/finance/summary?from=2020-01-01T00:00:00Z&to=2026-01-01T00:00:00Z", "nonce-oversize-0001"),
      deps(store),
    );
    expect(oversized.status).toBe(422);
    expect(await bodyOf(oversized)).toMatchObject({ error: { code: "interval_too_large" } });
  });

  it("rejects an unsupported basis and a page above 500", async () => {
    const store = new MemoryReportingStore();
    const basis = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/summary?from=${FROM}&to=${TO}&basis=earned_management`, "nonce-basis-000001"),
      deps(store),
    );
    expect(basis.status).toBe(422);
    expect(await bodyOf(basis)).toMatchObject({ error: { code: "unsupported_basis" } });
    const page = await handleBusinessOs(
      signedGet("/api/business-os/v1/finance/records?limit=501", "nonce-page-limit-01"),
      deps(store),
    );
    expect(page.status).toBe(422);
    expect(await bodyOf(page)).toMatchObject({ error: { code: "page_limit_too_large" } });
  });

  it("rejects a non-empty GET body after the signature matches", async () => {
    const store = new MemoryReportingStore();
    const path = "/api/business-os/v1/health";
    const timestamp = String(Math.floor(NOW.getTime() / 1000));
    const body = "{}";
    const canonical = canonicalString({
      method: "GET",
      requestTarget: path,
      timestamp,
      nonce: "nonce-body-0000001",
      bodySha256: bodySha256(body),
    });
    const request = {
      method: "GET",
      url: `https://export.test${path}`,
      headers: new Headers({
        "X-BOS-Key-Id": KEY.keyId,
        "X-BOS-Timestamp": timestamp,
        "X-BOS-Nonce": "nonce-body-0000001",
        "X-BOS-Signature": signHmac(KEY.secret, canonical),
      }),
      arrayBuffer: async () => new TextEncoder().encode(body).buffer,
    } as Request;
    const response = await handleBusinessOs(request, deps(store));
    expect(response.status).toBe(400);
    expect(await bodyOf(response)).toMatchObject({ error: { code: "unexpected_body" } });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("returns 429 with Retry-After when the key exceeds its nonce window", async () => {
    const store = new MemoryReportingStore();
    const response = await handleBusinessOs(
      signedGet("/api/business-os/v1/health", "nonce-rate-limit01"),
      deps(store, { rateLimit: 0 }),
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(await bodyOf(response)).toMatchObject({ error: { code: "rate_limited", retryable: true } });
  });

  it("rejects a signed request whose query was changed", async () => {
    const store = new MemoryReportingStore();
    const signed = signedGet("/api/business-os/v1/health", "nonce-tamper-00001");
    const tampered = new Request("https://export.test/api/business-os/v1/health?from=2026-09-01T00:00:00Z", {
      headers: signed.headers,
    });
    const response = await handleBusinessOs(tampered, deps(store));
    expect(response.status).toBe(403);
    expect(await bodyOf(response)).toMatchObject({ error: { code: "invalid_signature" } });
  });
});

describe("export records", () => {
  it("freezes one snapshot for concurrent first pages and shows a later correction on the next sync", async () => {
    const store = new MemoryReportingStore();
    store.clock = () => NOW;
    await store.apply(observationFromRevolut({
      orderId: "ord_live",
      amountMinor: 1000,
      currency: "USD",
      occurredAt: "2026-09-15T12:00:00Z",
      environment: "production",
      planId: "monthly",
    }));
    const path = `/api/business-os/v1/finance/records?from=${FROM}&to=${TO}&limit=10`;
    const [left, right] = await Promise.all([
      handleBusinessOs(signedGet(path, "nonce-page-left-01"), deps(store)),
      handleBusinessOs(signedGet(path, "nonce-page-right1"), deps(store)),
    ]);
    const leftBody = await bodyOf(left);
    const rightBody = await bodyOf(right);
    expect(leftBody.snapshot_id).toBe(rightBody.snapshot_id);
    expect(leftBody.high_watermark).toBe(rightBody.high_watermark);
    expect(leftBody.records).toHaveLength(1);

    const book = new MoneyBook(store);
    const draft = await book.createDraft({
      kind: "manual_income",
      amount: "5.00",
      currency: "USD",
      occurredAt: "2026-09-16T12:00:00Z",
      category: "manual",
      actor: "owner",
    });
    const posted = await book.postDraft(draft.draftId);
    const voided = await book.voidRecord(posted.record_id, "owner");
    expect(voided.status).toBe("void");
    expect(voided.record_id).toBe(posted.record_id);

    const replay = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/records?from=${FROM}&to=${TO}&limit=10&snapshot_id=${leftBody.snapshot_id}`, "nonce-replay-snap01"),
      deps(store),
    );
    const replayBody = await bodyOf(replay);
    expect(replayBody.high_watermark).toBe(leftBody.high_watermark);
    expect(JSON.stringify(replayBody.records)).not.toContain(voided.record_id);

    const checkpoint = (leftBody.page as { next_sync_checkpoint: string }).next_sync_checkpoint;
    const next = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/records?from=${FROM}&to=${TO}&limit=10&cursor=${checkpoint}`, "nonce-next-sync-01"),
      deps(store),
    );
    const nextBody = await bodyOf(next);
    const records = nextBody.records as Array<{ record_id: string; status: string; revision: number }>;
    expect(records.some((record) => record.record_id === voided.record_id && record.status === "void" && record.revision === 2)).toBe(true);
    expect(nextBody.snapshot_id).not.toBe(leftBody.snapshot_id);
  });

  it("returns 410 for an expired cursor and 422 when the cursor query changes", async () => {
    const store = new MemoryReportingStore();
    const first = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/records?from=${FROM}&to=${TO}`, "nonce-cursor-base1"),
      deps(store),
    );
    const page = (await bodyOf(first)).page as { next_sync_checkpoint: string };
    const expired = encodeCursor({
      v: 1,
      project_id: "doppler",
      environment: "production",
      endpoint: "/api/business-os/v1/finance/records",
      query_sha256: queryBinding(new URL(`https://export.test/api/business-os/v1/finance/records?from=${FROM}&to=${TO}`).searchParams),
      snapshot_id: "snap-expired",
      high_watermark: "1",
      after_change_sequence: "0",
      expires_at: "2020-01-01T00:00:00Z",
    });
    const gone = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/records?from=${FROM}&to=${TO}&cursor=${expired}`, "nonce-cursor-gone1"),
      deps(store),
    );
    expect(gone.status).toBe(410);
    expect(await bodyOf(gone)).toMatchObject({ error: { code: "cursor_expired", resync: { drop_cursor: true } } });

    const mismatch = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/records?from=${FROM}&to=2026-09-15T00:00:00Z&cursor=${page.next_sync_checkpoint}`, "nonce-cursor-mis-1"),
      deps(store),
    );
    expect(mismatch.status).toBe(422);
    expect(await bodyOf(mismatch)).toMatchObject({ error: { code: "cursor_query_mismatch" } });
  });

  it("fails closed when the same revision has two hashes", async () => {
    const store = new MemoryReportingStore();
    const base = {
      record_id: "sale.conflict.1",
      revision: 1,
      change_sequence: "1",
      record_type: "sale" as const,
      project_id: "doppler" as const,
      source_system: "manual",
      source_account_id: "manual.unspecified",
      environment: "production" as const,
      external_object_id: "ext-1",
      economic_transaction_id: "econ-1",
      occurred_at: "2026-09-15T12:00:00Z",
      updated_at: "2026-09-15T12:00:00Z",
      status: "posted" as const,
      original_amount: { amount: "1.00", currency: "USD", quality: "actual" as const },
      quality: "actual" as const,
      coverage: "partial" as const,
      formula_version: "doppler-purchase-native-v1" as const,
      content_hash: "abc",
      economic_direction: "inflow" as const,
      counts_as_new_revenue: true,
      acquisition: { source: "manual", medium: null, campaign: null, model: null, window_days: null, consent: "unknown" as const },
      source_as_of: "2026-09-15T12:00:00Z",
      retrieved_at: "2026-09-15T12:00:00Z",
    };
    store.seedRevision({ ...base, content_hash: contentHash({ ...base, content_hash: undefined }) });
    store.seedRevision({ ...base, content_hash: "f".repeat(64) });
    await store.createSnapshot(NOW);
    const response = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/records?from=${FROM}&to=${TO}`, "nonce-conflict-001"),
      deps(store),
    );
    expect(response.status).toBe(503);
    expect(await bodyOf(response)).toMatchObject({ error: { code: "temporary_unavailable" } });
  });

  it("redacts emails, bearer tokens, and document urls", async () => {
    const store = new MemoryReportingStore();
    const record = {
      record_id: "sale.redact.1",
      revision: 1,
      change_sequence: "1",
      record_type: "sale" as const,
      project_id: "doppler" as const,
      source_system: "manual",
      source_account_id: "manual.unspecified",
      environment: "production" as const,
      external_object_id: "ext-redact",
      economic_transaction_id: "econ-redact",
      occurred_at: "2026-09-15T12:00:00Z",
      updated_at: "2026-09-15T12:00:00Z",
      status: "posted" as const,
      original_amount: { amount: "2.00", currency: "USD", quality: "actual" as const },
      quality: "actual" as const,
      coverage: "partial" as const,
      formula_version: "doppler-purchase-native-v1" as const,
      content_hash: "",
      economic_direction: "inflow" as const,
      counts_as_new_revenue: true,
      vendor_reference: "person@example.com",
      customer_email: "person@example.com",
      document_refs: [{ document_id: "doc-1", checksum_sha256: "ab".repeat(32), url: "https://files.example/secret", title: "receipt" }],
      acquisition: { source: "manual", medium: null, campaign: null, model: null, window_days: null, consent: "unknown" as const },
      source_as_of: "2026-09-15T12:00:00Z",
      retrieved_at: "2026-09-15T12:00:00Z",
    } as unknown as FinanceRecord & { customer_email: string };
    record.content_hash = contentHash({ ...record });
    store.seedRevision(record as unknown as FinanceRecord);
    const response = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/records?from=${FROM}&to=${TO}`, "nonce-redact-00001"),
      deps(store),
    );
    const payload = JSON.stringify(await bodyOf(response));
    expect(response.status).toBe(200);
    expect(payload).not.toContain("person@example.com");
    expect(payload).not.toContain("https://files.example/secret");
    expect(payload).toContain("doc-1");
    expect(payload).toContain("ab".repeat(32));
  });
});

describe("export summaries", () => {
  it("rejects an unknown source and keeps another source out of the total", async () => {
    const store = new MemoryReportingStore();
    store.clock = () => NOW;
    await store.apply(observationFromRevolut({
      orderId: "ord_src",
      amountMinor: 1000,
      currency: "USD",
      occurredAt: "2026-09-20T12:00:00Z",
      environment: "production",
      planId: "monthly",
    }));
    const unknown = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/summary?from=${FROM}&to=${TO}&source=stripe`, "nonce-source-bad001"),
      deps(store),
    );
    expect(unknown.status).toBe(400);
    expect(await bodyOf(unknown)).toMatchObject({ error: { code: "malformed_parameter" } });
    const other = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/summary?from=${FROM}&to=${TO}&source=oxapay`, "nonce-source-oxa001"),
      deps(store),
    );
    const otherBody = await bodyOf(other);
    const subtotals = otherBody.native_currency_subtotals as Array<{ metrics: { gross_customer_sales: { amount: string | null } } }>;
    expect(subtotals.every((row) => row.metrics.gross_customer_sales.amount === null || row.metrics.gross_customer_sales.amount === "0.00")).toBe(true);
  });

  it("matches the money page native totals and does not relabel settled cash", async () => {
    const store = new MemoryReportingStore();
    store.clock = () => NOW;
    await store.apply(observationFromRevolut({
      orderId: "ord_native",
      amountMinor: 2500,
      currency: "USD",
      occurredAt: "2026-09-20T12:00:00Z",
      environment: "production",
      planId: "monthly",
    }));
    const purchase = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/summary?from=${FROM}&to=${TO}&basis=purchase`, "nonce-purchase-001"),
      deps(store),
    );
    const purchaseBody = await bodyOf(purchase);
    const book = new MoneyBook(store);
    const page = moneyPageView(await book.snapshot({ from: FROM, to: TO, basis: "purchase", snapshotId: String(purchaseBody.snapshot_id) }));
    const subtotals = purchaseBody.native_currency_subtotals as Array<{ currency: string; metrics: { gross_customer_sales: { amount: string | null } } }>;
    expect(subtotals.find((row) => row.currency === "USD")?.metrics.gross_customer_sales.amount).toBe(
      page.native.find((row) => row.currency === "USD")?.metrics.gross_customer_sales.amount,
    );
    expect((purchaseBody.metrics as { gross_customer_sales: { amount: null; reason: string } }).gross_customer_sales.amount).toBeNull();
    expect((purchaseBody.metrics as { gross_customer_sales: { reason: string } }).gross_customer_sales.reason).toBe("missing_fx_evidence");

    const settled = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/summary?from=${FROM}&to=${TO}&basis=settled_cash&snapshot_id=${purchaseBody.snapshot_id}`, "nonce-settled-0001"),
      deps(store),
    );
    const settledBody = await bodyOf(settled);
    const settledNative = settledBody.native_currency_subtotals as Array<{ metrics: { gross_customer_sales: { amount: string | null; reason?: string } } }>;
    expect(settledNative[0]?.metrics.gross_customer_sales.amount).toBeNull();
    expect(settledNative[0]?.metrics.gross_customer_sales.reason).toBe("settled_cash_sales_unsupported");
    expect(settled.headers.get("cache-control")).toBe("private, no-store");
  });

  it("keeps a full London day partial only when coverage is missing, and never includes balances", async () => {
    const store = new MemoryReportingStore();
    const full = await handleBusinessOs(
      signedGet("/api/business-os/v1/finance/daily?from=2026-09-26T23:00:00Z&to=2026-09-27T23:00:00Z", "nonce-daily-full-01"),
      deps(store),
    );
    const fullBody = await bodyOf(full);
    expect(fullBody.balances_included).toBe(false);
    const buckets = fullBody.buckets as Array<{ date: string; partial: boolean; metrics: { gross_customer_sales: { amount: null } } }>;
    expect(buckets).toHaveLength(1);
    expect(buckets[0]?.date).toBe("2026-09-27");
    expect(buckets[0]?.partial).toBe(true);
    expect(buckets[0]?.metrics.gross_customer_sales.amount).toBeNull();

    await store.saveCheckpoint("revolut", {
      cursorCreatedAt: null,
      cursorId: null,
      coveredThrough: "2026-09-28T00:00:00Z",
      retryCount: 0,
      lastError: null,
    });
    const covered = await handleBusinessOs(
      signedGet("/api/business-os/v1/finance/daily?from=2026-09-26T23:00:00Z&to=2026-09-27T23:00:00Z", "nonce-daily-cover1"),
      deps(store),
    );
    const coveredBuckets = (await bodyOf(covered)).buckets as Array<{ partial: boolean }>;
    expect(coveredBuckets[0]?.partial).toBe(false);
  });

  it("reports unavailable cash instead of zero and keeps subscription stocks non-additive", async () => {
    const store = new MemoryReportingStore();
    const balances = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/balances?from=${FROM}&to=${TO}&as_of=2026-09-28T12:00:00Z`, "nonce-balance-0001"),
      deps(store),
    );
    const balanceBody = await bodyOf(balances);
    const snapshots = balanceBody.snapshots as Array<{ additive: boolean; amount: { amount: string | null; reason?: string } }>;
    expect(snapshots[0]?.additive).toBe(false);
    expect(snapshots[0]?.amount.amount).toBeNull();
    expect(snapshots[0]?.amount.reason).toBe("missing_statement_evidence");
    expect(JSON.stringify(balanceBody)).not.toContain('"amount":"0.00"');

    const subscriptions = await handleBusinessOs(
      signedGet(`/api/business-os/v1/subscriptions/summary?from=${FROM}&to=${TO}`, "nonce-subs-missing1"),
      deps(store),
    );
    const subscriptionBody = await bodyOf(subscriptions);
    expect(JSON.stringify(subscriptionBody.metrics)).toContain("missing_subscription_events");

    const operations = await handleBusinessOs(
      signedGet(`/api/business-os/v1/operations/daily?from=${FROM}&to=${TO}`, "nonce-ops-daily-01"),
      deps(store),
    );
    const ops = await bodyOf(operations);
    const buckets = ops.buckets as Array<{ stocks: Array<{ additive: boolean }> }>;
    expect(buckets.every((bucket) => bucket.stocks.every((stock) => stock.additive === false))).toBe(true);
  });

  it("advertises analytics as unsupported and health as unknown rather than zero", async () => {
    const store = new MemoryReportingStore();
    const capabilities = await handleBusinessOs(signedGet("/api/business-os/v1/capabilities", "nonce-capabilities1"), deps(store));
    const caps = await bodyOf(capabilities);
    expect(caps.formula_versions).toEqual([
      "doppler-purchase-native-v1",
      "doppler-money-native-v1",
      "doppler-subscriptions-native-v1",
    ]);
    expect((caps.datasets as { analytics: { ga4_overview_daily: boolean } }).analytics.ga4_overview_daily).toBe(false);
    expect(caps.earliest_data_at).toBeNull();

    const unknown = await handleBusinessOs(
      signedGet(`/api/business-os/v1/analytics/report?provider=ga4&report=not_a_report&from=${FROM}&to=${TO}`, "nonce-analytics-bad"),
      deps(store),
    );
    expect(unknown.status).toBe(422);
    expect(await bodyOf(unknown)).toMatchObject({ error: { code: "unsupported_dataset" } });

    const analytics = await handleBusinessOs(
      signedGet(`/api/business-os/v1/analytics/report?provider=ga4&report=ga4_overview_daily&from=${FROM}&to=${TO}`, "nonce-analytics-ok1"),
      deps(store),
    );
    const report = await bodyOf(analytics);
    expect(report.availability).toBe("unsupported");
    expect(report.rows).toEqual([]);
    expect(JSON.stringify(report)).not.toContain('"clicks":0');

    const health = await handleBusinessOs(signedGet("/api/business-os/v1/health", "nonce-health-live1"), deps(store));
    const healthBody = await bodyOf(health);
    const sources = healthBody.sources as Array<{ status: string; lag_seconds: number | null; covered_through: string | null }>;
    expect(sources.every((source) => source.status === "unknown" && source.lag_seconds === null && source.covered_through === null)).toBe(true);
  });

  it("does not reuse a cached body for a newer snapshot", async () => {
    const store = new MemoryReportingStore();
    store.clock = () => NOW;
    const cache = new Map<string, unknown>();
    const first = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/summary?from=${FROM}&to=${TO}&basis=purchase`, "nonce-cache-first1"),
      deps(store, { cache }),
    );
    const firstBody = await bodyOf(first);
    const params = new URL(`https://export.test/api/business-os/v1/finance/summary?from=${FROM}&to=${TO}&basis=purchase&snapshot_id=${firstBody.snapshot_id}`).searchParams;
    const key = `/api/business-os/v1/finance/summary?${queryBinding(params)}|${firstBody.snapshot_id}`;
    cache.set(key, { snapshot_id: firstBody.snapshot_id, cached: true });
    const cached = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/summary?from=${FROM}&to=${TO}&basis=purchase&snapshot_id=${firstBody.snapshot_id}`, "nonce-cache-hit-01"),
      deps(store, { cache }),
    );
    expect(await bodyOf(cached)).toMatchObject({ cached: true });

    await store.apply(observationFromRevolut({
      orderId: "ord_later",
      amountMinor: 500,
      currency: "USD",
      occurredAt: "2026-09-21T12:00:00Z",
      environment: "production",
      planId: "monthly",
    }));
    const newer = await handleBusinessOs(
      signedGet(`/api/business-os/v1/finance/summary?from=${FROM}&to=${TO}&basis=purchase`, "nonce-cache-newer1"),
      deps(store, { cache }),
    );
    const newerBody = await bodyOf(newer);
    expect(newerBody.snapshot_id).not.toBe(firstBody.snapshot_id);
    expect(newerBody.cached).toBeUndefined();
  });
});

describe("cursor wire format", () => {
  it("matches the frozen cursor payload encoding", () => {
    const fixture = JSON.parse(readFileSync(
      "/Volumes/RomanSSD/Developer/simnetiq.store/contracts/business-os/v1/fixtures/positive/cursor-payload.json",
      "utf8",
    )) as { payload: Parameters<typeof encodeCursor>[0]; wire_base64url: string };
    expect(encodeCursor(fixture.payload)).toBe(fixture.wire_base64url);
  });
});
