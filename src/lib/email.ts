import nodemailer from 'nodemailer';

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

interface WelcomeEmailParams {
  to: string;
  accountId: string;
  planName: string;
  expiresAt: string;
}

export async function sendWelcomeEmail({ to, accountId, planName, expiresAt }: WelcomeEmailParams) {
  const transporter = getTransporter();

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="color: #1a1a2e; font-size: 24px;">Welcome to Doppler Pro!</h1>
      <p style="color: #555; font-size: 16px;">Your subscription is now active.</p>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 8px; color: #555; font-size: 14px;">Your Account ID:</p>
        <p style="margin: 0; font-size: 20px; font-weight: bold; font-family: monospace; color: #1a1a2e;">${accountId}</p>
        <p style="margin: 8px 0 0; color: #888; font-size: 12px;">Save this — it works across all your devices.</p>
      </div>

      <p style="color: #555; font-size: 14px;"><strong>Plan:</strong> ${planName}</p>
      <p style="color: #555; font-size: 14px;"><strong>Active until:</strong> ${expiresAt}</p>

      <h2 style="color: #1a1a2e; font-size: 18px; margin-top: 32px;">Download Doppler VPN</h2>
      <ul style="color: #555; font-size: 14px; line-height: 2;">
        <li><a href="https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773">iOS — App Store</a></li>
        <li><a href="https://www.dopplervpn.org/downloads/doppler-vpn-v1.2.0.apk">Android — Download APK</a></li>
        <li><a href="https://apps.apple.com/us/app/doppler-vpn-fast-secure/id6757091773">macOS — Mac App Store</a></li>
      </ul>
      <p style="color: #555; font-size: 14px;">Open the app and your Pro subscription will be active automatically.</p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
      <p style="color: #999; font-size: 12px;">
        Need help? Contact us at <a href="https://t.me/DopplerSupportBot">@DopplerSupportBot</a> on Telegram
        or email support@simnetiq.store.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: '"Doppler VPN" <support@simnetiq.store>',
    to,
    subject: 'Welcome to Doppler Pro',
    html,
  });
}
