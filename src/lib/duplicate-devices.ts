/**
 * Counts duplicate device records with the same rule as the SQL function
 * `public._duplicate_device_pairs(account, null)` (doppler-legacy-rn migration
 * 20261122T120000_duplicate_devices.sql). Keep the two in step.
 *
 * - Rows are the same device when they share device_type and normalized name
 *   (lower, trim spaces, collapse whitespace). A null device_type never matches.
 * - The record to keep is the most recently active one (then the newest created).
 * - Another row is a duplicate only if it went quiet before the kept row appeared:
 *   last_active_at <= keep.created_at + 1 hour. Rows never active are not flagged.
 *
 * Computed in TS over rows the route already reads, which saves a round trip and
 * does not depend on PostgREST exposing an underscore-prefixed function.
 */

export interface DeviceRowForDuplicates {
  device_name: string | null;
  device_type: string | null;
  last_active_at: string | null;
  created_at: string;
}

const GRACE_MS = 60 * 60 * 1000;

/** Same as SQL `_device_name_norm`: regexp_replace(lower(btrim(name)), '\s+', ' ', 'g'). */
export function normalizeDeviceName(name: string | null): string {
  return (name ?? '').toLowerCase().replace(/^ +| +$/g, '').replace(/\s+/g, ' ');
}

const time = (iso: string | null) => (iso ? Date.parse(iso) : NaN);

/** True when `a` should be kept over `b`: latest activity first (nulls last), then newest created. */
function keepsOver(a: DeviceRowForDuplicates, b: DeviceRowForDuplicates): boolean {
  const aa = time(a.last_active_at);
  const ba = time(b.last_active_at);
  if (Number.isNaN(aa) !== Number.isNaN(ba)) return !Number.isNaN(aa);
  if (!Number.isNaN(aa) && aa !== ba) return aa > ba;
  return time(a.created_at) > time(b.created_at);
}

export function countDuplicateDevices(rows: readonly DeviceRowForDuplicates[]): number {
  const groups = new Map<string, DeviceRowForDuplicates[]>();
  for (const row of rows) {
    if (row.device_type == null) continue;
    const key = `${row.device_type}\u0000${normalizeDeviceName(row.device_name)}`;
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }

  let count = 0;
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const keep = group.reduce((best, row) => (keepsOver(row, best) ? row : best));
    const limit = time(keep.created_at) + GRACE_MS;
    for (const row of group) {
      if (row !== keep && time(row.last_active_at) <= limit) count++;
    }
  }
  return count;
}
