/**
 * Formula identifier implemented by this service.
 * DOPPLER_FORMULA_PIN in the C0 gates is still unconfirmed, so this name is
 * the code version, not an owner-signed pin.
 */
export const FORMULA_VERSION = "doppler-purchase-native-v1";
export const CONTRACT_VERSION = "business-os.contract.v1";
export const FX_POLICY_VERSION = "gbp-unconfigured";
export const PROJECT_ID = "doppler";
export const SERVICE_SCHEMA = "doppler-reporting-service/v1";

/** Proposed in C0. REPORTING_TIMEZONE is not confirmed. */
export const TIMEZONE_PROPOSAL = "Europe/London";

export const IMPORT_SOURCE = "vpn_invoices";
export const IMPORT_OVERLAP_MS = 15 * 60 * 1000;
export const IMPORT_BATCH = 100;
export const IMPORT_MAX_RETRIES = 5;
export const LEASE_MS = 60_000;

/**
 * ISO 4217 exponents copied from business-os contract v1 currency-exponents.json.
 * An unlisted fiat currency fails closed.
 */
export const FIAT_EXPONENTS: Record<string, number> = {
  GBP: 2,
  USD: 2,
  EUR: 2,
  JPY: 0,
  KRW: 0,
  CAD: 2,
  AUD: 2,
  CHF: 2,
  SEK: 2,
  NOK: 2,
  DKK: 2,
  PLN: 2,
  BRL: 2,
  MXN: 2,
  INR: 2,
  CNY: 2,
  HKD: 2,
  SGD: 2,
  NZD: 2,
  TRY: 2,
  ILS: 2,
  KWD: 3,
  BHD: 3,
};

export function fiatExponent(currency: string): number {
  const exponent = FIAT_EXPONENTS[currency];
  if (exponent === undefined) {
    throw new Error(`unsupported_currency:${currency}`);
  }
  return exponent;
}
