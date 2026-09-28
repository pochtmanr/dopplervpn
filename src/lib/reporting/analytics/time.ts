export const GSC_TIMEZONE = "America/Los_Angeles";

export function sourceDate(instant: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(instant));
}

export function sourceDayBounds(date: string, timeZone: string): { from: string; to: string } {
  const start = zonedMidnightUtc(date, timeZone);
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year!, month! - 1, day! + 1)).toISOString().slice(0, 10);
  const end = zonedMidnightUtc(next, timeZone);
  return { from: instant(start), to: instant(end) };
}

/** Inclusive source dates ending today, counting back `days` dates. */
export function refreshDates(now: Date, timeZone: string, days: number): string[] {
  const today = sourceDate(now.toISOString(), timeZone);
  const dates: string[] = [];
  const [year, month, day] = today.split("-").map(Number);
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    dates.push(new Date(Date.UTC(year!, month! - 1, day! - offset)).toISOString().slice(0, 10));
  }
  return dates;
}

export function windowBounds(dates: string[], timeZone: string): { from: string; to: string } {
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (!first || !last) throw new Error("empty_window");
  return { from: sourceDayBounds(first, timeZone).from, to: sourceDayBounds(last, timeZone).to };
}

function instant(utcMs: number): string {
  return new Date(utcMs).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function zonedMidnightUtc(date: string, timeZone: string): number {
  const [year, month, day] = date.split("-").map(Number);
  let guess = Date.UTC(year!, month! - 1, day!, 0, 0, 0);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const next = Date.UTC(year!, month! - 1, day!, 0, 0, 0) - wallOffset(timeZone, guess);
    if (next === guess) return guess;
    guess = next;
  }
  return guess;
}

function wallOffset(timeZone: string, utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  let hour = read("hour");
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(read("year"), read("month") - 1, read("day"), hour, read("minute"), read("second"));
  return asUtc - utcMs;
}
