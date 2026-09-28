import { createHash } from "node:crypto";

/** Same canonical JSON as contracts/business-os/v1/canonical.mjs. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalize(record[key])}`)
    .join(",")}}`;
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function contentHash(record: Record<string, unknown>): string {
  const copy = { ...record };
  delete copy.content_hash;
  return sha256Hex(canonicalize(copy));
}
