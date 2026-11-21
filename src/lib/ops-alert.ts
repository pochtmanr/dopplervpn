import 'server-only';

/**
 * Best-effort DM to the operator for payment events a human must look at
 * (refunds, a paid callback we could not match). Silent no-op when
 * OPS_ALERT_BOT_TOKEN / OPS_ALERT_CHAT_ID are not set. Never throws: an alert
 * must not change a webhook's response.
 */
export async function opsAlert(text: string): Promise<void> {
  const token = process.env.OPS_ALERT_BOT_TOKEN;
  const chatId = process.env.OPS_ALERT_CHAT_ID;
  console.error(`[ops-alert] ${text}`);
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 3500), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error('[ops-alert] send_failed', err instanceof Error ? err.message : err);
  }
}
