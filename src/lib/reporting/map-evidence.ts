import { FIAT_EXPONENTS, fiatExponent } from "./constants";
import { formatDecimal, parseDecimal } from "./decimal";
import { formatUtcInstant, safeId, saleRecordId } from "./plan";
import type { AttributionEvidence, Observation, SourceSystem } from "./types";

export interface InvoiceRow {
  id: string;
  plan: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  provider: string | null;
  provider_payment_id: string | null;
  created_at: string;
  attribution: Record<string, unknown> | null;
  environment?: "production" | "sandbox" | null;
}

export function minorUnitsToMajor(amount: number, currency: string): string | null {
  if (!Number.isInteger(amount) || amount <= 0) return null;
  const scale = fiatExponent(currency);
  return formatDecimal(BigInt(amount), scale);
}

export function majorNumberToDecimal(value: number, currency: string): string | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  const scale = fiatExponent(currency);
  const minor = Math.round(value * 10 ** scale);
  if (minor <= 0) return null;
  return formatDecimal(BigInt(minor), scale);
}

export function revolutReportingEnvironment(
  configured = process.env.REVOLUT_ENVIRONMENT,
): "production" | "sandbox" {
  if (configured === "production" || configured === "prod") return "production";
  return "sandbox";
}

export function oxapayReportingEnvironment(
  configured = process.env.OXAPAY_SANDBOX,
): "production" | "sandbox" {
  return configured === "true" ? "sandbox" : "production";
}

/**
 * vpn_invoices has no environment column. A paid invoice was settled by the
 * provider account this deployment is configured for, which is the same
 * signal the live webhooks use. Without it every pre-webhook invoice would be
 * quarantined as ambiguous and history could never be imported.
 */
export function invoiceEnvironment(provider: string | null): "production" | "sandbox" | null {
  if (provider === "revolut") return revolutReportingEnvironment();
  if (provider === "oxapay") return oxapayReportingEnvironment();
  return null;
}

export function sourceAccountId(provider: string, configured?: string | null): string {
  if (configured && /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(configured)) return configured;
  if (provider === "revolut") return "revolut.unspecified";
  if (provider === "oxapay") return "oxapay.unspecified";
  return "revenuecat.unspecified";
}

function attributionFrom(raw: Record<string, unknown> | null | undefined): AttributionEvidence | null {
  if (!raw) return null;
  const text = (key: string) => (typeof raw[key] === "string" ? raw[key] as string : null);
  const consent = raw.consent_analytics === true || raw.consent_marketing === true
    ? "granted"
    : raw.consent_analytics === false && raw.consent_marketing === false
      ? "denied"
      : "unknown";
  return {
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    origin: text("source"),
    consent,
  };
}

function base(partial: Partial<Observation> & Pick<Observation, "sourceSystem" | "transportId" | "externalObjectId" | "eventKind">): Observation {
  const provider = partial.processor ?? partial.sourceSystem;
  const external = partial.externalObjectId;
  return {
    environment: "production",
    economicTransactionId: partial.economicTransactionId ?? `econ.${provider}.${safeId(external, "object")}`,
    occurredAt: partial.occurredAt ?? "2026-09-28T12:00:00Z",
    sourceAccountId: partial.sourceAccountId ?? sourceAccountId(provider),
    amount: partial.amount ?? null,
    currency: partial.currency ?? null,
    crypto: partial.crypto ?? null,
    tax: partial.tax ?? null,
    fee: partial.fee ?? null,
    parentExternalObjectId: partial.parentExternalObjectId ?? null,
    targetRecordId: partial.targetRecordId ?? null,
    aliasIds: partial.aliasIds ?? [],
    attribution: partial.attribution ?? null,
    productId: partial.productId ?? null,
    processor: partial.processor ?? provider,
    store: partial.store ?? provider,
    channel: partial.channel ?? "web",
    fx: partial.fx ?? null,
    amountReason: partial.amountReason ?? null,
    postingRole: partial.postingRole ?? null,
    feeComponentId: partial.feeComponentId ?? null,
    ...partial,
  };
}

export function observationFromInvoice(row: InvoiceRow): Observation | null {
  const provider = row.provider === "revolut" || row.provider === "oxapay" ? row.provider : null;
  if (!provider || !row.provider_payment_id || !row.id) return null;
  if (row.status !== "paid") return null;
  const stated = (row.currency || "USD").toUpperCase();
  // OxaPay once priced an invoice in USDT. A non-fiat code has no fiat
  // exponent (throwing would stall the whole import on that row), so it is
  // carried as a crypto amount. The invoice never recorded the chain.
  const fiat = FIAT_EXPONENTS[stated] !== undefined;
  const currency = fiat ? stated : null;
  const amount = row.amount == null || !fiat ? null : minorUnitsToMajor(row.amount, stated);
  const crypto = !fiat && row.amount != null && Number.isInteger(row.amount) && row.amount > 0
    ? { asset: stated, network: "unspecified", amount: formatDecimal(BigInt(row.amount), 2) }
    : null;
  const environment = row.environment ?? "unknown";
  return base({
    sourceSystem: provider,
    transportId: `invoice.${row.id}`,
    environment,
    externalObjectId: row.provider_payment_id,
    eventKind: "sale",
    occurredAt: formatUtcInstant(row.created_at),
    amount,
    currency,
    crypto,
    amountReason: amount || crypto ? null : "stored_zero_not_trusted",
    aliasIds: [`invoice.${row.id}`],
    attribution: attributionFrom(row.attribution),
    processor: provider,
    store: provider,
    productId: row.plan?.split(":")[0] ?? null,
  });
}

export function observationFromRevolut(input: {
  orderId: string;
  amountMinor: number | null;
  currency: string | null;
  occurredAt: string;
  environment: "production" | "sandbox";
  attribution?: Record<string, unknown> | null;
  planId?: string | null;
  sourceAccountId?: string | null;
}): Observation {
  const currency = (input.currency || "USD").toUpperCase();
  const amount = input.amountMinor == null ? null : minorUnitsToMajor(input.amountMinor, currency);
  return base({
    sourceSystem: "revolut",
    transportId: `ORDER_COMPLETED.${input.orderId}`,
    environment: input.environment,
    externalObjectId: input.orderId,
    eventKind: "sale",
    occurredAt: formatUtcInstant(input.occurredAt),
    amount,
    currency,
    amountReason: amount ? null : "missing_provider_amount",
    aliasIds: [`revolut.${input.orderId}`],
    attribution: attributionFrom(input.attribution),
    processor: "revolut",
    store: "revolut",
    productId: input.planId ?? null,
    sourceAccountId: sourceAccountId("revolut", input.sourceAccountId),
  });
}

export function observationFromOxapay(input: {
  orderId: string;
  trackId: string;
  amountMajor: number | null;
  currency: string | null;
  occurredAt: string;
  environment: "production" | "sandbox";
  crypto?: { asset: string; network: string; amount: string } | null;
  attribution?: Record<string, unknown> | null;
  planId?: string | null;
  channel?: string | null;
}): Observation {
  const currency = (input.currency || "USD").toUpperCase();
  const amount = input.amountMajor == null ? null : majorNumberToDecimal(input.amountMajor, currency);
  return base({
    sourceSystem: "oxapay",
    transportId: `paid.${input.trackId}`,
    environment: input.environment,
    externalObjectId: input.orderId,
    eventKind: "sale",
    occurredAt: formatUtcInstant(input.occurredAt),
    amount: input.crypto ? null : amount,
    currency: input.crypto ? null : currency,
    crypto: input.crypto ?? null,
    fiatInvoice: input.crypto && amount ? { amount, currency } : null,
    amountReason: input.crypto || amount ? null : "missing_provider_amount",
    aliasIds: [`oxapay.${input.orderId}`, `track.${input.trackId}`],
    attribution: attributionFrom(input.attribution),
    processor: "oxapay",
    store: "oxapay",
    channel: input.channel ?? "web",
    productId: input.planId ?? null,
  });
}

export function observationFromRevenueCat(input: {
  eventId: string;
  eventType: string;
  environment: "production" | "sandbox" | "unknown";
  occurredAt: string;
}): Observation {
  return base({
    sourceSystem: "revenuecat",
    transportId: `rc.${input.eventId}`,
    environment: input.environment,
    externalObjectId: input.eventId,
    eventKind: "entitlement_only",
    occurredAt: formatUtcInstant(input.occurredAt),
    processor: "revenuecat",
    store: "app_store",
    channel: "app",
    amountReason: "revenuecat_access_grant_has_no_money",
    aliasIds: [`rc.${input.eventType}.${input.eventId}`],
  });
}

export function adjustmentObservation(input: {
  provider: "revolut" | "oxapay";
  eventKind: "refund" | "refund_reversal" | "chargeback" | "void" | "correction" | "fee";
  externalObjectId: string;
  saleExternalObjectId: string;
  refundExternalObjectId?: string;
  amount: string | null;
  currency: string | null;
  occurredAt: string;
  transportId: string;
  tax?: Observation["tax"];
  fee?: Observation["fee"];
  crypto?: Observation["crypto"];
}): Observation {
  return base({
    sourceSystem: input.provider,
    transportId: input.transportId,
    environment: "production",
    externalObjectId: input.externalObjectId,
    economicTransactionId: `econ.${input.provider}.${safeId(input.saleExternalObjectId, "sale")}`,
    eventKind: input.eventKind,
    occurredAt: formatUtcInstant(input.occurredAt),
    amount: input.amount,
    currency: input.currency,
    crypto: input.crypto ?? null,
    tax: input.tax ?? null,
    fee: input.fee ?? null,
    parentExternalObjectId: input.eventKind === "refund_reversal"
      ? input.refundExternalObjectId ?? input.externalObjectId
      : input.saleExternalObjectId,
    targetRecordId: input.eventKind === "void" || input.eventKind === "correction"
      ? saleRecordId(input.provider, input.saleExternalObjectId)
      : null,
    processor: input.provider,
    store: input.provider,
  });
}

export function assertDecimal(value: string): void {
  parseDecimal(value);
}

export type ProviderName = Extract<SourceSystem, "revolut" | "oxapay">;
