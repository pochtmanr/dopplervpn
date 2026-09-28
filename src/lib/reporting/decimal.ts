/**
 * Exact decimal amounts. Finance never uses binary floating point.
 * Scale is the number of digits after the decimal point.
 */

const DECIMAL_PATTERN = /^(0|[1-9][0-9]*)(\.[0-9]{1,18})?$/;

export class DecimalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DecimalError";
  }
}

export interface ExactDecimal {
  units: bigint;
  scale: number;
}

export function parseDecimal(input: string): ExactDecimal {
  if (!DECIMAL_PATTERN.test(input)) {
    throw new DecimalError("invalid_decimal");
  }
  const [whole, frac = ""] = input.split(".");
  return {
    units: BigInt(whole + frac),
    scale: frac.length,
  };
}

export function formatDecimal(units: bigint, scale: number): string {
  if (units < BigInt(0)) throw new DecimalError("negative_amount");
  if (scale < 0 || scale > 18) throw new DecimalError("invalid_scale");
  if (scale === 0) return units.toString();
  const digits = units.toString().padStart(scale + 1, "0");
  const whole = digits.slice(0, digits.length - scale).replace(/^0+(?=\d)/, "");
  const frac = digits.slice(digits.length - scale);
  return `${whole}.${frac}`;
}

export function rescale(value: ExactDecimal, scale: number): bigint {
  if (value.scale > scale) throw new DecimalError("scale_loss");
  return value.units * BigInt(10) ** BigInt(scale - value.scale);
}

export function addDecimals(values: string[], scale: number): string {
  let total = BigInt(0);
  for (const value of values) {
    total += rescale(parseDecimal(value), scale);
  }
  return formatDecimal(total, scale);
}

export function subtractDecimals(left: string, right: string, scale: number): string | null {
  const difference = rescale(parseDecimal(left), scale) - rescale(parseDecimal(right), scale);
  if (difference < BigInt(0)) return null;
  return formatDecimal(difference, scale);
}

export function multiplyDecimal(amount: string, rate: string, scale: number): string {
  const left = parseDecimal(amount);
  const right = parseDecimal(rate);
  const product = left.units * right.units;
  const productScale = left.scale + right.scale;
  if (productScale < scale) {
    return formatDecimal(product * BigInt(10) ** BigInt(scale - productScale), scale);
  }
  const divisor = BigInt(10) ** BigInt(productScale - scale);
  return formatDecimal(product / divisor, scale);
}

export function isZeroDecimal(value: string): boolean {
  return parseDecimal(value).units === BigInt(0);
}

/** Truncates extra digits. A zero divisor returns null instead of a fabricated quotient. */
export function divideDecimals(amount: string, divisor: string, scale: number): string | null {
  if (scale < 0 || scale > 18) throw new DecimalError("invalid_scale");
  const left = parseDecimal(amount);
  const right = parseDecimal(divisor);
  if (right.units === BigInt(0)) return null;
  const numerator = left.units * BigInt(10) ** BigInt(right.scale + scale);
  const denominator = right.units * BigInt(10) ** BigInt(left.scale);
  return formatDecimal(numerator / denominator, scale);
}
