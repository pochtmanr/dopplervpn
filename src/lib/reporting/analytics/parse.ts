import { ctrDecimal, metricDecimal } from "./decimals";

export interface Ga4Metadata {
  timeZone: string | null;
  currencyCode: string | null;
  dataLossFromOtherRow: boolean;
  subjectToThresholding: boolean;
  samplingMetadatas: Array<{ samplesReadCount: string; samplingSpaceSize: string }>;
  propertyQuota: unknown;
  dataTruncationReasons: unknown[];
}

export interface Ga4ParsedRow {
  dimensions: string[];
  metrics: string[];
}

export interface Ga4ParsedReport {
  rows: Ga4ParsedRow[];
  rowCount: number;
  metadata: Ga4Metadata;
  dataState: "final" | "partial" | "sampled";
}

export function parseGa4Report(payload: unknown): Ga4ParsedReport {
  const body = asRecord(payload);
  const metadata = parseMetadata(body.metadata);
  const rows = Array.isArray(body.rows) ? body.rows.map(parseRow) : [];
  const rowCount = typeof body.rowCount === "number" ? body.rowCount : rows.length;
  return {
    rows,
    rowCount,
    metadata,
    dataState: dataState(metadata),
  };
}

export interface GscParsedRow {
  keys: string[];
  clicks: number | null;
  impressions: number | null;
  ctr: string | null;
  position: string | null;
}

export interface GscParsedReport {
  rows: GscParsedRow[];
  responseAggregationType: "auto" | "byPage" | "byProperty" | null;
  firstIncompleteDate: string | null;
}

export function parseGscReport(payload: unknown): GscParsedReport {
  const body = asRecord(payload);
  const metadata = asRecord(body.metadata);
  const aggregation = body.responseAggregationType;
  return {
    rows: Array.isArray(body.rows) ? body.rows.map(parseGscRow) : [],
    responseAggregationType: aggregation === "auto" || aggregation === "byPage" || aggregation === "byProperty"
      ? aggregation
      : null,
    firstIncompleteDate: typeof metadata.first_incomplete_date === "string" ? metadata.first_incomplete_date : null,
  };
}

export function integerMetric(value: string): number | null {
  if (!/^(0|[1-9][0-9]*)$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function dataState(metadata: Ga4Metadata): "final" | "partial" | "sampled" {
  if (metadata.samplingMetadatas.length > 0) return "sampled";
  if (metadata.subjectToThresholding || metadata.dataLossFromOtherRow) return "partial";
  return "final";
}

function parseMetadata(value: unknown): Ga4Metadata {
  const metadata = asRecord(value);
  const sampling = Array.isArray(metadata.samplingMetadatas) ? metadata.samplingMetadatas : [];
  return {
    timeZone: typeof metadata.timeZone === "string" ? metadata.timeZone : null,
    currencyCode: typeof metadata.currencyCode === "string" ? metadata.currencyCode : null,
    dataLossFromOtherRow: metadata.dataLossFromOtherRow === true,
    subjectToThresholding: metadata.subjectToThresholding === true,
    samplingMetadatas: sampling.map((item) => {
      const row = asRecord(item);
      return {
        samplesReadCount: typeof row.samplesReadCount === "string" ? row.samplesReadCount : "0",
        samplingSpaceSize: typeof row.samplingSpaceSize === "string" ? row.samplingSpaceSize : "0",
      };
    }),
    propertyQuota: metadata.propertyQuota ?? null,
    dataTruncationReasons: Array.isArray(metadata.dataTruncationReasons) ? metadata.dataTruncationReasons : [],
  };
}

function parseRow(value: unknown): Ga4ParsedRow {
  const row = asRecord(value);
  const dimensions = Array.isArray(row.dimensionValues)
    ? row.dimensionValues.map((item) => String(asRecord(item).value ?? ""))
    : [];
  const metrics = Array.isArray(row.metricValues)
    ? row.metricValues.map((item) => String(asRecord(item).value ?? ""))
    : [];
  return { dimensions, metrics };
}

function parseGscRow(value: unknown): GscParsedRow {
  const row = asRecord(value);
  const clicks = wholeNumber(row.clicks);
  const impressions = wholeNumber(row.impressions);
  return {
    keys: Array.isArray(row.keys) ? row.keys.map((item) => String(item)) : [],
    clicks,
    impressions,
    ctr: clicks != null && impressions != null ? ctrDecimal(clicks, impressions) : null,
    position: typeof row.position === "number" ? metricDecimal(row.position) : null,
  };
}

function wholeNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) > 1e-6) return null;
  return rounded;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}
