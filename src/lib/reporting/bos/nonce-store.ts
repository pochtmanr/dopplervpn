export type NonceClaim = "claimed" | "replayed" | "rate_limited";

export interface NonceClaimInput {
  keyId: string;
  nonce: string;
  expiresAtMs: number;
  nowMs: number;
  rateLimit: number;
  windowMs: number;
}

export interface NonceStore {
  claim(input: NonceClaimInput): Promise<NonceClaim>;
}

interface NonceRow {
  expiresAtMs: number;
  createdAtMs: number;
}

/**
 * Check and insert share one synchronous section so two overlapping claims
 * of the same nonce cannot both succeed.
 */
export class MemoryNonceStore implements NonceStore {
  private readonly rows = new Map<string, NonceRow>();

  async claim(input: NonceClaimInput): Promise<NonceClaim> {
    const key = `${input.keyId}\0${input.nonce}`;
    const existing = this.rows.get(key);
    if (existing && existing.expiresAtMs > input.nowMs) return "replayed";
    this.rows.set(key, { expiresAtMs: input.expiresAtMs, createdAtMs: input.nowMs });
    let recent = 0;
    for (const [id, row] of this.rows) {
      if (row.expiresAtMs <= input.nowMs) {
        this.rows.delete(id);
        continue;
      }
      if (id.startsWith(`${input.keyId}\0`) && input.nowMs - row.createdAtMs <= input.windowMs) {
        recent += 1;
      }
    }
    if (recent > input.rateLimit) return "rate_limited";
    return "claimed";
  }
}

interface NonceQuery {
  rpc(fn: string, args: Record<string, unknown>): Promise<{ data: unknown; error: { message: string } | null }>;
}

export class SupabaseNonceStore implements NonceStore {
  constructor(private readonly client: NonceQuery) {}

  async claim(input: NonceClaimInput): Promise<NonceClaim> {
    const result = await this.client.rpc("reporting_claim_bos_nonce", {
      p_key_id: input.keyId,
      p_nonce: input.nonce,
      p_expires_at: new Date(input.expiresAtMs).toISOString(),
      p_rate_window_seconds: Math.ceil(input.windowMs / 1000),
      p_rate_limit: input.rateLimit,
    });
    if (result.error) throw new Error("nonce_store_unavailable");
    if (result.data === "claimed" || result.data === "replayed" || result.data === "rate_limited") {
      return result.data;
    }
    throw new Error("nonce_store_unavailable");
  }
}
