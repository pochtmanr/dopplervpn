export type BosEnvironment = "production" | "staging" | "test";
export type BosKeyStatus = "active" | "revoked";

export interface BosKey {
  keyId: string;
  secret: string;
  projectId: string;
  environment: BosEnvironment;
  status: BosKeyStatus;
}

const ENVIRONMENTS = new Set<BosEnvironment>(["production", "staging", "test"]);
const STATUSES = new Set<BosKeyStatus>(["active", "revoked"]);

export function parseExportKeys(raw: string | undefined): BosKey[] {
  if (!raw || !raw.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("BOS_EXPORT_KEYS is not valid JSON");
  }
  if (!Array.isArray(parsed)) throw new Error("BOS_EXPORT_KEYS must be an array");
  return parsed.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`BOS_EXPORT_KEYS[${index}] is not an object`);
    }
    const row = item as Record<string, unknown>;
    const keyId = row.keyId ?? row.key_id;
    const secret = row.secret;
    const projectId = row.projectId ?? row.project_id;
    const environment = row.environment;
    const status = row.status;
    if (typeof keyId !== "string" || !keyId) throw new Error(`BOS_EXPORT_KEYS[${index}] missing key id`);
    if (typeof secret !== "string" || !secret) throw new Error(`BOS_EXPORT_KEYS[${index}] missing secret`);
    if (typeof projectId !== "string" || !projectId) throw new Error(`BOS_EXPORT_KEYS[${index}] missing project`);
    if (typeof environment !== "string" || !ENVIRONMENTS.has(environment as BosEnvironment)) {
      throw new Error(`BOS_EXPORT_KEYS[${index}] has an unknown environment`);
    }
    if (typeof status !== "string" || !STATUSES.has(status as BosKeyStatus)) {
      throw new Error(`BOS_EXPORT_KEYS[${index}] has an unknown status`);
    }
    return {
      keyId,
      secret,
      projectId,
      environment: environment as BosEnvironment,
      status: status as BosKeyStatus,
    };
  });
}
