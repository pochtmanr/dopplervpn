import { createSign } from "node:crypto";
import { QuotaStop } from "./collect";
import { parseGa4Report, type Ga4ParsedReport } from "./parse";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const DATA_API = "https://analyticsdata.googleapis.com/v1beta";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const TIMEOUT_MS = 15_000;
const PAGE_LIMIT = 10_000;

export interface Ga4ClientConfig {
  propertyId: string;
  clientEmail: string;
  privateKey: string;
}

export interface Ga4Query {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  metrics: string[];
  limit?: number;
}

export function ga4ConfigFromEnv(env: NodeJS.ProcessEnv = process.env): Ga4ClientConfig | null {
  const propertyId = env.GA_PROPERTY_ID;
  const clientEmail = env.GA_SA_CLIENT_EMAIL;
  const privateKey = env.GA_SA_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!propertyId || !clientEmail || !privateKey) return null;
  return { propertyId, clientEmail, privateKey };
}

export async function runGa4Report(
  config: Ga4ClientConfig,
  query: Ga4Query,
  fetchImpl: typeof fetch = fetch,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<Ga4ParsedReport> {
  const token = await accessToken(config, fetchImpl, nowSeconds);
  const rows = [];
  let offset = 0;
  let page = await requestPage(config, query, token, offset, fetchImpl);
  const rowCount = page.rowCount;
  const metadata = { ...page.metadata, samplingMetadatas: [...page.metadata.samplingMetadatas] };
  rows.push(...page.rows);
  while (rows.length < rowCount && page.rows.length > 0) {
    offset += page.rows.length;
    page = await requestPage(config, query, token, offset, fetchImpl);
    rows.push(...page.rows);
    if (!metadata.timeZone && page.metadata.timeZone) metadata.timeZone = page.metadata.timeZone;
    metadata.dataLossFromOtherRow ||= page.metadata.dataLossFromOtherRow;
    metadata.subjectToThresholding ||= page.metadata.subjectToThresholding;
    metadata.samplingMetadatas.push(...page.metadata.samplingMetadatas);
    if (page.rows.length < (query.limit ?? PAGE_LIMIT)) break;
  }
  const dataState = metadata.samplingMetadatas.length > 0
    ? "sampled"
    : metadata.subjectToThresholding || metadata.dataLossFromOtherRow
      ? "partial"
      : "final";
  return { rows, rowCount, metadata, dataState };
}

async function requestPage(
  config: Ga4ClientConfig,
  query: Ga4Query,
  token: string,
  offset: number,
  fetchImpl: typeof fetch,
): Promise<Ga4ParsedReport> {
  const response = await fetchImpl(
    `${DATA_API}/properties/${encodeURIComponent(config.propertyId)}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: query.startDate, endDate: query.endDate }],
        dimensions: query.dimensions?.map((name) => ({ name })),
        metrics: query.metrics.map((name) => ({ name })),
        limit: String(query.limit ?? PAGE_LIMIT),
        offset: String(offset),
        returnPropertyQuota: true,
        keepEmptyRows: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (response.status === 429) throw new QuotaStop();
  if (!response.ok) throw new Error("ga4_unavailable");
  return parseGa4Report(await response.json());
}

async function accessToken(config: Ga4ClientConfig, fetchImpl: typeof fetch, nowSeconds: number): Promise<string> {
  const unsigned = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(JSON.stringify({
    iss: config.clientEmail,
    scope: SCOPE,
    aud: TOKEN_ENDPOINT,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  }))}`;
  const signature = base64url(createSign("RSA-SHA256").update(unsigned).sign(config.privateKey));
  const response = await fetchImpl(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error("ga4_token_failed");
  const json = await response.json() as { access_token?: string };
  if (!json.access_token) throw new Error("ga4_token_failed");
  return json.access_token;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}
