import {
  IMPORT_BATCH,
  IMPORT_MAX_RETRIES,
  IMPORT_OVERLAP_MS,
  IMPORT_SOURCE,
  LEASE_MS,
} from "./constants";
import { observationFromInvoice, type InvoiceRow } from "./map-evidence";
import type { ReportingStore } from "./types";

export interface InvoiceReader {
  page(after: { createdAt: string; id: string } | null, limit: number): Promise<InvoiceRow[]>;
}

export interface ImportResult {
  status: "imported" | "leased" | "retry" | "bounded_stop";
  scanned: number;
  applied: number;
  duplicates: number;
  quarantined: number;
  excluded: number;
  retryCount: number;
}

export async function importInvoiceHistory(
  store: ReportingStore,
  reader: InvoiceReader,
  options: { nowMs?: number; owner?: string; source?: string } = {},
): Promise<ImportResult> {
  const source = options.source ?? IMPORT_SOURCE;
  const owner = options.owner ?? "reporting-import";
  const nowMs = options.nowMs ?? Date.now();
  const checkpoint = await store.getCheckpoint(source);
  if ((checkpoint?.retryCount ?? 0) >= IMPORT_MAX_RETRIES) {
    return emptyResult("bounded_stop", checkpoint?.retryCount ?? IMPORT_MAX_RETRIES);
  }
  const leased = await store.acquireLease(source, owner, nowMs, LEASE_MS);
  if (!leased) return emptyResult("leased", checkpoint?.retryCount ?? 0);
  try {
    const after = resumeAfter(checkpoint?.cursorCreatedAt ?? null, checkpoint?.cursorId ?? null);
    let cursor = after;
    let scanned = 0;
    let applied = 0;
    let duplicates = 0;
    let quarantined = 0;
    let excluded = 0;
    for (;;) {
      const page = await reader.page(cursor, IMPORT_BATCH);
      for (const row of page) {
        scanned += 1;
        const observation = observationFromInvoice(row);
        if (!observation) continue;
        const result = await store.apply(observation);
        if (result.status === "ok") applied += 1;
        else if (result.status === "duplicate") duplicates += 1;
        else if (result.status === "quarantined") quarantined += 1;
        else if (result.status === "excluded") excluded += 1;
      }
      const last = page.at(-1);
      if (last) {
        await store.saveCheckpoint(source, {
          cursorCreatedAt: last.created_at,
          cursorId: last.id,
          coveredThrough: last.created_at,
          retryCount: 0,
          lastError: null,
        });
        cursor = { createdAt: last.created_at, id: last.id };
      }
      if (page.length < IMPORT_BATCH) break;
    }
    await store.resetFailures(source);
    return {
      status: "imported",
      scanned,
      applied,
      duplicates,
      quarantined,
      excluded,
      retryCount: 0,
    };
  } catch (error) {
    const retryCount = await store.noteFailure(
      source,
      error instanceof Error ? error.name : "import_failed",
    );
    return {
      ...emptyResult(retryCount >= IMPORT_MAX_RETRIES ? "bounded_stop" : "retry", retryCount),
    };
  } finally {
    await store.releaseLease(source, owner);
  }
}

function resumeAfter(createdAt: string | null, id: string | null): { createdAt: string; id: string } | null {
  if (!createdAt || !id) return null;
  return { createdAt: overlapFloor(createdAt), id: "" };
}

function overlapFloor(createdAt: string): string {
  const time = new Date(createdAt).getTime();
  if (Number.isNaN(time)) return createdAt;
  return new Date(time - IMPORT_OVERLAP_MS).toISOString();
}

function emptyResult(status: ImportResult["status"], retryCount: number): ImportResult {
  return {
    status,
    scanned: 0,
    applied: 0,
    duplicates: 0,
    quarantined: 0,
    excluded: 0,
    retryCount,
  };
}
