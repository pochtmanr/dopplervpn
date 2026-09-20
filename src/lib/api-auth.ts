import { timingSafeEqual } from 'crypto';

/**
 * Shared-secret checks for the routes the native clients call.
 *
 * `requireBlogApiKey` and `isAllowedWebhookUrl` were removed on 2026-09-18:
 * the blog write-path moved to `doppler-admin`, and nothing here had consumed
 * either for months.
 */

/**
 * Timing-safe string comparison to prevent timing attacks on API keys.
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Validate an internal API secret for app-to-server calls.
 * The app must send X-API-Key header with the value of APP_API_SECRET env var.
 */
export function requireAppApiKey(request: Request): boolean {
  const secret = process.env.APP_API_SECRET;
  if (!secret) {
    throw new Error('APP_API_SECRET not configured');
  }

  const provided = request.headers.get('x-api-key');
  if (!provided) return false;

  return safeCompare(provided, secret);
}
