import { NextRequest, NextResponse } from 'next/server';
import { createUntypedAdminClient } from '@/lib/supabase/admin';
import nodemailer from 'nodemailer';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createUntypedAdminClient();

    const { data: account, error: lookupError } = await supabase
      .from('accounts')
      .select('account_id')
      .eq('contact_method', 'email')
      .eq('contact_value', normalizedEmail)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error('[restore-account] DB lookup error:', lookupError.message);
    }

    if (account) {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (!smtpHost || !smtpUser || !smtpPass) {
        console.error('[restore-account] Missing SMTP configuration');
        return NextResponse.json({
          success: true,
          message: "If an account exists with this email, we've sent the Account ID.",
        });
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      try {
        const info = await transporter.sendMail({
          from: `"Doppler VPN" <${smtpUser}>`,
          to: normalizedEmail,
          subject: 'Your Doppler VPN Account ID',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0a; color: #ffffff; border-radius: 12px;">
              <h2 style="margin: 0 0 16px; color: #ffffff;">Doppler VPN</h2>
              <p style="color: #a1a1aa; margin: 0 0 24px;">You requested your Account ID. Here it is:</p>
              <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
                <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Account ID</p>
                <p style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; font-family: monospace; letter-spacing: 2px;">${account.account_id}</p>
              </div>
              <p style="color: #a1a1aa; margin: 0 0 16px;">Use this ID to manage your subscription and access your VPN services.</p>
              <a href="https://www.dopplervpn.org/subscribe" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Go to Doppler VPN</a>
              <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
              <p style="color: #71717a; font-size: 12px; margin: 0;">If you did not request this, you can safely ignore this email.</p>
            </div>
          `,
        });
        console.log(`[restore-account] Email sent to ${normalizedEmail}, messageId: ${info.messageId}`);
      } catch (emailError) {
        console.error('[restore-account] SMTP send failed:', emailError instanceof Error ? emailError.message : emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, we've sent the Account ID.",
    });
  } catch (error) {
    console.error('[restore-account] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
