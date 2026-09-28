const SECRET_KEY = /^(email|customer_email|token|access_token|refresh_token|secret|password|authorization|api_key|private_key)$/i;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const BEARER = /bearer\s+[A-Za-z0-9._~+/-]+=*/i;

/** Drops customer identifiers, tokens, secrets, and document URLs. */
export function redactExport<T>(value: T): T {
  return walk(value) as T;
}

function walk(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => walk(item));
  if (!value || typeof value !== "object") {
    if (typeof value === "string" && (EMAIL.test(value) || BEARER.test(value))) return undefined;
    return value;
  }
  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "url" || SECRET_KEY.test(key)) continue;
    const next = walk(child);
    if (next === undefined) continue;
    output[key] = next;
  }
  return output;
}
