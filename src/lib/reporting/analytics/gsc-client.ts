import { createSign } from "node:crypto";
import { GSC_ROW_LIMIT, QuotaStop } from "./collect";
import { parseGscReport, type GscParsedReport } from "./parse";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/webmasters/v3";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const TIMEOUT_MS = 15_000;

export interface GscClientConfig {
  siteUrl: string;
  clientEmail: string;
  privateKey: string;
}

export interface GscQuery {
  startDate: string;
  endDate: string;
  dimensions: string[];
  aggregationType: "auto" | "byPage" | "byProperty";
  rowLimit?: number;
  startRow?: number;
}

export function gscConfigFromEnv(env: NodeJS.ProcessEnv = process.env): GscClientConfig | null {
  const siteUrl = env.GSC_SITE_URL;
  const clientEmail = env.GSC_SA_CLIENT_EMAIL;
  const privateKey = env.GSC_SA_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!siteUrl || !clientEmail || !privateKey) return null;
  return { siteUrl, clientEmail, privateKey };
}

export async function querySearchAnalytics(
  config: GscClientConfig,
  query: GscQuery,
  fetchImpl: typeof fetch = fetch,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<GscParsedReport> {
  const token = await accessToken(config, fetchImpl, nowSeconds);
  const response = await fetchImpl(
    `${API}/sites/${encodeURIComponent(config.siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: query.startDate,
        endDate: query.endDate,
        dimensions: query.dimensions,
        type: "web",
        aggregationType: query.aggregationType,
        rowLimit: query.rowLimit ?? GSC_ROW_LIMIT,
        startRow: query.startRow ?? 0,
        dataState: "all",
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );
  if (response.status === 429) throw new QuotaStop();
  if (!response.ok) throw new Error("gsc_unavailable");
  return parseGscReport(await response.json());
}

async function accessToken(config: GscClientConfig, fetchImpl: typeof fetch, nowSeconds: number): Promise<string> {
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
  if (!response.ok) throw new Error("gsc_token_failed");
  const json = await response.json() as { access_token?: string };
  if (!json.access_token) throw new Error("gsc_token_failed");
  return json.access_token;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}
