import { timingSafeEqual } from 'crypto';

/**
 * Timing-safe string comparison to prevent timing attacks on API keys.
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Validate the BLOG_API_KEY from Authorization header (timing-safe).
 */
export function requireBlogApiKey(request: Request): boolean {
  const apiKey = process.env.BLOG_API_KEY;
  if (!apiKey) {
    throw new Error('BLOG_API_KEY not configured');
  }

  const auth = request.headers.get('authorization');
  if (!auth) return false;

  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  return safeCompare(token, apiKey);
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

/**
 * Validate webhook URL to prevent SSRF attacks.
 * Only allows HTTPS URLs to non-private IP ranges.
 */
export function isAllowedWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;

    const hostname = parsed.hostname;

    // Block private/internal hostnames
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') ||
      hostname.startsWith('192.168.') ||
      hostname === '169.254.169.254' || // AWS metadata
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
