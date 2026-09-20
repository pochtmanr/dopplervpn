import 'server-only';
import { randomInt } from 'node:crypto';

/**
 * Crockford-style alphabet: no I, O, 0 or 1, so an account ID read aloud or
 * copied off a screen can't be transcribed wrong.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Mint an account ID in the form `VPN-XXXX-XXXX-XXXX`.
 *
 * CSPRNG, not Math.random(). The account ID *is* the credential — there is no
 * password, and every `/api/account/*` and `/api/subscribe/*` route authorises
 * on knowledge of it alone. V8's Math.random() is xorshift128+, whose internal
 * state is recoverable from a handful of observed outputs, so an attacker who
 * mints a few accounts of their own could predict IDs issued to other people.
 * `/api/doppler/send-code` already reasons this way about the 6-digit code,
 * which guards strictly less than this does.
 */
export function generateAccountId(): string {
  const seg = () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(0, ALPHABET.length)]).join('');
  return `VPN-${seg()}-${seg()}-${seg()}`;
}
