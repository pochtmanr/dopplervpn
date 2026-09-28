import type { StoredFact } from "./store";
import { sourceDayBounds } from "./time";

export interface WebsiteSnapshot {
  byDay: Array<{ date: string; activeUsers: number; sessions: number; newUsers: number }>;
  totals: { activeUsers: number; sessions: number; newUsers: number; pageViews: number };
  topPages: Array<{ label: string; users: number }>;
  topCountries: Array<{ label: string; users: number }>;
  topSources: Array<{ label: string; users: number }>;
}

export function websiteFromFacts(input: {
  daily: StoredFact[];
  periods: StoredFact[];
  breakdowns: StoredFact[];
  days: number;
}): { data: WebsiteSnapshot } | { data: null; reason: string } {
  const period = input.periods.find((fact) => fact.grainKey === `period:${input.days}`);
  const activeUsers = period?.body.active_users;
  const from = period?.body.period_from;
  const to = period?.body.period_to;
  if (!period || typeof activeUsers !== "number" || typeof from !== "string" || typeof to !== "string") {
    return { data: null, reason: "period_unique_query_required" };
  }
  const rows = input.daily
    .filter((fact) => fact.sourceDate && overlaps(fact, from, to))
    .sort((left, right) => (left.sourceDate ?? "").localeCompare(right.sourceDate ?? ""));
  const byDay = rows.flatMap((fact) => {
    const date = fact.sourceDate;
    if (!date) return [];
    return [{
      date,
      activeUsers: numberField(fact.body.active_users),
      sessions: numberField(fact.body.sessions),
      newUsers: numberField(fact.body.new_users),
    }];
  });
  return {
    data: {
      byDay,
      totals: {
        activeUsers,
        sessions: byDay.reduce((sum, row) => sum + row.sessions, 0),
        newUsers: byDay.reduce((sum, row) => sum + row.newUsers, 0),
        pageViews: rows.reduce((sum, fact) => sum + numberField(fact.body.screen_page_views), 0),
      },
      topPages: breakdown(input.breakdowns, "pagePath"),
      topCountries: breakdown(input.breakdowns, "country"),
      topSources: breakdown(input.breakdowns, "sessionDefaultChannelGroup"),
    },
  };
}

function overlaps(fact: StoredFact, from: string, to: string): boolean {
  if (!fact.sourceDate) return false;
  const bounds = sourceDayBounds(fact.sourceDate, fact.sourceTimezone);
  return bounds.from < to && bounds.to > from;
}

function breakdown(facts: StoredFact[], dimension: string) {
  return facts
    .filter((fact) => fact.body.dimension === dimension && typeof fact.body.label === "string")
    .map((fact) => ({ label: String(fact.body.label), users: numberField(fact.body.value) }));
}

function numberField(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}
