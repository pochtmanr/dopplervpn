import { canonicalize, sha256Hex } from "../canonical";

export type AnalyticsProvider = "ga4" | "gsc" | "vercel";
export type AnalyticsDataState = "final" | "partial" | "sampled" | "unavailable";

export interface AnalyticsFactInput {
  provider: AnalyticsProvider;
  report: string;
  grainKey: string;
  sourceDate: string | null;
  sourceTimezone: string;
  sourceAsOf: string;
  retrievedAt: string;
  dataState: AnalyticsDataState;
  body: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface StoredFact extends AnalyticsFactInput {
  revision: number;
  contentHash: string;
}

export interface DrainBatchRecord {
  id: string;
  deliveryId: string | null;
  retryCount: number | null;
  receivedAt: string;
  body: unknown;
}

export interface AnalyticsStore {
  replaceFact(input: AnalyticsFactInput): Promise<StoredFact>;
  latestFacts(filter: { provider: string; report: string }): Promise<StoredFact[]>;
  appendDrainBatch(input: Omit<DrainBatchRecord, "id">): Promise<DrainBatchRecord>;
  drainBatches(): Promise<DrainBatchRecord[]>;
}

export class MemoryAnalyticsStore implements AnalyticsStore {
  private facts: StoredFact[] = [];
  private batches: DrainBatchRecord[] = [];
  private nextBatch = 1;

  async replaceFact(input: AnalyticsFactInput): Promise<StoredFact> {
    const contentHash = sha256Hex(canonicalize({
      body: input.body,
      dataState: input.dataState,
      metadata: input.metadata,
    }));
    const previous = this.facts
      .filter((fact) => fact.provider === input.provider && fact.report === input.report && fact.grainKey === input.grainKey)
      .sort((left, right) => right.revision - left.revision)[0];
    if (previous && previous.contentHash === contentHash) return previous;
    const stored: StoredFact = { ...input, revision: (previous?.revision ?? 0) + 1, contentHash };
    this.facts.push(stored);
    return stored;
  }

  async latestFacts(filter: { provider: string; report: string }): Promise<StoredFact[]> {
    const latest = new Map<string, StoredFact>();
    for (const fact of this.facts) {
      if (fact.provider !== filter.provider || fact.report !== filter.report) continue;
      const current = latest.get(fact.grainKey);
      if (!current || fact.revision > current.revision) latest.set(fact.grainKey, fact);
    }
    return [...latest.values()].sort((left, right) => left.grainKey.localeCompare(right.grainKey));
  }

  async appendDrainBatch(input: Omit<DrainBatchRecord, "id">): Promise<DrainBatchRecord> {
    const stored = { ...input, id: String(this.nextBatch) };
    this.nextBatch += 1;
    this.batches.push(stored);
    return stored;
  }

  async drainBatches(): Promise<DrainBatchRecord[]> {
    return [...this.batches];
  }
}
