import { contentHash, sha256Hex, canonicalize } from "./canonical";
import {
  CONTRACT_VERSION,
  FIAT_EXPONENTS,
  FORMULA_VERSION,
  FX_POLICY_VERSION,
  PROJECT_ID,
} from "./constants";
import { formatDecimal, multiplyDecimal, parseDecimal } from "./decimal";
import type {
  ApplyResult,
  ComponentValue,
  FinanceRecord,
  FxEvidence,
  MoneyValue,
  Observation,
  QuarantineRow,
  SourceGbpValuation,
  StoreView,
  StoredFx,
  TransportRow,
  EventKind,
} from "./types";

export interface Effects {
  transport: TransportRow;
  quarantine: QuarantineRow | null;
  records: FinanceRecord[];
  fx: StoredFx[];
  result: ApplyResult;
}

export type Planned =
  | { status: "duplicate"; result: ApplyResult }
  | { status: "conflict"; result: ApplyResult }
  | { status: "ok"; effects: Effects };

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

export function formatUtcInstant(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) throw new Error("invalid_time");
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function safeId(value: string, fallback: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9._:-]/g, "_").slice(0, 120);
  const prefixed = /^[A-Za-z0-9]/.test(cleaned) ? cleaned : `id_${cleaned}`;
  return ID_PATTERN.test(prefixed) ? prefixed : fallback;
}

export function observationHash(obs: Observation): string {
  return sha256Hex(canonicalize(stableObservation(obs)));
}

function stableObservation(obs: Observation): Record<string, unknown> {
  const stable: Record<string, unknown> = {
    aliasIds: [...obs.aliasIds].sort(),
    amount: obs.amount,
    amountReason: obs.amountReason,
    attribution: obs.attribution,
    channel: obs.channel,
    crypto: obs.crypto,
    currency: obs.currency,
    economicTransactionId: obs.economicTransactionId,
    environment: obs.environment,
    eventKind: obs.eventKind,
    externalObjectId: obs.externalObjectId,
    fee: obs.fee,
    fx: obs.fx,
    occurredAt: obs.occurredAt,
    parentExternalObjectId: obs.parentExternalObjectId,
    processor: obs.processor,
    productId: obs.productId,
    sourceAccountId: obs.sourceAccountId,
    sourceSystem: obs.sourceSystem,
    store: obs.store,
    feeComponentId: obs.feeComponentId,
    postingRole: obs.postingRole,
    targetRecordId: obs.targetRecordId,
    tax: obs.tax,
    transportId: obs.transportId,
  };
  if (obs.fiatInvoice) stable.fiatInvoice = obs.fiatInvoice;
  return stable;
}

export function saleRecordId(source: string, externalObjectId: string): string {
  return safeId(`sale.${source}.${externalObjectId}`, "sale.unknown");
}

export function childRecordId(kind: string, source: string, externalObjectId: string): string {
  return safeId(`${kind}.${source}.${externalObjectId}`, `${kind}.unknown`);
}

function latest(records: FinanceRecord[], recordId: string): FinanceRecord | null {
  return records
    .filter((record) => record.record_id === recordId)
    .sort((a, b) => a.revision - b.revision)
    .at(-1) ?? null;
}

function money(obs: Observation): MoneyValue {
  if (obs.crypto) {
    parseDecimal(obs.crypto.amount);
    return {
      amount: obs.crypto.amount,
      asset: obs.crypto.asset,
      network: obs.crypto.network,
      quality: "actual",
    };
  }
  if (obs.amount && obs.currency) {
    if (FIAT_EXPONENTS[obs.currency] === undefined) {
      throw new Error(`unsupported_currency:${obs.currency}`);
    }
    const parsed = parseDecimal(obs.amount);
    if (parsed.scale > FIAT_EXPONENTS[obs.currency]) {
      throw new Error("excess_scale");
    }
    return {
      amount: formatDecimal(parsed.units, FIAT_EXPONENTS[obs.currency]),
      currency: obs.currency,
      quality: "actual",
    };
  }
  return {
    amount: null,
    currency: obs.currency ?? "USD",
    quality: "unavailable",
    reason: obs.amountReason ?? "missing_provider_amount",
  };
}

function gbpValuation(obs: Observation, original: MoneyValue): SourceGbpValuation | undefined {
  if (!original.currency) return undefined;
  if (obs.fx && original.amount) {
    const amount = multiplyDecimal(original.amount, obs.fx.rate, 2);
    return {
      amount,
      currency: "GBP",
      quality: "actual",
      rate: obs.fx.rate,
      rate_source: obs.fx.rateSource,
      effective_at: obs.fx.effectiveAt,
      policy_version: FX_POLICY_VERSION,
      source_amount: original.amount,
      source_currency: original.currency,
    };
  }
  return {
    amount: null,
    currency: "GBP",
    quality: "unavailable",
    reason: "missing_fx_evidence",
    rate: null,
    rate_source: null,
    effective_at: null,
    policy_version: FX_POLICY_VERSION,
    source_amount: original.amount,
    source_currency: original.currency,
  };
}

function acquisition(obs: Observation): FinanceRecord["acquisition"] {
  const source = obs.attribution?.utmSource || obs.attribution?.origin || "unknown";
  return {
    source,
    medium: obs.attribution?.utmMedium ?? null,
    campaign: obs.attribution?.utmCampaign ?? null,
    model: null,
    window_days: null,
    consent: obs.attribution?.consent ?? "unknown",
  };
}

function componentsFor(recordId: string, obs: Observation, original: MoneyValue): ComponentValue[] {
  const components: ComponentValue[] = [];
  if (obs.tax && original.currency) {
    components.push({
      component_id: safeId(`tax.${recordId}`, "tax.unknown"),
      component_type: obs.eventKind === "refund" || obs.eventKind === "chargeback" ? "tax_reversal" : "sales_tax",
      amount: {
        amount: formatDecimal(parseDecimal(obs.tax.amount).units, FIAT_EXPONENTS[original.currency] ?? 2),
        currency: original.currency,
        quality: "actual",
      },
      posting_role: "primary",
      vat_recoverable: null,
      vat_treatment_reason: "vat_status_unconfirmed",
    });
  }
  if (obs.fee && original.currency) {
    const type = obs.eventKind === "refund" || obs.eventKind === "chargeback" ? "fee_reversal" : obs.fee.componentType;
    components.push({
      component_id: safeId(`fee.${recordId}`, "fee.unknown"),
      component_type: type,
      amount: {
        amount: formatDecimal(parseDecimal(obs.fee.amount).units, FIAT_EXPONENTS[original.currency] ?? 2),
        currency: original.currency,
        quality: "actual",
      },
      posting_role: "primary",
      vat_recoverable: null,
      vat_treatment_reason: "vat_status_unconfirmed",
    });
  }
  return components;
}

function direction(kind: Observation["eventKind"]): "inflow" | "outflow" {
  if (kind === "refund" || kind === "chargeback" || kind === "fee") return "outflow";
  return "inflow";
}

function seal(record: Omit<FinanceRecord, "content_hash">): FinanceRecord {
  const hashed = contentHash(record as unknown as Record<string, unknown>);
  return { ...record, content_hash: hashed };
}

function aliases(obs: Observation, previous: string[] | undefined): string[] {
  return [...new Set([...(previous ?? []), ...obs.aliasIds, obs.transportId])].sort();
}

function materialKey(record: FinanceRecord): string {
  return canonicalize({
    alias_ids: record.alias_ids ?? [],
    components: record.components ?? [],
    original_amount: record.original_amount,
    parent_record_id: record.parent_record_id ?? null,
    status: record.status,
    tax_inclusion: record.tax_inclusion ?? null,
  });
}

function buildRecord(
  obs: Observation,
  now: string,
  sequence: string,
  revision: number,
  recordId: string,
  recordType: FinanceRecord["record_type"],
  previous: FinanceRecord | null,
): FinanceRecord {
  const original = money(obs.eventKind === "void" && previous ? amountObservation(previous) : obs);
  const provider = obs.processor ?? obs.sourceSystem;
  const linked = obs.parentExternalObjectId
    ? recordType === "refund_reversal"
      ? childRecordId("refund", provider, obs.parentExternalObjectId)
      : recordType === "refund" || recordType === "chargeback"
        ? saleRecordId(provider, obs.parentExternalObjectId)
        : undefined
    : undefined;
  const parent = linked ?? previous?.parent_record_id;
  const draft: Omit<FinanceRecord, "content_hash"> = {
    record_id: recordId,
    revision,
    change_sequence: sequence,
    record_type: recordType,
    project_id: PROJECT_ID,
    source_system: previous?.source_system ?? obs.sourceSystem,
    source_account_id: obs.sourceAccountId,
    environment: "production",
    external_object_id: obs.externalObjectId,
    economic_transaction_id: obs.economicTransactionId,
    alias_ids: aliases(obs, previous?.alias_ids),
    occurred_at: previous?.occurred_at ?? obs.occurredAt,
    updated_at: now,
    status: obs.eventKind === "void" ? "void" : "posted",
    original_amount: original,
    quality: original.quality === "actual" ? "actual" : "unavailable",
    coverage: original.quality === "actual" && obs.tax && obs.fee ? "complete" : "partial",
    formula_version: FORMULA_VERSION,
    economic_direction: recordType === "refund" || recordType === "chargeback" || recordType === "fee" ? "outflow" : direction(obs.eventKind),
    counts_as_new_revenue: recordType === "sale",
    acquisition: previous?.acquisition ?? acquisition(obs),
    source_as_of: now,
    retrieved_at: now,
  };
  if (recordType === "refund" || recordType === "chargeback") {
    draft.counts_as_gross_refunded_principal = true;
    draft.parent_record_id = parent ?? saleRecordId(obs.sourceSystem, obs.parentExternalObjectId ?? obs.externalObjectId);
  }
  if (recordType === "refund_reversal") {
    draft.counts_as_gross_refunded_principal = false;
    draft.parent_record_id = obs.targetRecordId ?? parent ?? childRecordId("refund", obs.sourceSystem, obs.parentExternalObjectId ?? "");
  }
  if (revision > 1) draft.supersedes_revision = revision - 1;
  const comps = obs.eventKind === "void"
    ? previous?.components ?? []
    : obs.eventKind === "fee"
      ? []
      : componentsFor(recordId, obs, original);
  if (comps.length > 0) draft.components = comps;
  const valuation = gbpValuation(obs, original);
  if (valuation) draft.source_gbp_valuation = valuation;
  if (obs.productId) draft.product_id = safeId(obs.productId, "product");
  if (obs.channel) draft.channel = obs.channel;
  if (obs.store) draft.store = obs.store;
  if (obs.processor) draft.processor = obs.processor;
  draft.tax_inclusion = obs.tax?.inclusion ?? previous?.tax_inclusion ?? "unknown";
  if (obs.fiatInvoice?.amount && obs.fiatInvoice.currency) {
    const fiatCurrency = obs.fiatInvoice.currency;
    if (FIAT_EXPONENTS[fiatCurrency] === undefined) {
      throw new Error(`unsupported_currency:${fiatCurrency}`);
    }
    const fiat = parseDecimal(obs.fiatInvoice.amount);
    if (fiat.scale > FIAT_EXPONENTS[fiatCurrency]) throw new Error("excess_scale");
    draft.fiat_invoice = {
      amount: formatDecimal(fiat.units, FIAT_EXPONENTS[fiatCurrency]),
      currency: fiatCurrency,
      quality: "actual",
    };
  } else if (previous?.fiat_invoice) {
    draft.fiat_invoice = previous.fiat_invoice;
  }
  if (recordType === "fee") {
    draft.component_id = safeId(obs.feeComponentId ?? `fee.${recordId}`, "fee.unknown");
    draft.posting_role = obs.postingRole ?? "primary";
    draft.counts_as_new_revenue = false;
  }
  return seal(draft);
}

function amountObservation(record: FinanceRecord): Observation {
  const amount = record.original_amount;
  return {
    sourceSystem: "invoice",
    transportId: "void",
    environment: "production",
    externalObjectId: record.external_object_id,
    economicTransactionId: record.economic_transaction_id,
    eventKind: "void",
    occurredAt: record.occurred_at,
    sourceAccountId: record.source_account_id,
    amount: amount.amount,
    currency: amount.currency ?? null,
    crypto: amount.asset && amount.network && amount.amount
      ? { asset: amount.asset, network: amount.network, amount: amount.amount }
      : null,
    tax: null,
    fee: null,
    parentExternalObjectId: null,
    targetRecordId: record.record_id,
    aliasIds: [],
    attribution: null,
    productId: null,
    processor: null,
    store: null,
    channel: null,
    fx: null,
    amountReason: amount.reason ?? null,
    postingRole: null,
    feeComponentId: null,
  };
}

function transport(obs: Observation, hash: string): TransportRow {
  return {
    sourceSystem: obs.sourceSystem,
    transportId: obs.transportId,
    payloadHash: hash,
    environment: obs.environment,
    externalObjectId: obs.externalObjectId,
    economicTransactionId: obs.economicTransactionId,
    body: obs,
  };
}

function fxRow(obs: Observation): StoredFx {
  return {
    economicTransactionId: obs.economicTransactionId,
    policyVersion: FX_POLICY_VERSION,
    rate: obs.fx?.rate ?? null,
    rateSource: obs.fx?.rateSource ?? null,
    effectiveAt: obs.fx?.effectiveAt ?? null,
    sourceAmount: obs.amount,
    sourceCurrency: obs.currency,
    reason: obs.fx ? "source_fx_evidence" : "missing_fx_evidence",
  };
}

function recordTypeFor(kind: EventKind): FinanceRecord["record_type"] | null {
  if (kind === "sale" || kind === "correction") return "sale";
  if (kind === "void") return null;
  if (kind === "refund" || kind === "refund_reversal" || kind === "chargeback" || kind === "fee") return kind;
  return null;
}

export function planObservation(
  view: StoreView,
  obs: Observation,
  now: string,
  allocate: () => string,
): Planned {
  const hash = observationHash(obs);
  const base: ApplyResult = {
    status: "ok",
    economicTransactionId: obs.economicTransactionId,
  };
  if (view.transportHash && view.transportHash === hash) {
    return { status: "duplicate", result: { ...base, status: "duplicate" } };
  }
  if (view.transportHash && view.transportHash !== hash) {
    return { status: "conflict", result: { ...base, status: "conflict" } };
  }

  const knownProduction = view.records.some(
    (record) => record.environment === "production" && record.record_type === "sale",
  );
  if (obs.environment === "unknown" && !knownProduction) {
    return {
      status: "ok",
      effects: {
        transport: transport(obs, hash),
        quarantine: {
          sourceSystem: obs.sourceSystem,
          transportId: obs.transportId,
          payloadHash: hash,
          reason: "ambiguous_environment",
          environment: "unknown",
          body: obs,
        },
        records: [],
        fx: [],
        result: { ...base, status: "quarantined", reason: "ambiguous_environment" },
      },
    };
  }
  if (obs.environment === "unknown" && knownProduction) {
    obs = { ...obs, environment: "production" };
  }

  if (obs.environment === "sandbox" || obs.eventKind === "entitlement_only") {
    return {
      status: "ok",
      effects: {
        transport: transport(obs, hash),
        quarantine: null,
        records: [],
        fx: [],
        result: {
          ...base,
          status: "excluded",
          reason: obs.environment === "sandbox" ? "sandbox_excluded" : "entitlement_only",
        },
      },
    };
  }

  const kindType = recordTypeFor(obs.eventKind);
  const provider = obs.processor ?? obs.sourceSystem;
  const recordId = obs.eventKind === "void" || obs.eventKind === "correction"
    ? obs.targetRecordId ?? saleRecordId(provider, obs.parentExternalObjectId ?? obs.externalObjectId)
    : obs.eventKind === "sale"
      ? saleRecordId(provider, obs.externalObjectId)
      : childRecordId(obs.eventKind, provider, obs.externalObjectId);
  const resolvedPrevious = latest(view.records, recordId);
  const resolvedId = recordId;
  const nextType = obs.eventKind === "void" || obs.eventKind === "correction"
    ? resolvedPrevious?.record_type ?? "sale"
    : kindType ?? "sale";
  const next = buildRecord(
    obs,
    now,
    allocate(),
    (resolvedPrevious?.revision ?? 0) + 1,
    resolvedId,
    nextType,
    resolvedPrevious,
  );

  if (resolvedPrevious && materialKey(resolvedPrevious) === materialKey(next)) {
    return {
      status: "ok",
      effects: {
        transport: transport(obs, hash),
        quarantine: null,
        records: [],
        fx: [fxRow(obs)],
        result: { ...base, status: "duplicate", recordId: resolvedId },
      },
    };
  }

  return {
    status: "ok",
    effects: {
      transport: transport(obs, hash),
      quarantine: null,
      records: [next],
      fx: [fxRow(obs)],
      result: { ...base, status: "ok", recordId: resolvedId },
    },
  };
}

export function contractMarker(): string {
  return CONTRACT_VERSION;
}
