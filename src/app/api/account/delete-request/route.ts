import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

const ACCOUNT_ID_REGEX = /^VPN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { limit: 3, windowMs: 3600_000, prefix: 'delete-request' });
  if (rl) return rl;

  try {
    const { account_id, email } = await req.json();

    if (!account_id || !ACCOUNT_ID_REGEX.test(account_id)) {
      return NextResponse.json({ error: 'Invalid account ID format' }, { status: 400 });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createUntypedAdminClient();

    // Verify account exists and email matches
    const { data: account } = await supabase
      .from('accounts')
      .select('id, contact_value, contact_method')
      .eq('account_id', account_id)
      .single();

    // Always return generic success to not reveal whether account exists
    if (!account || account.contact_method !== 'email' || account.contact_value !== normalizedEmail) {
      return NextResponse.json({
        success: true,
        message: 'If the account exists and email matches, a confirmation link has been sent.',
      });
    }

    // Generate deletion token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Store deletion request in account metadata (using a simple approach —
    // store token in a deletion_requests-like pattern via the accounts table)
    await supabase.from('accounts').update({
      deletion_token: token,
      deletion_token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }).eq('id', account.id);

    // Send confirmation email
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const confirmUrl = `https://www.dopplervpn.org/en/delete-account/confirm?token=${token}`;

      await transporter.sendMail({
        from: '"Doppler VPN" <support@simnetiq.store>',
        to: normalizedEmail,
        subject: 'Confirm Account Deletion — Doppler VPN',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #ffffff; border-radius: 12px;">
            <h2 style="margin: 0 0 16px; color: #ffffff;">Doppler VPN</h2>
            <p style="color: #a1a1aa; margin: 0 0 24px;">You requested to delete your Doppler VPN account. Click the button below to confirm.</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${confirmUrl}" style="display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Confirm Deletion</a>
            </div>
            <p style="color: #a1a1aa; font-size: 14px;">This link expires in 24 hours. If you did not request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
            <p style="color: #71717a; font-size: 12px; margin: 0;">SIMNETIQ LTD — support@simnetiq.store</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('[delete-request] Email send failed:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'If the account exists and email matches, a confirmation link has been sent.',
    });
  } catch (error) {
    console.error('[delete-request] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
