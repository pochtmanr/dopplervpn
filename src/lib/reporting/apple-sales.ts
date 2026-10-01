import { createPrivateKey, sign } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { FIAT_EXPONENTS } from "./constants";
import { formatDecimal, parseDecimal, rescale } from "./decimal";
import { formatUtcInstant, safeId } from "./plan";
import type { Observation, ReportingStore } from "./types";

/**
 * App Store revenue from Apple's daily Sales and Trends summary report.
 *
 * Apple is the merchant of record. Each row is one day x product x storefront
 * x price point: Customer Price is what the buyer paid (tax included where
 * the storefront has it), Developer Proceeds is what Apple pays out. Apple
 * remits the tax, so the gap between the two is one store deduction
 * (commission plus tax) and our sales tax on the row is zero.
 */

export interface AppleSalesRow {
  date: string;
  sku: string;
  productType: string;
  units: number;
  customerPrice: string;
  customerCurrency: string;
  proceeds: string;
  proceedsCurrency: string;
  countryCode: string;
  promoCode: string;
  appleIdentifier: string;
}

const REQUIRED = [
  "SKU",
  "Product Type Identifier",
  "Units",
  "Developer Proceeds",
  "Begin Date",
  "Customer Currency",
  "Country Code",
  "Currency of Proceeds",
  "Apple Identifier",
  "Customer Price",
] as const;

/** Parses the tab-separated SALES/SUMMARY 1_1 report. Unknown columns are ignored. */
export function parseAppleSalesReport(text: string): AppleSalesRow[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split("\t").map((cell) => cell.trim());
  for (const name of REQUIRED) {
    if (!header.includes(name)) throw new Error(`apple_report_missing_column:${name}`);
  }
  const at = (cells: string[], name: string) => (cells[header.indexOf(name)] ?? "").trim();
  return lines.slice(1).map((line) => {
    const cells = line.split("\t");
    const [month, day, year] = at(cells, "Begin Date").split("/");
    return {
      date: `${year}-${month}-${day}`,
      sku: at(cells, "SKU"),
      productType: at(cells, "Product Type Identifier"),
      units: Number(at(cells, "Units")),
      customerPrice: at(cells, "Customer Price"),
      customerCurrency: at(cells, "Customer Currency").toUpperCase(),
      proceeds: at(cells, "Developer Proceeds"),
      proceedsCurrency: at(cells, "Currency of Proceeds").toUpperCase(),
      countryCode: at(cells, "Country Code"),
      promoCode: header.includes("Promo Code") ? at(cells, "Promo Code") : "",
      appleIdentifier: at(cells, "Apple Identifier"),
    };
  });
}

function times(perUnit: string, units: number, currency: string): string | null {
  const scale = FIAT_EXPONENTS[currency];
  if (scale === undefined) return null;
  const negative = perUnit.startsWith("-");
  const value = parseDecimal(negative ? perUnit.slice(1) : perUnit);
  if (value.scale > scale) return null;
  return formatDecimal(rescale(value, scale) * BigInt(Math.abs(units)), scale);
}

/**
 * One observation per paid row. Free rows (downloads, trial starts) carry no
 * money and are skipped. Negative units are refunds of that row's price.
 * Returns null for a row whose currency the ledger cannot hold.
 */
export function observationFromAppleRow(row: AppleSalesRow): Observation | null {
  if (!Number.isInteger(row.units) || row.units === 0) return null;
  const gross = times(row.customerPrice, row.units, row.customerCurrency);
  if (gross === null || /^0(\.0+)?$/.test(gross)) return null;
  const refund = row.units < 0;
  const key = safeId(
    [row.date, row.appleIdentifier || row.sku, row.countryCode, row.customerCurrency, row.customerPrice, row.promoCode || "-", refund ? "r" : "s"].join("."),
    "row",
  );
  const proceeds = row.proceedsCurrency === row.customerCurrency
    ? times(row.proceeds, row.units, row.proceedsCurrency)
    : null;
  const deduction = proceeds === null ? null : subtract(gross, proceeds, row.customerCurrency);
  return {
    sourceSystem: "app_store",
    transportId: `asc.sales.${key}`,
    environment: "production",
    externalObjectId: key,
    economicTransactionId: `econ.app_store.${key}`,
    eventKind: refund ? "refund" : "sale",
    occurredAt: formatUtcInstant(`${row.date}T12:00:00Z`),
    sourceAccountId: "app_store.vendor",
    amount: gross,
    currency: row.customerCurrency,
    crypto: null,
    tax: null,
    // Proceeds in another currency leave the deduction unknown, not zero.
    fee: deduction === null ? null : { amount: deduction, componentType: "store_commission" },
    parentExternalObjectId: refund ? key : null,
    targetRecordId: null,
    aliasIds: [`asc.${key}`],
    attribution: null,
    productId: row.sku || null,
    processor: "app_store",
    store: "app_store",
    channel: "app",
    fx: null,
    amountReason: null,
    postingRole: null,
    feeComponentId: null,
  };
}

function subtract(left: string, right: string, currency: string): string | null {
  const scale = FIAT_EXPONENTS[currency];
  const difference = rescale(parseDecimal(left), scale) - rescale(parseDecimal(right), scale);
  return difference < BigInt(0) ? null : formatDecimal(difference, scale);
}

export interface AscCredentials {
  keyId: string;
  issuerId: string;
  privateKey: string;
  vendorNumber: string;
}

export function ascCredentialsFromEnv(): AscCredentials | null {
  const keyId = process.env.ASC_KEY_ID;
  const issuerId = process.env.ASC_ISSUER_ID;
  const privateKey = process.env.ASC_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const vendorNumber = process.env.ASC_VENDOR_NUMBER;
  if (!keyId || !issuerId || !privateKey || !vendorNumber) return null;
  return { keyId, issuerId, privateKey, vendorNumber };
}

function ascToken(credentials: AscCredentials): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const head = encode({ alg: "ES256", kid: credentials.keyId, typ: "JWT" });
  const body = encode({ iss: credentials.issuerId, iat: now, exp: now + 600, aud: "appstoreconnect-v1" });
  const signature = sign("sha256", Buffer.from(`${head}.${body}`), {
    key: createPrivateKey(credentials.privateKey),
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");
  return `${head}.${body}.${signature}`;
}

/** The day's report text, or null when Apple has no report for that day (404). */
export async function fetchAppleSalesReport(credentials: AscCredentials, date: string): Promise<string | null> {
  const url = new URL("https://api.appstoreconnect.apple.com/v1/salesReports");
  url.search = new URLSearchParams({
    "filter[frequency]": "DAILY",
    "filter[reportType]": "SALES",
    "filter[reportSubType]": "SUMMARY",
    "filter[vendorNumber]": credentials.vendorNumber,
    "filter[reportDate]": date,
    "filter[version]": "1_1",
  }).toString();
  const response = await fetch(url, { headers: { Authorization: `Bearer ${ascToken(credentials)}` } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`apple_sales_report_${response.status}`);
  return gunzipSync(Buffer.from(await response.arrayBuffer())).toString("utf8");
}

export const APPLE_SOURCE = "app_store_sales";
/** First day to backfill. Daily reports reach back about a year. */
export const APPLE_BACKFILL_FROM = "2026-03-01";

export interface AppleImportResult {
  status: "imported" | "unconfigured" | "leased";
  days: number;
  applied: number;
  skipped: number;
  through: string | null;
}

/**
 * Imports each finished day after the checkpoint, oldest first, a bounded
 * number of days per run. A day is final once Apple publishes it; a missing
 * day stops the run so it is retried rather than skipped.
 */
export async function importAppleSales(
  store: ReportingStore,
  fetchReport: ((date: string) => Promise<string | null>) | null,
  options: { now?: Date; maxDays?: number; owner?: string } = {},
): Promise<AppleImportResult> {
  if (!fetchReport) return { status: "unconfigured", days: 0, applied: 0, skipped: 0, through: null };
  const now = options.now ?? new Date();
  const owner = options.owner ?? "apple-sales-import";
  if (!(await store.acquireLease(APPLE_SOURCE, owner, now.getTime(), 120_000))) {
    return { status: "leased", days: 0, applied: 0, skipped: 0, through: null };
  }
  try {
    const checkpoint = await store.getCheckpoint(APPLE_SOURCE);
    let day = checkpoint?.cursorId ? nextDay(checkpoint.cursorId) : APPLE_BACKFILL_FROM;
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    let days = 0;
    let applied = 0;
    let skipped = 0;
    let through = checkpoint?.cursorId ?? null;
    while (day <= yesterday && days < (options.maxDays ?? 40)) {
      const text = await fetchReport(day);
      // Apple publishes a day once; no report yet for a recent day means wait.
      if (text === null && day >= isoDaysBefore(now, 3)) break;
      for (const row of text ? parseAppleSalesReport(text) : []) {
        const observation = observationFromAppleRow(row);
        if (!observation) {
          skipped += 1;
          continue;
        }
        const result = await store.apply(observation);
        if (result.status === "ok") applied += 1;
      }
      through = day;
      days += 1;
      await store.saveCheckpoint(APPLE_SOURCE, {
        cursorCreatedAt: `${day}T00:00:00Z`,
        cursorId: day,
        coveredThrough: `${day}T23:59:59Z`,
        retryCount: 0,
        lastError: null,
      });
      day = nextDay(day);
    }
    return { status: "imported", days, applied, skipped, through };
  } catch (error) {
    await store.noteFailure(APPLE_SOURCE, error instanceof Error ? error.message : "apple_import_failed");
    throw error;
  } finally {
    await store.releaseLease(APPLE_SOURCE, owner);
  }
}

function nextDay(date: string): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function isoDaysBefore(now: Date, days: number): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
