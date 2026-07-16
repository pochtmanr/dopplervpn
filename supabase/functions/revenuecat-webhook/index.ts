import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Constant-time string comparison for the webhook bearer secret.
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function derivePlatform(store: string): string {
  switch (store) {
    case "APP_STORE":
    case "MAC_APP_STORE":
      return store === "MAC_APP_STORE" ? "macos" : "ios";
    case "PLAY_STORE":
      return "android";
    case "STRIPE":
      return "stripe";
    default:
      return "ios";
  }
}

// The app recognizes only the "pro" tier (SubscriptionTier.fromString maps
// everything else to FREE). Products are named vpn_premium_* but the entitlement
// tier is always "pro" — do NOT return "premium" here or the app treats it as free.
function deriveTier(_productId: string): string {
  return "pro";
}

interface RCEvent {
  type: string;
  id: string;
  app_user_id: string;
  original_app_user_id?: string;
  aliases?: string[];
  original_transaction_id?: string;
  product_id?: string;
  expiration_at_ms?: number;
  store?: string;
  environment?: string;
  cancel_reason?: string;
  transferred_from?: string[];
  transferred_to?: string[];
}

// RevenueCat may send a webhook whose top-level app_user_id is an anonymous or
// prior id, with the real VPN-XXXX account id in aliases/original_app_user_id.
// claim_subscription matches on accounts.account_id, so resolve the VPN id here.
function resolveAccountId(event: RCEvent): string {
  const candidates = [
    event.app_user_id,
    event.original_app_user_id,
    ...(event.aliases ?? []),
  ].filter(Boolean) as string[];
  const vpn = candidates.find((c) => /^VPN-/i.test(c));
  return vpn ?? event.app_user_id;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Fail CLOSED: if the shared secret isn't configured, refuse everything rather
  // than accepting unauthenticated events (which would let anyone self-grant pro).
  if (!WEBHOOK_SECRET) {
    console.error("[webhook] REVENUECAT_WEBHOOK_SECRET is not configured; refusing request");
    return new Response("Server misconfigured", { status: 500 });
  }
  if (!safeEqual(req.headers.get("authorization") ?? "", `Bearer ${WEBHOOK_SECRET}`)) {
    console.error("[webhook] Invalid authorization header");
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { event: RCEvent };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const event = body.event;
  if (!event || !event.type) {
    return new Response("Missing event data", { status: 400 });
  }

  const {
    type,
    id: rcEventId,
    original_transaction_id: originalTxnId,
    product_id: productId,
    expiration_at_ms: expirationMs,
    store,
    cancel_reason: cancelReason,
  } = event;

  const platform = derivePlatform(store || "APP_STORE");
  const tier = productId ? deriveTier(productId) : "pro";
  const expiresAt = expirationMs
    ? new Date(expirationMs).toISOString()
    : null;

  const accountId = resolveAccountId(event);

  console.log(
    `[webhook] ${type} | account=${accountId} | app_user_id=${event.app_user_id} | aliases=${JSON.stringify(event.aliases)} | txn=${originalTxnId} | product=${productId}`
  );

  try {
    switch (type) {
      case "INITIAL_PURCHASE":
      case "NON_RENEWING_PURCHASE": {
        const { data } = await supabase.rpc("claim_subscription", {
          p_account_id: accountId,
          p_tier: tier,
          p_expires_at: expiresAt,
          p_original_transaction_id: originalTxnId,
          p_store: platform === "macos" ? "app_store" : platform,
          p_product_id: productId,
        });
        console.log(`[webhook] claim result:`, JSON.stringify(data));
        break;
      }

      case "RENEWAL": {
        if (originalTxnId) {
          const { data: owner } = await supabase.rpc(
            "get_subscription_owner",
            { p_original_transaction_id: originalTxnId }
          );

          if (owner?.found && owner.current_owner !== accountId) {
            await supabase.rpc("claim_subscription", {
              p_account_id: owner.current_owner,
              p_tier: tier,
              p_expires_at: expiresAt,
              p_original_transaction_id: originalTxnId,
              p_store: platform === "macos" ? "app_store" : platform,
              p_product_id: productId,
            });

            await supabase.rpc("webhook_log_event", {
              p_account_id: owner.current_owner,
              p_original_transaction_id: originalTxnId,
              p_event_type: "RENEWAL",
              p_platform: platform,
              p_rc_event_id: rcEventId,
              p_product_id: productId,
              p_expires_at: expiresAt,
              p_details: { rc_app_user_id: accountId, note: "renewed_for_actual_owner" },
            });
            break;
          }
        }

        await supabase.rpc("claim_subscription", {
          p_account_id: accountId,
          p_tier: tier,
          p_expires_at: expiresAt,
          p_original_transaction_id: originalTxnId,
          p_store: platform === "macos" ? "app_store" : platform,
          p_product_id: productId,
        });

        await supabase.rpc("webhook_log_event", {
          p_account_id: accountId,
          p_original_transaction_id: originalTxnId,
          p_event_type: "RENEWAL",
          p_platform: platform,
          p_rc_event_id: rcEventId,
          p_product_id: productId,
          p_expires_at: expiresAt,
        });
        break;
      }

      case "CANCELLATION": {
        if (cancelReason === "CUSTOMER_SUPPORT") {
          await supabase.rpc("revoke_subscription", {
            p_account_id: accountId,
          });

          if (originalTxnId) {
            await supabase
              .from("subscription_ownership")
              .delete()
              .eq("original_transaction_id", originalTxnId);
          }

          await supabase.rpc("webhook_log_event", {
            p_account_id: accountId,
            p_original_transaction_id: originalTxnId,
            p_event_type: "REFUND",
            p_platform: platform,
            p_rc_event_id: rcEventId,
            p_product_id: productId,
            p_details: { cancel_reason: cancelReason },
          });
        } else {
          await supabase.rpc("webhook_log_event", {
            p_account_id: accountId,
            p_original_transaction_id: originalTxnId,
            p_event_type: "CANCELLATION",
            p_platform: platform,
            p_rc_event_id: rcEventId,
            p_product_id: productId,
            p_expires_at: expiresAt,
            p_details: { cancel_reason: cancelReason },
          });
        }
        break;
      }

      case "EXPIRATION": {
        await supabase.rpc("revoke_subscription", {
          p_account_id: accountId,
        });

        await supabase.rpc("webhook_log_event", {
          p_account_id: accountId,
          p_original_transaction_id: originalTxnId,
          p_event_type: "EXPIRATION",
          p_platform: platform,
          p_rc_event_id: rcEventId,
          p_product_id: productId,
        });
        break;
      }

      case "BILLING_ISSUES": {
        await supabase.rpc("webhook_log_event", {
          p_account_id: accountId,
          p_original_transaction_id: originalTxnId,
          p_event_type: "BILLING_ISSUES",
          p_platform: platform,
          p_rc_event_id: rcEventId,
          p_product_id: productId,
          p_expires_at: expiresAt,
        });
        break;
      }

      case "TRANSFER": {
        await supabase.rpc("webhook_log_event", {
          p_account_id: accountId,
          p_original_transaction_id: originalTxnId,
          p_event_type: "TRANSFER",
          p_platform: platform,
          p_rc_event_id: rcEventId,
          p_product_id: productId,
          p_details: {
            transferred_from: event.transferred_from,
            transferred_to: event.transferred_to,
          },
        });
        break;
      }

      case "SUBSCRIBER_ALIAS": {
        await supabase.rpc("webhook_log_event", {
          p_account_id: accountId,
          p_original_transaction_id: originalTxnId,
          p_event_type: "SUBSCRIBER_ALIAS",
          p_platform: platform,
          p_rc_event_id: rcEventId,
        });
        break;
      }

      case "PRODUCT_CHANGE": {
        await supabase.rpc("claim_subscription", {
          p_account_id: accountId,
          p_tier: tier,
          p_expires_at: expiresAt,
          p_original_transaction_id: originalTxnId,
          p_store: platform === "macos" ? "app_store" : platform,
          p_product_id: productId,
        });

        await supabase.rpc("webhook_log_event", {
          p_account_id: accountId,
          p_original_transaction_id: originalTxnId,
          p_event_type: "PRODUCT_CHANGE",
          p_platform: platform,
          p_rc_event_id: rcEventId,
          p_product_id: productId,
          p_expires_at: expiresAt,
        });
        break;
      }

      default: {
        await supabase.rpc("webhook_log_event", {
          p_account_id: accountId,
          p_original_transaction_id: originalTxnId,
          p_event_type: "INITIAL_PURCHASE",
          p_platform: platform,
          p_rc_event_id: rcEventId,
          p_details: { unknown_type: type, raw: body },
        });
        break;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(`[webhook] Error processing ${type}:`, err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
