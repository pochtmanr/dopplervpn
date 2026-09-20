import 'server-only';
import crypto from 'crypto';

/**
 * Verify a Revolut webhook signature.
 *
 * Revolut sends `Revolut-Signature: v1=<hmac_hex>[,v1=<hmac_hex>…]` — more than
 * one during a secret rotation — and signs the payload `v1.<timestamp>.<body>`
 * with HMAC-SHA256. Any one matching signature is enough.
 *
 * Extracted from the route handler so it can be tested: this function is the
 * only thing standing between an unauthenticated POST and crediting an account.
 *
 * @throws if REVOLUT_WEBHOOK_SECRET is unset — failing closed is deliberate,
 *         since returning false would look identical to a forged request in the
 *         logs and hide a misconfiguration.
 */
export function verifyRevolutSignature(
  rawBody: string,
  signatureHeader: string,
  timestamp: string,
): boolean {
  const secret = process.env.REVOLUT_WEBHOOK_SECRET;
  if (!secret) throw new Error('REVOLUT_WEBHOOK_SECRET is not configured');

  const signatures = signatureHeader.split(',').map((s) => s.trim());
  const payload = `v1.${timestamp}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return signatures.some((sig) => {
    const hash = sig.startsWith('v1=') ? sig.slice(3) : null;
    if (!hash) return false;
    try {
      // timingSafeEqual throws on a length mismatch; that is a non-match.
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}
