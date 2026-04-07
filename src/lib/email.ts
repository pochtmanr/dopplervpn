import nodemailer from 'nodemailer';
import { isRtlLocale } from '@/i18n/routing';

/** Escape HTML entities to prevent XSS in email templates. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/* ── Locale loader ──────────────────────────────────────────────── */

type EmailMessages = {
  welcome: Record<string, string>;
  receipt: Record<string, string> & { paymentMethods: Record<string, string> };
};

let enFallbackCache: EmailMessages | null = null;

async function loadEmailMessages(locale: string): Promise<{ messages: EmailMessages; locale: string }> {
  // Always preload English as fallback
  if (!enFallbackCache) {
    try {
      const en = await import(`../../messages/en.json`);
      enFallbackCache = en.default.emails as unknown as EmailMessages;
    } catch (err) {
      console.error('[email] failed to load en fallback', err);
      throw new Error('Email fallback messages unavailable');
    }
  }

  if (locale === 'en') {
    return { messages: enFallbackCache, locale: 'en' };
  }

  try {
    const mod = await import(`../../messages/${locale}.json`);
    const msgs = mod.default.emails as unknown as EmailMessages | undefined;
    if (!msgs || !msgs.welcome || !msgs.receipt) {
      console.warn(`[email] locale ${locale} missing emails namespace, falling back to en`);
      return { messages: enFallbackCache, locale: 'en' };
    }
    return { messages: msgs, locale };
  } catch (err) {
    console.warn(`[email] failed to load locale ${locale}, using en`, err);
    return { messages: enFallbackCache, locale: 'en' };
  }
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

function localeDateString(d: Date, locale: string): string {
  try {
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

/* ── Welcome email ──────────────────────────────────────────────── */

interface WelcomeEmailParams {
  to: string;
  accountId: string;
  planName: string;
  expiresAt: string;
  locale?: string;
}

export async function sendWelcomeEmail({
  to,
  accountId,
  planName,
  expiresAt,
  locale = 'en',
}: WelcomeEmailParams) {
  const transporter = getTransporter();
  const { messages, locale: resolvedLocale } = await loadEmailMessages(locale);
  const w = messages.welcome;
  const rtl = isRtlLocale(resolvedLocale);
  const dir = rtl ? 'rtl' : 'ltr';
  const align = rtl ? 'right' : 'left';

  const safeAccountId = escapeHtml(accountId);
  const safePlanName = escapeHtml(planName);
  const safeExpiresAt = escapeHtml(expiresAt);

  const supportEmail = 'support@dopplervpn.org';
  const supportTelegram = '@DopplerSupportBot';
  const footerHtml = escapeHtml(
    interpolate(w.footer, { supportEmail, supportTelegram }),
  )
    .replace(escapeHtml(supportEmail), `<a href="mailto:${supportEmail}">${supportEmail}</a>`)
    .replace(escapeHtml(supportTelegram), `<a href="https://t.me/DopplerSupportBot">${supportTelegram}</a>`);

  const html = `<!DOCTYPE html>
<html lang="${resolvedLocale}" dir="${dir}">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;">
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;text-align:${align};direction:${dir};">
  <h1 style="color:#1a1a2e;font-size:24px;">${escapeHtml(w.heading)}</h1>
  <p style="color:#555;font-size:16px;">${escapeHtml(w.body)}</p>

  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:24px 0;">
    <p style="margin:0 0 8px;color:#555;font-size:14px;">${escapeHtml(w.accountIdLabel)}</p>
    <p style="margin:0;font-size:20px;font-weight:bold;font-family:monospace;color:#1a1a2e;">${safeAccountId}</p>
    <p style="margin:8px 0 0;color:#888;font-size:12px;">${escapeHtml(w.accountIdHint)}</p>
  </div>

  <p style="color:#555;font-size:14px;"><strong>${escapeHtml(w.planLabel)}:</strong> ${safePlanName}</p>
  <p style="color:#555;font-size:14px;"><strong>${escapeHtml(w.expiresLabel)}:</strong> ${safeExpiresAt}</p>

  <h2 style="color:#1a1a2e;font-size:18px;margin-top:32px;">${escapeHtml(w.downloadHeading)}</h2>
  <ul style="color:#555;font-size:14px;line-height:2;padding-${rtl ? 'right' : 'left'}:20px;">
    <li><a href="https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773">${escapeHtml(w.iosLink)}</a></li>
    <li><a href="https://play.google.com/store/apps/details?id=org.dopplervpn.android">${escapeHtml(w.androidLink)}</a></li>
    <li><a href="https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773">${escapeHtml(w.macLink)}</a></li>
    <li><a href="https://www.dopplervpn.org/${resolvedLocale}/downloads">${escapeHtml(w.windowsLink)}</a></li>
  </ul>
  <p style="color:#555;font-size:14px;">${escapeHtml(w.openHint)}</p>

  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;" />
  <p style="color:#999;font-size:12px;">${footerHtml}</p>
</div>
</body>
</html>`;

  await transporter.sendMail({
    from: '"Doppler VPN" <support@simnetiq.store>',
    to,
    subject: w.subject,
    html,
  });
}

/* ── Receipt email ──────────────────────────────────────────────── */

export type ReceiptPaymentMethod = 'card' | 'apple_pay' | 'google_pay' | 'revolut' | string;

interface ReceiptEmailParams {
  to: string;
  accountId: string;
  planId: string;
  planLabel: string;
  amount: number; // cents
  currency: string;
  startsAt: Date;
  expiresAt: Date;
  orderId: string;
  paymentMethod?: ReceiptPaymentMethod;
  locale?: string;
}

function formatPaymentMethod(pm: string | undefined, labels: Record<string, string>): string {
  if (!pm) return labels.revolut || 'Revolut';
  const key = pm.toLowerCase();
  return labels[key] || labels.revolut || 'Revolut';
}

function formatAmount(amount: number, currency: string): string {
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

export async function sendReceiptEmail({
  to,
  accountId,
  planId,
  planLabel,
  amount,
  currency,
  startsAt,
  expiresAt,
  orderId,
  paymentMethod,
  locale = 'en',
}: ReceiptEmailParams) {
  const transporter = getTransporter();
  const { messages, locale: resolvedLocale } = await loadEmailMessages(locale);
  const r = messages.receipt;
  const rtl = isRtlLocale(resolvedLocale);
  const dir = rtl ? 'rtl' : 'ltr';
  const align = rtl ? 'right' : 'left';
  const oppositeAlign = rtl ? 'left' : 'right';

  const safeAccountId = escapeHtml(accountId);
  const safePlanLabel = escapeHtml(planLabel);
  const safeOrderId = escapeHtml(orderId);
  const safeAmount = escapeHtml(formatAmount(amount, currency));
  const safePm = escapeHtml(formatPaymentMethod(paymentMethod, r.paymentMethods));
  const safeStarts = escapeHtml(localeDateString(startsAt, resolvedLocale));
  const safeExpires = escapeHtml(localeDateString(expiresAt, resolvedLocale));

  const subject = interpolate(r.subject, { plan: planLabel });
  const supportEmail = 'support@dopplervpn.org';
  const refundText = interpolate(r.refund, { email: supportEmail });
  // Inject the support email link into the refund line.
  const refundHtml = escapeHtml(refundText).replace(
    escapeHtml(supportEmail),
    `<a href="mailto:${supportEmail}" style="color:#2563eb;text-decoration:none;">${supportEmail}</a>`,
  );
  const transactionalHtml = escapeHtml(
    interpolate(r.transactionalNote, { planId }),
  ).replace(
    escapeHtml(planId),
    `<code style="font-family:ui-monospace,Menlo,monospace;">${escapeHtml(planId)}</code>`,
  );

  const row = (label: string, value: string, mono = false, last = false) => `
    <tr>
      <td style="padding:14px 16px;${last ? '' : 'border-bottom:1px solid #f1f5f9;'}font-size:13px;color:#64748b;text-align:${align};">${escapeHtml(label)}</td>
      <td align="${oppositeAlign}" style="padding:14px 16px;${last ? '' : 'border-bottom:1px solid #f1f5f9;'}${mono ? 'font-family:ui-monospace,Menlo,monospace;font-size:12px;' : 'font-size:14px;'}color:#0f172a;${mono ? 'word-break:break-all;' : 'font-weight:600;'}text-align:${oppositeAlign};">${value}</td>
    </tr>`;

  const html = `<!DOCTYPE html>
<html lang="${resolvedLocale}" dir="${dir}">
<head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f5f7;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;direction:${dir};">
  <tr><td align="center">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e6e8eb;direction:${dir};">
      <tr><td style="padding:28px 32px 8px 32px;text-align:${align};">
        <img src="https://www.dopplervpn.org/logo.png" alt="Doppler VPN" width="40" height="40" style="display:block;border:0;">
      </td></tr>
      <tr><td style="padding:8px 32px 0 32px;text-align:${align};">
        <h1 style="margin:0;font-size:24px;line-height:1.3;color:#0f172a;font-weight:700;">${escapeHtml(r.heading)}</h1>
        <p style="margin:8px 0 0;color:#475569;font-size:15px;line-height:1.5;">${escapeHtml(r.intro)}</p>
      </td></tr>
      <tr><td style="padding:24px 32px 8px 32px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid #e6e8eb;border-radius:10px;">
          ${row(r.plan, safePlanLabel)}
          ${row(r.orderId, safeOrderId, true)}
          ${row(r.accountId, safeAccountId, true)}
          ${row(r.amount, safeAmount)}
          ${row(r.paymentMethod, safePm)}
          ${row(r.startDate, safeStarts)}
          ${row(r.renews, safeExpires, false, true)}
        </table>
      </td></tr>

      <tr><td style="padding:24px 32px 0 32px;text-align:${align};">
        <h2 style="margin:0 0 12px;font-size:17px;color:#0f172a;font-weight:700;">${escapeHtml(r.stepsHeading)}</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr><td style="padding:8px 0;font-size:14px;color:#334155;text-align:${align};"><strong style="color:#0f172a;">1.</strong> ${escapeHtml(r.step1)}</td></tr>
          <tr><td style="padding:8px 0;font-size:14px;color:#334155;text-align:${align};"><strong style="color:#0f172a;">2.</strong> ${escapeHtml(r.step2)}</td></tr>
          <tr><td style="padding:8px 0;font-size:14px;color:#334155;text-align:${align};"><strong style="color:#0f172a;">3.</strong> ${escapeHtml(r.step3)}</td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:20px 32px 8px 32px;text-align:${align};">
        <h2 style="margin:0 0 12px;font-size:17px;color:#0f172a;font-weight:700;">${escapeHtml(r.downloadHeading)}</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding:6px;width:50%;">
              <a href="https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773" style="display:block;text-align:center;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 14px;border-radius:8px;">${escapeHtml(r.ios)}</a>
            </td>
            <td style="padding:6px;width:50%;">
              <a href="https://play.google.com/store/apps/details?id=org.dopplervpn.android" style="display:block;text-align:center;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 14px;border-radius:8px;">${escapeHtml(r.android)}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:6px;width:50%;">
              <a href="https://www.dopplervpn.org/${resolvedLocale}/downloads" style="display:block;text-align:center;background:#1e293b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 14px;border-radius:8px;">${escapeHtml(r.windows)}</a>
            </td>
            <td style="padding:6px;width:50%;">
              <a href="https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773" style="display:block;text-align:center;background:#1e293b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 14px;border-radius:8px;">${escapeHtml(r.mac)}</a>
            </td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:20px 32px 8px 32px;text-align:${align};">
        <p style="margin:0;font-size:13px;color:#475569;line-height:1.55;">
          <strong style="color:#0f172a;">${escapeHtml(r.refundBold)}</strong> ${refundHtml}
        </p>
      </td></tr>

      <tr><td style="padding:24px 32px 28px 32px;border-top:1px solid #f1f5f9;text-align:${align};">
        <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
          ${escapeHtml(r.footer)}<br>
          ${transactionalHtml}
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    r.heading,
    ``,
    r.intro,
    ``,
    `${r.plan}: ${planLabel}`,
    `${r.orderId}: ${orderId}`,
    `${r.accountId}: ${accountId}`,
    `${r.amount}: ${formatAmount(amount, currency)}`,
    `${r.paymentMethod}: ${formatPaymentMethod(paymentMethod, r.paymentMethods)}`,
    `${r.startDate}: ${localeDateString(startsAt, resolvedLocale)}`,
    `${r.renews}: ${localeDateString(expiresAt, resolvedLocale)}`,
    ``,
    `${r.stepsHeading}:`,
    `  1. ${r.step1}`,
    `  2. ${r.step2}`,
    `  3. ${r.step3}`,
    ``,
    `${r.downloadHeading}:`,
    `  ${r.ios}: https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773`,
    `  ${r.android}: https://play.google.com/store/apps/details?id=org.dopplervpn.android`,
    `  ${r.mac}: https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773`,
    `  ${r.windows}: https://www.dopplervpn.org/${resolvedLocale}/downloads`,
    ``,
    refundText,
    ``,
    r.footer,
  ].join('\n');

  const fromAddress = process.env.RECEIPT_FROM_ADDRESS || process.env.SMTP_USER || 'support@dopplervpn.org';

  await transporter.sendMail({
    from: `"Doppler VPN" <${fromAddress}>`,
    to,
    subject,
    html,
    text,
  });
}
