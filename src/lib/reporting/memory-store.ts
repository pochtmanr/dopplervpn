import { FORMULA_VERSION } from "./constants";
import { formatUtcInstant, planObservation } from "./plan";
import type {
  ApplyResult,
  Checkpoint,
  FinanceRecord,
  Observation,
  QuarantineRow,
  Snapshot,
  StoredFx,
  TransportRow,
} from "./types";

export class MemoryReportingStore {
  private seq = BigInt(0);
  private transports = new Map<string, TransportRow>();
  private quarantines: QuarantineRow[] = [];
  private records: FinanceRecord[] = [];
  private fx: StoredFx[] = [];
  private checkpoints = new Map<string, Checkpoint>();
  private leases = new Map<string, { owner: string; until: number }>();
  private snapshots = new Map<string, Snapshot>();
  private tails = new Map<string, Promise<unknown>>();
  clock: () => Date = () => new Date("2026-09-28T12:00:00Z");

  async apply(obs: Observation): Promise<ApplyResult> {
    return this.withLock(obs.economicTransactionId, async () => {
      const key = transportKey(obs.sourceSystem, obs.transportId);
      const existing = this.transports.get(key) ?? null;
      const planned = planObservation(
        {
          transportHash: existing?.payloadHash ?? null,
          records: this.records.filter(
            (record) => record.economic_transaction_id === obs.economicTransactionId,
          ),
        },
        obs,
        formatUtcInstant(this.clock()),
        () => {
          this.seq += BigInt(1);
          return this.seq.toString();
        },
      );
      if (planned.status === "duplicate") return planned.result;
      if (planned.status === "conflict") return planned.result;
      const effects = planned.effects;
      this.transports.set(key, effects.transport);
      if (effects.quarantine) this.quarantines.push(effects.quarantine);
      this.records.push(...effects.records);
      this.fx.push(...effects.fx);
      return effects.result;
    });
  }

  async acquireLease(source: string, owner: string, nowMs: number, ttlMs: number): Promise<boolean> {
    const current = this.leases.get(source);
    if (current && current.until > nowMs && current.owner !== owner) return false;
    this.leases.set(source, { owner, until: nowMs + ttlMs });
    return true;
  }

  async releaseLease(source: string, owner: string): Promise<void> {
    const current = this.leases.get(source);
    if (current?.owner === owner) this.leases.delete(source);
  }

  async getCheckpoint(source: string): Promise<Checkpoint | null> {
    return this.checkpoints.get(source) ?? null;
  }

  async saveCheckpoint(source: string, checkpoint: Checkpoint): Promise<void> {
    this.checkpoints.set(source, checkpoint);
  }

  async noteFailure(source: string, error: string): Promise<number> {
    const current = this.checkpoints.get(source) ?? emptyCheckpoint();
    const next = { ...current, retryCount: current.retryCount + 1, lastError: error };
    this.checkpoints.set(source, next);
    return next.retryCount;
  }

  async resetFailures(source: string): Promise<void> {
    const current = this.checkpoints.get(source);
    if (!current) return;
    this.checkpoints.set(source, { ...current, retryCount: 0, lastError: null });
  }

  async createSnapshot(now: Date): Promise<Snapshot> {
    const snapshot: Snapshot = {
      snapshotId: `snap.${this.seq.toString()}.${formatUtcInstant(now).replace(/[-:]/g, "")}`,
      environment: "production",
      dataAsOf: formatUtcInstant(now),
      highWatermark: this.seq.toString(),
      formulaVersion: FORMULA_VERSION,
    };
    this.snapshots.set(snapshot.snapshotId, snapshot);
    return snapshot;
  }

  async getSnapshot(id: string): Promise<Snapshot | null> {
    return this.snapshots.get(id) ?? null;
  }

  currentWatermark(): string {
    return this.seq.toString();
  }

  /**
   * Append already-sealed ledger rows on the same change sequence as provider
   * observations. Manual expenses, settlements, and transfers use this so they
   * share D1's snapshot watermark instead of a second ledger.
   */
  async appendBuilt(
    build: (allocate: () => string, now: string) => FinanceRecord[],
  ): Promise<FinanceRecord[]> {
    return this.withLock("money.append", async () => {
      const now = formatUtcInstant(this.clock());
      const records = build(() => {
          this.seq += BigInt(1);
        return this.seq.toString();
      }, now);
      this.records.push(...records);
      return records;
    });
  }

  async recordsAt(watermark: string): Promise<FinanceRecord[]> {
    const latest = new Map<string, FinanceRecord>();
    for (const record of await this.revisionsAt(watermark)) {
      const current = latest.get(record.record_id);
      if (!current || record.revision > current.revision) latest.set(record.record_id, record);
    }
    return [...latest.values()];
  }

  async revisionsAt(watermark: string): Promise<FinanceRecord[]> {
    const limit = BigInt(watermark);
    return this.records.filter((record) => BigInt(record.change_sequence) <= limit);
  }

  /** Test hook: insert a sealed row, including a conflicting revision. */
  seedRevision(record: FinanceRecord): void {
    this.records.push(record);
    const seq = BigInt(record.change_sequence);
    if (seq > this.seq) this.seq = seq;
  }

  async exclusionCounts(): Promise<{ sandbox: number; quarantined: number }> {
    let sandbox = 0;
    for (const row of this.transports.values()) {
      if (row.environment === "sandbox") sandbox += 1;
    }
    return { sandbox, quarantined: this.quarantines.length };
  }

  fxEvidence(): StoredFx[] {
    return this.fx;
  }

  private async withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.tails.get(key) ?? Promise.resolve();
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = previous.then(() => gate);
    this.tails.set(key, tail);
    await previous.catch(() => undefined);
    try {
      return await fn();
    } finally {
      release();
    }
  }
}

function transportKey(source: string, transportId: string): string {
  return `${source}:${transportId}`;
}

function emptyCheckpoint(): Checkpoint {
  return {
    cursorCreatedAt: null,
    cursorId: null,
    coveredThrough: null,
    retryCount: 0,
    lastError: null,
  };
}
