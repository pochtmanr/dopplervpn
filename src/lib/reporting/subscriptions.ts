/**
 * Recurring-subscription and paid-access snapshot.
 * Formula doppler-subscriptions-native-v1. Sales figures stay on the purchase formula.
 * Aggregates only: account ids never leave this module.
 */

import { CONTRACT_VERSION, FX_POLICY_VERSION, PROJECT_ID, TIMEZONE_PROPOSAL } from "./constants";
import { addDecimals, divideDecimals, formatDecimal, multiplyDecimal, parseDecimal } from "./decimal";

export const SUBSCRIPTION_FORMULA_VERSION = "doppler-subscriptions-native-v1";

/** Matches the expiry sweeper: access can outlast the billed period by three days. */
const GRACE_MS = 3 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONEY_SCALE = 4;
const RATIO_SCALE = 4;
const STORE_RECURRING = new Set([
  "app_store",
  "play_store",
  "ios",
  "macos",
  "mac_app_store",
  "android",
]);

/** Published store list prices. Used only when no charged amount is on the event. */
const CATALOG: Record<string, { months: number; listPrice: string; currency: "USD" }> = {
  vpn_premium_monthly: { months: 1, listPrice: "6.99", currency: "USD" },
  vpn_premium_monthly_20off: { months: 1, listPrice: "5.59", currency: "USD" },
  vpn_premium_6m: { months: 6, listPrice: "29.99", currency: "USD" },
  vpn_premium_yearly: { months: 12, listPrice: "39.99", currency: "USD" },
  vpn_premium_yearly_20off: { months: 12, listPrice: "31.99", currency: "USD" },
};

export type LifecycleKind =
  | "INITIAL_PURCHASE"
  | "RENEWAL"
  | "CANCELLATION"
  | "BILLING_ISSUE"
  | "EXPIRATION"
  | "NON_RENEWING_PURCHASE"
  | "PRODUCT_CHANGE";

export interface LifecycleEvent {
  eventId: string;
  occurredAt: string;
  contractId: string;
  accountId: string;
  kind: LifecycleKind;
  productId: string | null;
  store: string | null;
  environment: "production" | "sandbox";
  expiresAt: string | null;
  chargedAmount: string | null;
  currency: string | null;
  phase: "trial" | "paying" | null;
  billingModel: "recurring" | "fixed_term" | null;
}

export interface ChargebackRef {
  recordId: string;
  occurredAt: string;
}

export interface SubscriptionEvidence {
  /** Null when subscription_events was not read. An empty array is a measured zero. */
  events: LifecycleEvent[] | null;
  /** Null when the finance snapshot was not passed in. */
  chargebacks: ChargebackRef[] | null;
  eventsTruncated?: boolean;
}

export interface SubscriptionWindow {
  from: string;
  to: string;
  asOf: string;
  snapshotId: string;
  generatedAt: string;
  dataAsOf: string;
}

export interface CountValue {
  value: number | null;
  reason?: string;
}

export interface MoneyMetric {
  amount: string | null;
  currency: string;
  quality: "actual" | "estimated" | "unavailable";
  coverage: "complete" | "partial" | "missing";
  reason?: string;
}

export interface RatioMetric {
  numerator: number | null;
  denominator: number | null;
  window_ratio: string | null;
  monthly_normalized_ratio: string | null;
  window_days: string | null;
  reason?: string;
}

type LiveStatus = "trial" | "paying" | "grace" | "cancelled_pending_expiry" | "fixed_term_active";
type Status = LiveStatus | "expired" | "unknown" | "excluded";

interface Contract {
  contractId: string;
  accountId: string;
  productId: string | null;
  store: string;
  billing: "recurring" | "fixed_term" | "grant" | "unknown";
  phase: "trial" | "paying" | "unknown";
  wasTrial: boolean;
  autoRenew: boolean;
  startedAt: string;
  expiresAt: string | null;
  graceUntil: string | null;
  expiredAt: string | null;
  payingStartedAt: string | null;
  chargedAmount: string | null;
  currency: string | null;
}

interface Price {
  monthly: string;
  annual: string;
  currency: string;
  quality: "actual" | "estimated";
  reason?: string;
  remainder: boolean;
}

export interface StoredSubscriptionEvent {
  id: string;
  event_type: string;
  account_id: string;
  original_transaction_id: string | null;
  platform: string | null;
  product_id: string | null;
  expires_at: string | null;
  details: unknown;
  created_at: string;
}

export interface SubscriptionModel {
  window: SubscriptionWindow;
  coverage: "complete" | "partial" | "missing";
  activeContracts: CountValue;
  activeCustomers: CountValue;
  paidAccessAccounts: CountValue;
  statuses: {
    trial: CountValue;
    paying: CountValue;
    grace: CountValue;
    cancelled_pending_expiry: CountValue;
  };
  mrr: MoneyMetric;
  arr: MoneyMetric;
  churn: { contract: RatioMetric; customer: RatioMetric };
  trialConversions: CountValue;
  operations: OperationsDaily;
  warnings: string[];
  sourceHealth: Array<{ source: string; status: string }>;
}

export interface OperationsDaily {
  schema_version: "1.0.0";
  contract_version: typeof CONTRACT_VERSION;
  project_id: "doppler";
  environment: "production";
  snapshot_id: string;
  generated_at: string;
  data_as_of: string;
  period: { from: string; to: string; timezone: typeof TIMEZONE_PROPOSAL };
  posting: false;
  buckets: Array<{
    date: string;
    timezone: typeof TIMEZONE_PROPOSAL;
    partial: boolean;
    flows: Array<{ name: "new_contracts" | "renewal_failures" | "chargeback_events"; count: number; additive: true }>;
    stocks: Array<{
      name: "paid_access_accounts" | "active_contracts" | "active_customers";
      count: number;
      additive: false;
      as_of: string;
    }>;
  }>;
  warnings: string[];
}

function utc(ms: number): string {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function ms(iso: string): number {
  return Date.parse(iso);
}

function count(value: number | null, reason?: string): CountValue {
  return reason ? { value, reason } : { value };
}

function blankRatio(reason: string): RatioMetric {
  return {
    numerator: null,
    denominator: null,
    window_ratio: null,
    monthly_normalized_ratio: null,
    window_days: null,
    reason,
  };
}

function moneyUnavailable(coverage: MoneyMetric["coverage"], reason: string, currency = "USD"): MoneyMetric {
  return { amount: null, currency, quality: "unavailable", coverage, reason };
}

function tzWall(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const bag = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = bag.hour === "24" ? 0 : Number(bag.hour);
  return Date.UTC(Number(bag.year), Number(bag.month) - 1, Number(bag.day), hour, Number(bag.minute), Number(bag.second));
}

function londonYmd(instant: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_PROPOSAL,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(instant));
  const bag = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${bag.year}-${bag.month}-${bag.day}`;
}

function londonMidnight(ymd: string): number {
  const [year, month, day] = ymd.split("-").map(Number);
  const guess = Date.UTC(year, month - 1, day, 0, 0, 0);
  const start = guess - (tzWall(guess, TIMEZONE_PROPOSAL) - guess);
  return guess - (tzWall(start, TIMEZONE_PROPOSAL) - start);
}

function londonDays(fromMs: number, toMs: number): Array<{ date: string; start: number; end: number; partial: boolean }> {
  const days = [];
  let cursor = fromMs;
  while (cursor < toMs) {
    const date = londonYmd(cursor);
    const dayStart = londonMidnight(date);
    const nextStart = londonMidnight(londonYmd(dayStart + 36 * 60 * 60 * 1000));
    const start = Math.max(cursor, dayStart);
    const end = Math.min(toMs, nextStart);
    days.push({ date, start, end, partial: start !== dayStart || end !== nextStart });
    cursor = end;
  }
  return days;
}

function classify(event: LifecycleEvent): Contract["billing"] {
  const store = (event.store ?? "").trim().toLowerCase();
  if (store === "admin" || store === "dev-grant") return "grant";
  if (event.kind === "NON_RENEWING_PURCHASE" || event.billingModel === "fixed_term") return "fixed_term";
  if (event.billingModel === "recurring") return "recurring";
  if (store === "revolut" || store === "oxapay" || store === "stripe" || store === "paddle") return "fixed_term";
  if (STORE_RECURRING.has(store)) return "recurring";
  return "unknown";
}

function emptyContract(event: LifecycleEvent): Contract {
  return {
    contractId: event.contractId,
    accountId: event.accountId,
    productId: event.productId,
    store: (event.store ?? "").trim().toLowerCase(),
    billing: classify(event),
    phase: "unknown",
    wasTrial: false,
    autoRenew: true,
    startedAt: event.occurredAt,
    expiresAt: event.expiresAt,
    graceUntil: null,
    expiredAt: null,
    payingStartedAt: null,
    chargedAmount: event.chargedAmount,
    currency: event.currency,
  };
}

function notePrice(contract: Contract, event: LifecycleEvent): void {
  if (event.chargedAmount && event.currency) {
    contract.chargedAmount = event.chargedAmount;
    contract.currency = event.currency;
  }
  if (event.productId) contract.productId = event.productId;
  if (event.expiresAt) contract.expiresAt = event.expiresAt;
  contract.accountId = event.accountId;
}

function markPaying(contract: Contract, event: LifecycleEvent): void {
  if (contract.phase === "trial") contract.wasTrial = true;
  if (contract.payingStartedAt == null) contract.payingStartedAt = event.occurredAt;
  contract.phase = "paying";
  contract.graceUntil = null;
  contract.expiredAt = null;
  contract.autoRenew = true;
}

function applyEvent(contract: Contract, event: LifecycleEvent): void {
  const billing = classify(event);
  if (billing !== "unknown") contract.billing = billing;
  if (event.kind === "CANCELLATION") {
    contract.autoRenew = false;
    notePrice(contract, event);
    return;
  }
  if (event.kind === "BILLING_ISSUE") {
    notePrice(contract, event);
    const anchor = contract.expiresAt ? ms(contract.expiresAt) : ms(event.occurredAt);
    contract.graceUntil = new Date(anchor + GRACE_MS).toISOString();
    return;
  }
  if (event.kind === "EXPIRATION") {
    contract.expiredAt = event.occurredAt;
    contract.graceUntil = null;
    return;
  }
  if (event.kind === "RENEWAL") {
    notePrice(contract, event);
    markPaying(contract, event);
    return;
  }
  if (event.kind === "PRODUCT_CHANGE") {
    notePrice(contract, event);
    return;
  }
  notePrice(contract, event);
  if (event.phase === "trial") {
    contract.phase = "trial";
    contract.wasTrial = true;
    return;
  }
  if (event.phase === "paying" || event.chargedAmount) {
    markPaying(contract, event);
  }
}

function replay(events: LifecycleEvent[], cutoffMs: number): { contracts: Contract[]; sandbox: number } {
  const seen = new Set<string>();
  const byId = new Map<string, Contract>();
  let sandbox = 0;
  const ordered = events
    .filter((event) => ms(event.occurredAt) < cutoffMs)
    .sort((a, b) => ms(a.occurredAt) - ms(b.occurredAt) || a.eventId.localeCompare(b.eventId));
  for (const event of ordered) {
    const replayKey = `${event.contractId}|${event.kind}|${event.occurredAt}`;
    if (seen.has(event.eventId) || seen.has(replayKey)) continue;
    seen.add(event.eventId);
    seen.add(replayKey);
    if (event.environment === "sandbox") {
      sandbox += 1;
      continue;
    }
    const current = byId.get(event.contractId) ?? emptyContract(event);
    applyEvent(current, event);
    byId.set(event.contractId, current);
  }
  return { contracts: [...byId.values()], sandbox };
}

function statusAt(contract: Contract, asOfMs: number): Status {
  if (contract.billing === "grant") return "excluded";
  if (contract.expiredAt != null && ms(contract.expiredAt) <= asOfMs) return "expired";
  const expires = contract.expiresAt ? ms(contract.expiresAt) : null;
  if (contract.billing === "fixed_term") {
    if (ms(contract.startedAt) <= asOfMs && expires != null && asOfMs < expires) return "fixed_term_active";
    return "expired";
  }
  if (contract.billing === "unknown" || contract.phase === "unknown") {
    // Trial or paying, a term that ended more than a grace period ago is over.
    // Without this one stale contract seen only through its cancellation
    // would keep MRR unavailable forever.
    if (expires != null && asOfMs >= expires + GRACE_MS) return "expired";
    return "unknown";
  }
  if (contract.phase === "trial") {
    return expires != null && asOfMs < expires ? "trial" : "expired";
  }
  if (expires != null && asOfMs < expires) {
    return contract.autoRenew ? "paying" : "cancelled_pending_expiry";
  }
  if (contract.graceUntil && asOfMs < ms(contract.graceUntil)) return "grace";
  return "expired";
}

function isActiveContract(status: Status): boolean {
  return status === "paying" || status === "grace" || status === "cancelled_pending_expiry";
}

function isPaidAccess(status: Status): boolean {
  return isActiveContract(status) || status === "fixed_term_active";
}

function monthsFor(contract: Contract): number | null {
  if (!contract.productId) return null;
  return CATALOG[contract.productId]?.months ?? null;
}

function monthlySplit(amount: string, months: number): { monthly: string; remainder: boolean } | null {
  const left = parseDecimal(amount);
  const right = parseDecimal(String(months));
  if (right.units === BigInt(0)) return null;
  const numerator = left.units * BigInt(10) ** BigInt(right.scale + MONEY_SCALE);
  const denominator = right.units * BigInt(10) ** BigInt(left.scale);
  return {
    monthly: formatDecimal(numerator / denominator, MONEY_SCALE),
    remainder: numerator % denominator !== BigInt(0),
  };
}

function annualized(amount: string, months: number): string | null {
  if (months <= 0 || 12 % months !== 0) return null;
  return multiplyDecimal(amount, String(12 / months), MONEY_SCALE);
}

function priceOf(contract: Contract): Price | null {
  const months = monthsFor(contract);
  if (months == null) return null;
  const charged = contract.chargedAmount && contract.currency ? contract.chargedAmount : null;
  const listed = contract.productId ? CATALOG[contract.productId] : undefined;
  const amount = charged ?? listed?.listPrice ?? null;
  const currency = charged ? contract.currency : listed?.currency;
  if (!amount || !currency) return null;
  const split = monthlySplit(amount, months);
  const annual = annualized(amount, months);
  if (!split || !annual) return null;
  const fromList = charged == null;
  const estimated = fromList || split.remainder;
  return {
    monthly: split.monthly,
    annual,
    currency,
    quality: estimated ? "estimated" : "actual",
    ...(estimated
      ? { reason: fromList ? "list_price_not_charged_amount" : "interval_normalization_remainder" }
      : {}),
    remainder: split.remainder,
  };
}

function accessEnded(contract: Contract, fromMs: number, toMs: number, status: Status): boolean {
  if (status === "grace" || status === "paying" || status === "cancelled_pending_expiry" || status === "trial") {
    return false;
  }
  const end = contract.expiredAt
    ? ms(contract.expiredAt)
    : contract.expiresAt
      ? ms(contract.expiresAt)
      : null;
  return end != null && end >= fromMs && end < toMs;
}

function ratio(numerator: number, denominator: number, fromMs: number, toMs: number): RatioMetric {
  const windowDays = divideDecimals(String(toMs - fromMs), String(DAY_MS), 6);
  if (denominator === 0) {
    return {
      numerator,
      denominator,
      window_ratio: null,
      monthly_normalized_ratio: null,
      window_days: windowDays,
      reason: "zero_denominator",
    };
  }
  const windowRatio = divideDecimals(String(numerator), String(denominator), RATIO_SCALE);
  const scaled = windowRatio ? multiplyDecimal(windowRatio, "30", 8) : null;
  const monthly = scaled && windowDays ? divideDecimals(scaled, windowDays, RATIO_SCALE) : null;
  return {
    numerator,
    denominator,
    window_ratio: windowRatio,
    monthly_normalized_ratio: monthly,
    window_days: windowDays,
  };
}

function mrrFor(
  contracts: Contract[],
  asOfMs: number,
  coverage: MoneyMetric["coverage"],
): { mrr: MoneyMetric; arr: MoneyMetric } {
  const active = contracts.filter((contract) => isActiveContract(statusAt(contract, asOfMs)));
  if (active.length === 0) {
    const zero: MoneyMetric = { amount: "0.0000", currency: "USD", quality: "actual", coverage };
    return { mrr: zero, arr: { ...zero } };
  }
  const priced: Price[] = [];
  for (const contract of active) {
    const price = priceOf(contract);
    if (!price) {
      const missing = moneyUnavailable(coverage === "missing" ? "missing" : "partial", priceOfReason(contract));
      return { mrr: missing, arr: { ...missing } };
    }
    priced.push(price);
  }
  const currencies = new Set(priced.map((price) => price.currency));
  if (currencies.size > 1) {
    const mixed = moneyUnavailable("partial", "mixed_currency_without_fx", "GBP");
    return { mrr: mixed, arr: { ...mixed } };
  }
  const listPrice = priced.some((price) => price.reason === "list_price_not_charged_amount");
  const remainder = priced.some((price) => price.remainder);
  const mrrEstimated = listPrice || remainder;
  return {
    mrr: {
      amount: addDecimals(priced.map((price) => price.monthly), MONEY_SCALE),
      currency: priced[0].currency,
      quality: mrrEstimated ? "estimated" : "actual",
      coverage: mrrEstimated ? "partial" : coverage,
      ...(listPrice
        ? { reason: "list_price_not_charged_amount" }
        : remainder
          ? { reason: "interval_normalization_remainder" }
          : {}),
    },
    arr: {
      amount: addDecimals(priced.map((price) => price.annual), MONEY_SCALE),
      currency: priced[0].currency,
      quality: listPrice ? "estimated" : "actual",
      coverage: listPrice ? "partial" : "complete",
      ...(listPrice ? { reason: "list_price_not_charged_amount" } : {}),
    },
  };
}

function priceOfReason(contract: Contract): string {
  return monthsFor(contract) == null ? "missing_billing_interval" : "missing_recurring_price";
}

function arrFor(mrr: MoneyMetric): MoneyMetric {
  if (mrr.amount == null) return { ...mrr };
  return { ...mrr, amount: multiplyDecimal(mrr.amount, "12", MONEY_SCALE) };
}

function baseWarnings(): string[] {
  return [
    "Trials and fixed-term purchases are excluded from MRR.",
    "Cancellations are not the same as ended access.",
    `Timezone ${TIMEZONE_PROPOSAL} is the C0 proposal. REPORTING_TIMEZONE is not confirmed.`,
    "analytics_subscriptions has no writer in this repository.",
    `FX policy ${FX_POLICY_VERSION}. Source currency is retained.`,
  ];
}

function operationsFor(
  evidence: SubscriptionEvidence,
  window: SubscriptionWindow,
  warnings: string[],
): OperationsDaily {
  const fromMs = ms(window.from);
  const toMs = ms(window.to);
  const measured = evidence.events != null;
  const chargebacksMeasured = evidence.chargebacks != null;
  const buckets: OperationsDaily["buckets"] = londonDays(fromMs, toMs).map((day) => {
    const flows: OperationsDaily["buckets"][number]["flows"] = [];
    const stocks: OperationsDaily["buckets"][number]["stocks"] = [];
    if (measured && evidence.events) {
      const opened = replay(evidence.events, day.end);
      const payingStarts = opened.contracts.filter((contract) => {
        if (contract.billing !== "recurring" || contract.payingStartedAt == null) return false;
        const started = ms(contract.payingStartedAt);
        return started >= day.start && started < day.end;
      });
      const failures = new Set(
        evidence.events
          .filter((event) => event.kind === "BILLING_ISSUE" && event.environment !== "sandbox")
          .filter((event) => {
            const at = ms(event.occurredAt);
            return at >= day.start && at < day.end;
          })
          .map((event) => event.eventId),
      );
      flows.push({ name: "new_contracts", count: payingStarts.length, additive: true });
      flows.push({ name: "renewal_failures", count: failures.size, additive: true });
      const atEnd = opened.contracts.map((contract) => statusAt(contract, day.end));
      stocks.push(
        { name: "paid_access_accounts", count: distinct(opened.contracts, atEnd, isPaidAccess), additive: false, as_of: utc(day.end - 1000) },
        { name: "active_contracts", count: atEnd.filter(isActiveContract).length, additive: false, as_of: utc(day.end - 1000) },
        { name: "active_customers", count: distinct(opened.contracts, atEnd, isActiveContract), additive: false, as_of: utc(day.end - 1000) },
      );
    }
    if (chargebacksMeasured && evidence.chargebacks) {
      const seen = new Set<string>();
      let countBack = 0;
      for (const row of evidence.chargebacks) {
        if (seen.has(row.recordId)) continue;
        const at = ms(row.occurredAt);
        if (at >= day.start && at < day.end) {
          seen.add(row.recordId);
          countBack += 1;
        }
      }
      flows.push({ name: "chargeback_events", count: countBack, additive: true });
    }
    return {
      date: day.date,
      timezone: TIMEZONE_PROPOSAL,
      partial: day.partial,
      flows,
      stocks,
    };
  });
  return {
    schema_version: "1.0.0",
    contract_version: CONTRACT_VERSION,
    project_id: PROJECT_ID,
    environment: "production",
    snapshot_id: window.snapshotId,
    generated_at: window.generatedAt,
    data_as_of: window.dataAsOf,
    period: { from: window.from, to: window.to, timezone: TIMEZONE_PROPOSAL },
    posting: false,
    buckets,
    warnings,
  };
}

function distinct(contracts: Contract[], statuses: Status[], include: (status: Status) => boolean): number {
  const accounts = new Set<string>();
  contracts.forEach((contract, index) => {
    if (include(statuses[index])) accounts.add(contract.accountId);
  });
  return accounts.size;
}

export function summarizeSubscriptions(evidence: SubscriptionEvidence, window: SubscriptionWindow): SubscriptionModel {
  const warnings = baseWarnings();
  const sourceHealth = [
    { source: "analytics_subscriptions", status: "unverified_no_writer" },
    { source: "subscription_events", status: evidence.events == null ? "unavailable" : "supplied" },
    { source: "finance.chargebacks", status: evidence.chargebacks == null ? "unavailable" : "supplied" },
  ];
  if (evidence.chargebacks == null) warnings.push("Chargeback counts were omitted because the finance snapshot was not supplied.");
  if (evidence.eventsTruncated) warnings.push("subscription_events page cap was reached.");

  if (evidence.events == null) {
    warnings.push("Subscription lifecycle events were not supplied.");
    const missing = count(null, "missing_subscription_events");
    const mrr = moneyUnavailable("missing", "missing_subscription_events");
    const operations = operationsFor(evidence, window, warnings);
    return {
      window,
      coverage: "missing",
      activeContracts: missing,
      activeCustomers: missing,
      paidAccessAccounts: missing,
      statuses: { trial: missing, paying: missing, grace: missing, cancelled_pending_expiry: missing },
      mrr,
      arr: arrFor(mrr),
      churn: { contract: blankRatio("missing_subscription_events"), customer: blankRatio("missing_subscription_events") },
      trialConversions: missing,
      operations,
      warnings,
      sourceHealth,
    };
  }

  const asOfMs = ms(window.asOf);
  const fromMs = ms(window.from);
  const toMs = ms(window.to);
  const atAsOf = replay(evidence.events, asOfMs + 1);
  const atFrom = replay(evidence.events, fromMs);
  const atTo = replay(evidence.events, toMs);
  if (atAsOf.sandbox > 0) warnings.push("Sandbox lifecycle events were excluded.");

  const statuses = atAsOf.contracts.map((contract) => statusAt(contract, asOfMs));
  const unknown = statuses.some((status) => status === "unknown");
  const active = atAsOf.contracts.filter((_, index) => isActiveContract(statuses[index]));
  const prices = active.map((contract) => priceOf(contract));
  const missingPrice = prices.some((price) => price == null);
  const normalized = prices.some((price) => price?.remainder);
  const coverage: SubscriptionModel["coverage"] =
    evidence.eventsTruncated || unknown || missingPrice || normalized ? "partial" : "complete";
  if (unknown) warnings.push("A lifecycle event did not distinguish trial from paying. That contract is excluded from MRR.");

  const tally = (status: LiveStatus) => statuses.filter((item) => item === status).length;
  let { mrr, arr } = mrrFor(atAsOf.contracts, asOfMs, coverage);
  if (unknown || evidence.eventsTruncated) {
    const reason = unknown ? "unknown_billing_state" : "subscription_events_page_cap";
    mrr = moneyUnavailable(coverage, reason);
    arr = moneyUnavailable(coverage, reason);
  }
  if (mrr.quality === "unavailable" && mrr.reason === "mixed_currency_without_fx") {
    warnings.push("MRR is unavailable because active contracts use more than one currency and FX is unconfigured.");
  }

  const cohort = atFrom.contracts.filter(
    (contract) => contract.billing === "recurring" && statusAt(contract, fromMs) === "paying",
  );
  const ended = cohort.filter((contract) => {
    const later = atTo.contracts.find((item) => item.contractId === contract.contractId) ?? contract;
    return accessEnded(later, fromMs, toMs, statusAt(later, toMs));
  });
  const cohortAccounts = new Set(cohort.map((contract) => contract.accountId));
  const stillActive = new Set(
    atTo.contracts
      .filter((contract) => isActiveContract(statusAt(contract, toMs)))
      .map((contract) => contract.accountId),
  );
  let customerEnded = 0;
  for (const accountId of cohortAccounts) {
    if (!stillActive.has(accountId)) customerEnded += 1;
  }
  const conversions = atTo.contracts.filter((contract) => {
    if (!contract.wasTrial || contract.payingStartedAt == null) return false;
    const started = ms(contract.payingStartedAt);
    return started >= fromMs && started < toMs;
  }).length;

  return {
    window,
    coverage,
    activeContracts: count(statuses.filter(isActiveContract).length),
    activeCustomers: count(distinct(atAsOf.contracts, statuses, isActiveContract)),
    paidAccessAccounts: count(distinct(atAsOf.contracts, statuses, isPaidAccess)),
    statuses: {
      trial: count(tally("trial")),
      paying: count(tally("paying")),
      grace: count(tally("grace")),
      cancelled_pending_expiry: count(tally("cancelled_pending_expiry")),
    },
    mrr,
    arr,
    churn: {
      contract: ratio(ended.length, cohort.length, fromMs, toMs),
      customer: ratio(customerEnded, cohortAccounts.size, fromMs, toMs),
    },
    trialConversions: count(conversions),
    operations: operationsFor(evidence, window, warnings),
    warnings,
    sourceHealth,
  };
}

export function subscriptionPageView(model: SubscriptionModel) {
  return {
    snapshot_id: model.window.snapshotId,
    generated_at: model.window.generatedAt,
    data_as_of: model.window.dataAsOf,
    as_of: model.window.asOf,
    period: { from: model.window.from, to: model.window.to, timezone: TIMEZONE_PROPOSAL },
    formula_version: SUBSCRIPTION_FORMULA_VERSION,
    fx_policy_version: FX_POLICY_VERSION,
    posting: false,
    coverage: model.coverage,
    active_contracts: model.activeContracts,
    active_customers: model.activeCustomers,
    paid_access_accounts: model.paidAccessAccounts,
    statuses: model.statuses,
    mrr: model.mrr,
    arr: model.arr,
    churn: model.churn,
    trial_conversions: model.trialConversions,
    operations: model.operations,
    warnings: model.warnings,
    source_health: model.sourceHealth,
  };
}

export function toSubscriptionsSummary(model: SubscriptionModel) {
  return {
    schema_version: "1.0.0",
    contract_version: CONTRACT_VERSION,
    project_id: PROJECT_ID,
    environment: "production" as const,
    snapshot_id: model.window.snapshotId,
    generated_at: model.window.generatedAt,
    data_as_of: model.window.dataAsOf,
    period: { from: model.window.from, to: model.window.to, timezone: TIMEZONE_PROPOSAL },
    as_of: model.window.asOf,
    supported: true,
    posting: false as const,
    metrics: {
      active_contracts: model.activeContracts,
      active_customers: model.activeCustomers,
      paid_access_accounts: model.paidAccessAccounts,
      mrr: {
        ...model.mrr,
        drill_through: {
          dataset: "finance.records" as const,
          snapshot_id: model.window.snapshotId,
          filter: {
            project_id: PROJECT_ID,
            from: model.window.from,
            to: model.window.to,
            basis: "purchase" as const,
            record_types: ["sale" as const],
          },
        },
      },
    },
    warnings: model.warnings,
  };
}

export function toOperationsDaily(model: SubscriptionModel): OperationsDaily {
  return model.operations;
}

const STORED_KINDS: Record<string, LifecycleKind> = {
  INITIAL_PURCHASE: "INITIAL_PURCHASE",
  RENEWAL: "RENEWAL",
  CANCELLATION: "CANCELLATION",
  BILLING_ISSUE: "BILLING_ISSUE",
  BILLING_ISSUES: "BILLING_ISSUE",
  EXPIRATION: "EXPIRATION",
  NON_RENEWING_PURCHASE: "NON_RENEWING_PURCHASE",
  PRODUCT_CHANGE: "PRODUCT_CHANGE",
};

function storedInstant(value: string): string | null {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function storedDetail(details: unknown, key: string): string | null {
  if (!details || typeof details !== "object" || !(key in details)) return null;
  const value = (details as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Maps rows already stored by the webhook. Charged amounts stay null unless
 * the row itself carries one. Account ids stay on the event and are dropped
 * by the page view.
 */
export function eventsFromStoredRows(rows: StoredSubscriptionEvent[]): LifecycleEvent[] {
  const events: LifecycleEvent[] = [];
  const typed = new Set<LifecycleEvent>();
  for (const row of rows) {
    const kind = STORED_KINDS[row.event_type];
    const occurredAt = storedInstant(row.created_at);
    if (!kind || !occurredAt) continue;
    const period = (storedDetail(row.details, "period_type") ?? "").toUpperCase();
    const environment = (storedDetail(row.details, "environment") ?? "").toUpperCase() === "SANDBOX"
      ? "sandbox"
      : "production";
    const purchase = kind === "INITIAL_PURCHASE" || kind === "RENEWAL" || kind === "NON_RENEWING_PURCHASE" || kind === "PRODUCT_CHANGE";
    const charged = storedDetail(row.details, "price") ?? storedDetail(row.details, "charged_amount");
    const event: LifecycleEvent = {
      eventId: storedDetail(row.details, "rc_event_id") ?? row.id,
      occurredAt,
      contractId: row.original_transaction_id || row.id,
      accountId: row.account_id,
      kind,
      // Play product ids arrive as "<subscription>:<base plan>".
      productId: row.product_id ? row.product_id.split(":")[0] : null,
      store: row.platform,
      environment,
      expiresAt: row.expires_at && storedInstant(row.expires_at) ? storedInstant(row.expires_at) : row.expires_at,
      chargedAmount: charged && /^(0|[1-9][0-9]*)(\.[0-9]{1,18})?$/.test(charged) ? charged : null,
      currency: storedDetail(row.details, "currency"),
      phase: period === "TRIAL" ? "trial" : purchase ? "paying" : null,
      billingModel: kind === "NON_RENEWING_PURCHASE" ? "fixed_term" : null,
    };
    if (period) typed.add(event);
    events.push(event);
  }
  return inferStoredPeriods(dropShadowContracts(events), typed);
}

// Before the app could read Apple's original transaction id it claimed under
// "<product>_<purchase date>" (SubscriptionSyncService.syntheticTransactionId).
const SYNTHETIC_CONTRACT = /^vpn_premium_[a-z0-9_]+_\d{4}-\d{2}-\d{2}T/;

/**
 * A synthetic contract shadows the store's real one for the same account, so
 * keeping both counts one subscriber twice and reads the quiet copy as churn.
 * It is kept only when the account has no real contract to stand in for it.
 */
function dropShadowContracts(events: LifecycleEvent[]): LifecycleEvent[] {
  const withReal = new Set(
    events.filter((event) => !SYNTHETIC_CONTRACT.test(event.contractId)).map((event) => event.accountId),
  );
  return events.filter((event) => !SYNTHETIC_CONTRACT.test(event.contractId) || !withReal.has(event.accountId));
}

// No store period runs shorter than a month; the App Store and Play trials are 3 days.
const TRIAL_TERM_MAX_MS = 7 * DAY_MS;
// A client re-claim recomputes the expiry and can land seconds past the known one.
const RECLAIM_TOLERANCE_MS = DAY_MS;

/**
 * Live rows mostly carry no period_type. claim_subscription writes
 * INITIAL_PURCHASE and RENEWAL with empty details, and the app re-claims the
 * same term as a RENEWAL with an unchanged expiry. Read literally, every
 * trial is paying and every re-claim is a renewal.
 *
 * For untyped purchases the term decides: a purchase whose access runs seven
 * days or less is a trial. A RENEWAL that moves the expiry less than a day
 * past the term already known is a re-claim and is dropped. Rows that state their
 * period_type are kept as stated and still advance the known expiry.
 */
function inferStoredPeriods(events: LifecycleEvent[], typed: Set<LifecycleEvent>): LifecycleEvent[] {
  const dropped = new Set<LifecycleEvent>();
  const byContract = new Map<string, LifecycleEvent[]>();
  for (const event of events) {
    const list = byContract.get(event.contractId) ?? [];
    list.push(event);
    byContract.set(event.contractId, list);
  }
  for (const list of byContract.values()) {
    list.sort((a, b) => ms(a.occurredAt) - ms(b.occurredAt) || a.eventId.localeCompare(b.eventId));
    let knownExpiry: number | null = null;
    for (const event of list) {
      const expires = event.expiresAt ? Date.parse(event.expiresAt) : NaN;
      if (Number.isNaN(expires)) continue;
      const purchase = event.kind === "INITIAL_PURCHASE" || event.kind === "RENEWAL";
      if (purchase && !typed.has(event)) {
        if (event.kind === "RENEWAL" && knownExpiry != null && expires <= knownExpiry + RECLAIM_TOLERANCE_MS) {
          dropped.add(event);
          continue;
        }
        const start = event.kind === "RENEWAL" && knownExpiry != null ? knownExpiry : ms(event.occurredAt);
        event.phase = expires - start <= TRIAL_TERM_MAX_MS ? "trial" : "paying";
      }
      if (purchase || event.kind === "PRODUCT_CHANGE") {
        knownExpiry = knownExpiry == null ? expires : Math.max(knownExpiry, expires);
      }
    }
  }
  return events.filter((event) => !dropped.has(event));
}

export function reportingFromStoredEvents(
  rows: StoredSubscriptionEvent[] | null,
  window: SubscriptionWindow,
  truncated: boolean,
): ReturnType<typeof subscriptionPageView> {
  return subscriptionPageView(summarizeSubscriptions({
    events: rows == null ? null : eventsFromStoredRows(rows),
    chargebacks: null,
    eventsTruncated: truncated,
  }, window));
}
