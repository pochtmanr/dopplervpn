const DECIMAL = /^(0|[1-9][0-9]*)(\.[0-9]{1,18})?$/;

export function ctrDecimal(clicks: number, impressions: number): string | null {
  if (!Number.isInteger(clicks) || !Number.isInteger(impressions) || clicks < 0 || impressions < 0) {
    return null;
  }
  if (impressions === 0) return null;
  const scale = 4;
  const factor = BigInt(10) ** BigInt(scale);
  const scaled = (BigInt(clicks) * factor) / BigInt(impressions);
  const digits = scaled.toString().padStart(scale + 1, "0");
  const whole = digits.slice(0, -scale);
  const fraction = digits.slice(-scale).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

export function metricDecimal(value: number): string | null {
  if (!Number.isFinite(value) || value < 0) return null;
  const text = value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  return DECIMAL.test(text) ? text : null;
}
