import "server-only";
import { createUntypedAdminClient } from "@/lib/supabase/admin";
import { reportingStore } from "../persist";
import { analyticsStore } from "../analytics/persist";
import type { BosDeps } from "./handler";
import { parseExportKeys, type BosEnvironment } from "./keys";
import { SupabaseNonceStore } from "./nonce-store";

const cache = new Map<string, unknown>();

function environmentFrom(value: string | undefined): BosEnvironment {
  if (value === "staging" || value === "test" || value === "production") return value;
  return "production";
}

export function productionDeps(): BosDeps {
  const limit = Number(process.env.BOS_RATE_LIMIT_PER_MINUTE ?? "60");
  const client = createUntypedAdminClient();
  return {
    store: reportingStore(),
    nonceStore: new SupabaseNonceStore({
      rpc: async (fn, args) => {
        const result = await client.rpc(fn, args);
        return { data: result.data, error: result.error };
      },
    }),
    keys: parseExportKeys(process.env.BOS_EXPORT_KEYS),
    now: () => new Date(),
    environment: environmentFrom(process.env.BOS_ENVIRONMENT),
    projectId: "doppler",
    testTransport: process.env.BOS_TEST_TRANSPORT === "1",
    rateLimit: Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 60,
    cache,
    analytics: analyticsStore(),
  };
}
