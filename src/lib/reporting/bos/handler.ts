import type { ReportingStore, Snapshot } from "../types";
import type { SubscriptionEvidence } from "../subscriptions";
import { authenticateBusinessOs, type BosKey } from "./hmac";
import type { BosEnvironment } from "./keys";
import type { NonceStore } from "./nonce-store";
import { GuardError, assertEmptyGetBody, assertRange, readInstant, readInterval, readPageLimit, readSource } from "./guards";
import { decodeCursor, queryBinding } from "./cursors";
import { redactExport } from "./redact";
import type { AnalyticsStore } from "../analytics/store";
import { analyticsConfigured, buildAnalyticsReport, headlineFromEnv } from "../analytics/report";
import {
  ExportConflict,
  knownReportProvider,
  loadSharedModel,
  pageRecords,
  subscriptionsFor,
  toBalances,
  toCapabilities,
  toFinanceDaily,
  toFinanceSummary,
  toHealth,
  toOverview,
  toReconciliation,
  unsupportedAnalytics,
} from "./export";

export interface BosDeps {
  store: ReportingStore;
  nonceStore: NonceStore;
  keys: BosKey[];
  now: () => Date;
  environment: BosEnvironment;
  projectId: string;
  testTransport: boolean;
  rateLimit: number;
  subscriptionEvidence?: SubscriptionEvidence;
  cache?: Map<string, unknown>;
  analytics?: AnalyticsStore;
}

const ROUTE_LIST = [
  "/api/business-os/v1/capabilities",
  "/api/business-os/v1/overview",
  "/api/business-os/v1/finance/summary",
  "/api/business-os/v1/finance/daily",
  "/api/business-os/v1/finance/records",
  "/api/business-os/v1/finance/balances",
  "/api/business-os/v1/finance/reconciliation",
  "/api/business-os/v1/subscriptions/summary",
  "/api/business-os/v1/operations/daily",
  "/api/business-os/v1/analytics/report",
  "/api/business-os/v1/health",
] as const;

export const BUSINESS_OS_ROUTES: readonly string[] = ROUTE_LIST;
const ROUTES = new Set<string>(ROUTE_LIST);

export async function handleBusinessOs(request: Request, deps: BosDeps): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  if (!ROUTES.has(path)) return problem(404, "malformed_parameter", "Unknown route.", false);
  const body = new Uint8Array(await request.arrayBuffer());
  const tls = url.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  if (deps.keys.length === 0) {
    return problem(503, "temporary_unavailable", "Export keys are not configured.", true);
  }
  const auth = await authenticateBusinessOs({
    method: request.method,
    requestTarget: `${path}${url.search}`,
    body,
    headers: request.headers,
    keys: deps.keys,
    nonceStore: deps.nonceStore,
    nowMs: deps.now().getTime(),
    deploymentProjectId: deps.projectId,
    deploymentEnvironment: deps.environment,
    tls,
    testTransport: deps.testTransport,
    rateLimit: deps.rateLimit,
  });
  if (!auth.ok) return problem(auth.status, auth.code, auth.message, auth.retryable, auth.retryAfter);
  try {
    assertEmptyGetBody(body);
    if (request.method !== "GET") {
      throw new GuardError(400, "malformed_parameter", false, "Only GET is supported.");
    }
    const cacheKey = `${path}?${queryBinding(url.searchParams)}|${url.searchParams.get("snapshot_id") ?? ""}`;
    if (url.searchParams.get("snapshot_id") && deps.cache?.has(cacheKey)) {
      return json(deps.cache.get(cacheKey), 200);
    }
    const payload = await dispatch(path, url.searchParams, deps);
    if (url.searchParams.get("snapshot_id")) deps.cache?.set(cacheKey, payload);
    return json(payload, 200);
  } catch (error) {
    if (error instanceof GuardError) {
      return problem(error.status, error.code, error.message, error.retryable, undefined, error.resync);
    }
    if (error instanceof ExportConflict) {
      return problem(503, "temporary_unavailable", "A record revision hash conflict blocked the export.", true);
    }
    return problem(503, "temporary_unavailable", "The export is temporarily unavailable.", true);
  }
}

async function dispatch(path: string, params: URLSearchParams, deps: BosDeps): Promise<unknown> {
  const now = deps.now();
  const generatedAt = now.toISOString().replace(/\.\d{3}Z$/, "Z");
  if (path.endsWith("/capabilities") || path.endsWith("/health")) {
    const snapshot = await snapshotFor(deps.store, params.get("snapshot_id"), now);
    if (path.endsWith("/health")) {
      return toHealth(deps.store, deps.environment, generatedAt, snapshot.snapshotId, snapshot.dataAsOf, now);
    }
    return toCapabilities(deps.store, deps.environment, generatedAt, snapshot.snapshotId, snapshot.dataAsOf);
  }
  if (path.endsWith("/analytics/report")) return analytics(params, deps, generatedAt, now);
  if (path.endsWith("/finance/records")) return records(params, deps, generatedAt, now);
  const query = readInterval(params);
  const snapshot = await snapshotFor(deps.store, query.snapshotId, now);
  const model = await loadSharedModel(deps.store, {
    from: query.from,
    to: query.to,
    basis: query.basis,
    snapshotId: snapshot.snapshotId,
    source: query.source ?? undefined,
    channel: query.channel ?? undefined,
  });
  if (path.endsWith("/finance/balances")) {
    const asOf = readInstant(params.get("as_of"), "as_of", true);
    return toBalances(model, deps.environment, generatedAt, asOf ?? model.data_as_of);
  }
  if (path.endsWith("/finance/summary")) return toFinanceSummary(model, query, deps.environment, generatedAt);
  if (path.endsWith("/finance/daily")) {
    return toFinanceDaily(deps.store, model, query, deps.environment, generatedAt, await coveredThrough(deps.store));
  }
  if (path.endsWith("/finance/reconciliation")) return toReconciliation(model, query, deps.environment, generatedAt);
  const subscriptions = subscriptionsFor(
    model,
    deps.subscriptionEvidence ?? { events: null, chargebacks: null },
    query,
  );
  if (path.endsWith("/subscriptions/summary")) {
    return { ...subscriptions.summary, environment: deps.environment, generated_at: generatedAt };
  }
  if (path.endsWith("/operations/daily")) {
    return { ...subscriptions.operations, environment: deps.environment, generated_at: generatedAt };
  }
  return toOverview(model, subscriptions.summary, query, deps.environment, generatedAt);
}

async function records(params: URLSearchParams, deps: BosDeps, generatedAt: string, now: Date) {
  const from = readInstant(params.get("from"), "from", false);
  const to = readInstant(params.get("to"), "to", false);
  if (from && to) assertRange(from, to);
  const limit = readPageLimit(params.get("limit"));
  const binding = queryBinding(params);
  const wire = params.get("cursor");
  let snapshot: Snapshot;
  let after = "0";
  if (wire) {
    const cursor = decodeCursor(wire);
    if (!cursor) throw new GuardError(400, "malformed_parameter", false, "Cursor is malformed.");
    if (cursor.expires_at <= generatedAt) {
      throw new GuardError(410, "cursor_expired", false, "Cursor expired. Drop the cursor and bootstrap a new snapshot.", {
        drop_cursor: true,
        endpoint: "/api/business-os/v1/finance/records",
        reuse_original_from_to: true,
      });
    }
    if (
      cursor.project_id !== deps.projectId ||
      cursor.environment !== deps.environment ||
      cursor.endpoint !== "/api/business-os/v1/finance/records" ||
      cursor.query_sha256 !== binding
    ) {
      throw new GuardError(422, "cursor_query_mismatch", false, "Cursor does not match this query.");
    }
    const advancing = cursor.after_change_sequence === cursor.high_watermark;
    if (advancing) {
      snapshot = await deps.store.createSnapshot(now);
      after = cursor.high_watermark;
    } else {
      const existing = await deps.store.getSnapshot(cursor.snapshot_id);
      if (!existing) {
        throw new GuardError(410, "snapshot_expired", false, "Snapshot expired. Drop the cursor and bootstrap a new snapshot.", {
          drop_cursor: true,
          endpoint: "/api/business-os/v1/finance/records",
          reuse_original_from_to: true,
        });
      }
      snapshot = existing;
      after = cursor.after_change_sequence;
    }
  } else {
    snapshot = await snapshotFor(deps.store, params.get("snapshot_id"), now);
  }
  const revisions = await deps.store.revisionsAt(snapshot.highWatermark);
  return pageRecords({
    records: revisions,
    after,
    limit,
    watermark: snapshot.highWatermark,
    snapshotId: snapshot.snapshotId,
    dataAsOf: snapshot.dataAsOf,
    generatedAt,
    environment: deps.environment,
    binding,
    now,
    endpoint: "/api/business-os/v1/finance/records",
    from,
    to,
    source: readSource(params.get("source")),
    channel: params.get("channel"),
  });
}

async function analytics(params: URLSearchParams, deps: BosDeps, generatedAt: string, now: Date) {
  const provider = params.get("provider");
  const report = params.get("report");
  if (!provider || !report) throw new GuardError(400, "missing_required_parameter", false, "Missing provider or report.");
  const expected = knownReportProvider(report);
  if (!expected) throw new GuardError(422, "unsupported_dataset", false, "The report is not in the contract.");
  if (expected !== provider) throw new GuardError(422, "unsupported_dataset", false, "The provider does not own that report.");
  const query = readInterval(params);
  const snapshot = await snapshotFor(deps.store, query.snapshotId, now);
  const flags = analyticsConfigured();
  const enabled = flags[report as keyof typeof flags] === true;
  if (report !== "vercel_daily" && (!enabled || !deps.analytics)) {
    return unsupportedAnalytics({
      environment: deps.environment,
      snapshotId: snapshot.snapshotId,
      generatedAt,
      dataAsOf: snapshot.dataAsOf,
      provider,
      report,
      from: query.from,
      to: query.to,
      limit: readPageLimit(params.get("limit")),
    });
  }
  const facts = deps.analytics ? await deps.analytics.latestFacts({ provider, report }) : [];
  const batches = report === "vercel_daily" && deps.analytics ? await deps.analytics.drainBatches() : [];
  const built = buildAnalyticsReport({
    provider,
    report,
    from: query.from,
    to: query.to,
    limit: readPageLimit(params.get("limit")),
    cursor: params.get("cursor"),
    facts,
    batches,
    checkpoint: await deps.store.getCheckpoint(provider),
    configured: enabled,
    now,
    environment: deps.environment,
    snapshotId: snapshot.snapshotId,
    dataAsOf: snapshot.dataAsOf,
    binding: queryBinding(params),
    primary: headlineFromEnv(flags.ga4_overview_daily),
    vercelEnabled: flags.vercel_daily,
  });
  if (!built.ok) throw new GuardError(400, "malformed_parameter", false, "Cursor is malformed.");
  return built.body;
}

async function snapshotFor(store: ReportingStore, snapshotId: string | null, now: Date): Promise<Snapshot> {
  if (!snapshotId) return store.createSnapshot(now);
  const existing = await store.getSnapshot(snapshotId);
  if (!existing) {
    throw new GuardError(410, "snapshot_expired", false, "Snapshot expired.", {
      drop_cursor: true,
      endpoint: "/api/business-os/v1/finance/records",
      reuse_original_from_to: true,
    });
  }
  return existing;
}

async function coveredThrough(store: ReportingStore): Promise<string | null> {
  let latest: string | null = null;
  for (const source of ["revolut", "oxapay", "revenuecat"]) {
    const checkpoint = await store.getCheckpoint(source);
    if (checkpoint?.coveredThrough && (!latest || checkpoint.coveredThrough > latest)) {
      latest = checkpoint.coveredThrough;
    }
  }
  return latest;
}

function json(body: unknown, status: number, retryAfter?: number): Response {
  const headers = new Headers({ "cache-control": "private, no-store", "content-type": "application/json" });
  if (retryAfter) headers.set("retry-after", String(retryAfter));
  return new Response(JSON.stringify(redactExport(body)), { status, headers });
}

function problem(
  status: number,
  code: string,
  message: string,
  retryable: boolean,
  retryAfter?: number,
  resync?: { drop_cursor: true; endpoint: string; reuse_original_from_to: boolean },
): Response {
  return json({
    error: {
      code,
      message,
      retryable,
      ...(resync ? { resync } : {}),
    },
  }, status, retryAfter);
}
