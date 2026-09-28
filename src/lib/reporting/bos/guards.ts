import { TIMEZONE_PROPOSAL } from "../constants";

const INSTANT = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/;
export const MAX_RANGE_DAYS = 366;
export const MAX_PAGE_SIZE = 500;
const DAY_MS = 86_400_000;

export const SUPPORTED_BASES = ["purchase", "settled_cash"] as const;
export type SupportedBasis = (typeof SUPPORTED_BASES)[number];

export class GuardError extends Error {
  constructor(
    readonly status: 400 | 403 | 410 | 422,
    readonly code: string,
    readonly retryable: boolean,
    message: string,
    readonly resync?: { drop_cursor: true; endpoint: string; reuse_original_from_to: boolean },
  ) {
    super(message);
  }
}

export interface IntervalQuery {
  from: string;
  to: string;
  timezone: typeof TIMEZONE_PROPOSAL;
  basis: SupportedBasis;
  currency: "GBP";
  source: string | null;
  channel: string | null;
  snapshotId: string | null;
}

export function readInstant(value: string | null, name: string, required: boolean): string | null {
  if (!value) {
    if (required) throw new GuardError(400, "missing_required_parameter", false, `Missing ${name}.`);
    return null;
  }
  if (!INSTANT.test(value) || Number.isNaN(Date.parse(value))) {
    throw new GuardError(400, "malformed_parameter", false, `${name} must be a UTC instant.`);
  }
  return value;
}

export function assertRange(from: string, to: string): void {
  if (from >= to) throw new GuardError(422, "invalid_interval", false, "from must be before to.");
  const span = Date.parse(to) - Date.parse(from);
  if (span > MAX_RANGE_DAYS * DAY_MS) {
    throw new GuardError(422, "interval_too_large", false, "The interval exceeds 366 days.");
  }
}

export function readBasis(value: string | null): SupportedBasis {
  if (!value) return "purchase";
  if (value === "purchase" || value === "settled_cash") return value;
  if (value === "earned_management" || value === "sms_legacy") {
    throw new GuardError(422, "unsupported_basis", false, `${value} is not supported.`);
  }
  throw new GuardError(400, "malformed_parameter", false, "basis is not a known value.");
}

export function readTimezone(value: string | null): typeof TIMEZONE_PROPOSAL {
  if (!value || value === TIMEZONE_PROPOSAL) return TIMEZONE_PROPOSAL;
  throw new GuardError(422, "unknown_timezone", false, "Only Europe/London is available.");
}

export function readSource(value: string | null): string | null {
  if (!value) return null;
  if (!/^[a-z0-9_-]{2,80}$/.test(value)) {
    throw new GuardError(400, "malformed_parameter", false, "source is not a known importer.");
  }
  const known = new Set(["revolut", "oxapay", "revenuecat", "invoice", "manual", "statement_import", "vpn_invoices"]);
  if (!known.has(value)) {
    throw new GuardError(400, "malformed_parameter", false, "source is not a known importer.");
  }
  return value;
}

export function readCurrency(value: string | null): "GBP" {
  if (!value || value === "GBP") return "GBP";
  throw new GuardError(400, "malformed_parameter", false, "reporting currency must be GBP.");
}

export function readPageLimit(value: string | null): number {
  if (!value) return 100;
  if (!/^[1-9][0-9]*$/.test(value)) {
    throw new GuardError(400, "malformed_parameter", false, "limit must be a positive integer.");
  }
  const limit = Number(value);
  if (limit > MAX_PAGE_SIZE) {
    throw new GuardError(422, "page_limit_too_large", false, "limit exceeds 500.");
  }
  return limit;
}

export function readInterval(params: URLSearchParams): IntervalQuery {
  const from = readInstant(params.get("from"), "from", true);
  const to = readInstant(params.get("to"), "to", true);
  if (!from || !to) throw new GuardError(400, "missing_required_parameter", false, "Missing from or to.");
  assertRange(from, to);
  return {
    from,
    to,
    timezone: readTimezone(params.get("timezone")),
    basis: readBasis(params.get("basis")),
    currency: readCurrency(params.get("currency")),
    source: readSource(params.get("source")),
    channel: params.get("channel"),
    snapshotId: params.get("snapshot_id"),
  };
}

export function assertEmptyGetBody(body: Uint8Array): void {
  if (body.byteLength > 0) {
    throw new GuardError(400, "unexpected_body", false, "GET requests must have an empty body.");
  }
}
