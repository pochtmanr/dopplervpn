import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Platforms that are, or were, announced ahead of a download. Anything else is refused. */
const PLATFORMS = ['windows', 'linux'] as const;

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 5, windowMs: 60_000, prefix: 'waitlist' });
  if (rl) return rl;

  try {
    const body = await req.json();
    const { email, platform, locale } = body as {
      email?: string;
      platform?: string;
      locale?: string;
    };

    if (typeof email !== 'string' || email.length > 254 || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (platform !== undefined && !(PLATFORMS as readonly string[]).includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();

    const { error } = await supabase.from('waitlist').insert({
      email: email.toLowerCase().trim(),
      platform: platform || 'windows',
      locale: typeof locale === 'string' ? locale.slice(0, 12) : null,
    });

    if (error) {
      // Unique constraint violation = already signed up
      if (error.code === '23505') {
        return NextResponse.json({ success: true, existing: true });
      }
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    return NextResponse.json({ success: true, existing: false });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
