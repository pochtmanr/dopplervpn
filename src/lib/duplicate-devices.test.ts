import { describe, expect, it } from 'vitest';
import { countDuplicateDevices, normalizeDeviceName } from './duplicate-devices';

const row = (name: string | null, type: string | null, created: string, active: string | null) => ({
  device_name: name,
  device_type: type,
  created_at: created,
  last_active_at: active,
});

describe('normalizeDeviceName', () => {
  it('lowercases, trims spaces and collapses whitespace', () => {
    expect(normalizeDeviceName('  Roman\'s   iPhone ')).toBe("roman's iphone");
    expect(normalizeDeviceName(null)).toBe('');
  });
});

describe('countDuplicateDevices', () => {
  it('flags an old copy that went quiet before the kept row appeared', () => {
    expect(
      countDuplicateDevices([
        row('MacBook', 'macos', '2026-01-01T00:00:00Z', '2026-03-01T00:00:00Z'),
        row('macbook ', 'macos', '2026-06-01T00:00:00Z', '2026-11-20T00:00:00Z'),
      ]),
    ).toBe(1);
  });

  it('allows the one-hour grace', () => {
    expect(
      countDuplicateDevices([
        row('PC', 'windows', '2026-01-01T00:00:00Z', '2026-06-01T00:59:00Z'),
        row('PC', 'windows', '2026-06-01T00:00:00Z', '2026-11-20T00:00:00Z'),
      ]),
    ).toBe(1);
  });

  it('never flags two devices used at the same time', () => {
    expect(
      countDuplicateDevices([
        row('iPhone', 'ios', '2026-01-01T00:00:00Z', '2026-11-19T00:00:00Z'),
        row('iPhone', 'ios', '2026-06-01T00:00:00Z', '2026-11-20T00:00:00Z'),
      ]),
    ).toBe(0);
  });

  it('needs the same type and skips rows never active or without a type', () => {
    expect(
      countDuplicateDevices([
        row('Pixel', 'android', '2026-01-01T00:00:00Z', '2026-02-01T00:00:00Z'),
        row('Pixel', 'windows', '2026-06-01T00:00:00Z', '2026-11-20T00:00:00Z'),
        row('Tab', 'android', '2026-01-01T00:00:00Z', null),
        row('Tab', 'android', '2026-06-01T00:00:00Z', '2026-11-20T00:00:00Z'),
        row('X', null, '2026-01-01T00:00:00Z', '2026-02-01T00:00:00Z'),
        row('X', null, '2026-06-01T00:00:00Z', '2026-11-20T00:00:00Z'),
      ]),
    ).toBe(0);
  });

  it('counts every old copy in a group', () => {
    expect(
      countDuplicateDevices([
        row('Phone', 'android', '2025-01-01T00:00:00Z', '2025-05-01T00:00:00Z'),
        row('Phone', 'android', '2025-06-01T00:00:00Z', '2025-12-01T00:00:00Z'),
        row('Phone', 'android', '2026-01-01T00:00:00.123456+00:00', '2026-11-20T00:00:00Z'),
      ]),
    ).toBe(2);
  });
});
