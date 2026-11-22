import 'server-only';
import { createHash } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Proof that a request comes from a real app install that owns `accountId`.
 *
 * The native clients mint a 64-hex device token through the `mint_device_token`
 * RPC and keep it in their secure store. The database keeps only its SHA-256.
 * This is the same check `get_servers_v2` / `report_sni_outcomes` run in SQL,
 * done here so web routes can rely on more than knowing the account code.
 */
const TOKEN_REGEX = /^[0-9a-f]{64}$/i;
const DEVICE_ID_MAX = 128;

export interface DeviceCredentials {
  accountId: string;
  deviceId: string;
  deviceToken: string;
}

export function parseDeviceCredentials(body: Record<string, unknown>): DeviceCredentials | null {
  const accountId = typeof body.accountId === 'string' ? body.accountId.toUpperCase() : '';
  const deviceId = typeof body.deviceId === 'string' ? body.deviceId : '';
  const deviceToken = typeof body.deviceToken === 'string' ? body.deviceToken : '';
  if (!accountId || !deviceId || deviceId.length > DEVICE_ID_MAX) return null;
  if (!TOKEN_REGEX.test(deviceToken)) return null;
  return { accountId, deviceId, deviceToken };
}

export async function verifyDeviceToken(db: SupabaseClient, c: DeviceCredentials): Promise<boolean> {
  const tokenHash = createHash('sha256').update(c.deviceToken.toLowerCase()).digest('hex');
  const { data, error } = await db
    .from('device_tokens')
    .select('account_id')
    .eq('token_hash', tokenHash)
    .eq('account_id', c.accountId)
    .eq('device_id', c.deviceId)
    .is('revoked_at', null)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[device-auth] lookup_failed', error.message);
    return false;
  }
  return data !== null;
}
