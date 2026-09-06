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

// derivePlatform() answers "which app was this bought in" — ios / macos /
// android / stripe. accounts.subscription_store answers a different question:
// "which STORE holds this subscription", and its vocabulary is app_store /
// play_store / stripe. Sending the platform straight through is how "ios" and
// "android" ended up in a column whose committed CHECK forbids them, and how
// every server-side guard that asks "is this a store subscription?" started
// getting the wrong answer for those rows.
//
// The database normalises these too (public.subscription_normalize_store), so
// the two layers agree; this one exists so we stop writing bad values in the
// first place.
function storeForRpc(platform: string): string {
  switch (platform) {
    case "ios":
    case "macos":
      return "app_store";
    case "android":
      return "play_store";
    default:
      return platform; // "stripe", and anything derivePlatform grows later
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

// Which account actually holds this subscription right now.
//
// RENEWAL has always done this (the RC app_user_id and the account that owns
// the transaction routinely differ after a transfer). EXPIRATION and
// CANCELLATION did NOT, and revoked whatever resolveAccountId() returned — so
// an expiry could downgrade an account that never held the subscription while
// the real owner kept it. Same lookup, same reason, now used by all three.
//
// Falls back to the event's own account id when there is no ownership row:
// web-purchased Pro creates no ownership row at all, and a first purchase that
// expires before it is ever claimed has none either.
async function resolveOwnerAccountId(
  originalTxnId: string | undefined,
  fallbackAccountId: string
): Promise<{ accountId: string; ownerFound: boolean }> {
  if (!originalTxnId) return { accountId: fallbackAccountId, ownerFound: false };

  const { data: owner, error } = await supabase.rpc("get_subscription_owner", {
    p_original_transaction_id: originalTxnId,
  });

  if (error) {
    console.error(`[webhook] get_subscription_owner failed for txn=${originalTxnId}:`, error);
    return { accountId: fallbackAccountId, ownerFound: false };
  }

  if (owner?.found && owner.current_owner) {
    return { accountId: owner.current_owner as string, ownerFound: true };
  }
  return { accountId: fallbackAccountId, ownerFound: false };
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

  // RevenueCat delivers sandbox and StoreKit-test purchases through this same webhook,
  // so without this check a dev build mints real pro: VPN-FMN9-5ZE7-7HWT held production
  // pro off a StoreKitTest transaction. Match only an explicit SANDBOX — an absent or
  // unrecognized environment must still grant, or a real payer could be denied access.
  if ((event.environment ?? "").toUpperCase() === "SANDBOX") {
    console.log(`[webhook] ${type} | account=${accountId} | skipped: sandbox event`);
    return new Response(JSON.stringify({ success: true, skipped: "sandbox" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    switch (type) {
      case "INITIAL_PURCHASE":
      case "NON_RENEWING_PURCHASE": {
        const { data, error } = await supabase.rpc("claim_subscription", {
          p_account_id: accountId,
          p_tier: tier,
          p_expires_at: expiresAt,
          p_original_transaction_id: originalTxnId,
          p_store: storeForRpc(platform),
          p_product_id: productId,
        });
        console.log(
          `[webhook] ${type} claim (account=${accountId}) result:`,
          JSON.stringify(data ?? error)
        );
        break;
      }

      case "RENEWAL": {
        if (originalTxnId) {
          const { data: owner } = await supabase.rpc(
            "get_subscription_owner",
            { p_original_transaction_id: originalTxnId }
          );

          if (owner?.found && owner.current_owner !== accountId) {
            const { data: claimData, error: claimErr } = await supabase.rpc(
              "claim_subscription",
              {
                p_account_id: owner.current_owner,
                p_tier: tier,
                p_expires_at: expiresAt,
                p_original_transaction_id: originalTxnId,
                p_store: storeForRpc(platform),
                p_product_id: productId,
              }
            );
            console.log(
              `[webhook] RENEWAL claim (owner=${owner.current_owner}, rc_user=${accountId}) result:`,
              JSON.stringify(claimData ?? claimErr)
            );

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

        const { data: renewData, error: renewErr } = await supabase.rpc(
          "claim_subscription",
          {
            p_account_id: accountId,
            p_tier: tier,
            p_expires_at: expiresAt,
            p_original_transaction_id: originalTxnId,
            p_store: storeForRpc(platform),
            p_product_id: productId,
          }
        );
        console.log(
          `[webhook] RENEWAL claim (account=${accountId}) result:`,
          JSON.stringify(renewData ?? renewErr)
        );

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
          // Resolve the CURRENT owner, exactly as RENEWAL does. Refunding a
          // subscription that has since been transferred must revoke the
          // account that actually holds it, not the RC app_user_id the event
          // happens to carry.
          const { accountId: ownerId, ownerFound } = await resolveOwnerAccountId(
            originalTxnId,
            accountId
          );

          const { data: revokeData, error: revokeErr } = await supabase.rpc(
            "revoke_subscription",
            {
              p_account_id: ownerId,
              p_original_transaction_id: originalTxnId,
              p_reason: `CANCELLATION:${cancelReason}`,
            }
          );
          console.log(
            `[webhook] CANCELLATION revoke (owner=${ownerId}, owner_found=${ownerFound}, rc_user=${accountId}) result:`,
            JSON.stringify(revokeData ?? revokeErr)
          );

          // Delete the ownership row ONLY when the revoke actually happened.
          // revoke_subscription now SKIPS non-store rows and transaction
          // mismatches, and deleting ownership for a subscription we did not
          // revoke would orphan a live entitlement: verify_restore would stop
          // recognising the customer while their account still says pro.
          if (originalTxnId && revokeData?.action === "revoked") {
            const { error: ownDelErr } = await supabase
              .from("subscription_ownership")
              .delete()
              .eq("original_transaction_id", originalTxnId);
            console.log(
              `[webhook] CANCELLATION ownership delete txn=${originalTxnId}:`,
              ownDelErr ? JSON.stringify(ownDelErr) : "ok"
            );
          }

          await supabase.rpc("webhook_log_event", {
            p_account_id: ownerId,
            p_original_transaction_id: originalTxnId,
            p_event_type: "REFUND",
            p_platform: platform,
            p_rc_event_id: rcEventId,
            p_product_id: productId,
            p_details: {
              cancel_reason: cancelReason,
              rc_app_user_id: accountId,
              owner_found: ownerFound,
              revoke_result: revokeData ?? null,
            },
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
        // Resolve the CURRENT owner first. This branch used to revoke
        // resolveAccountId(event) blind, so an expiry could downgrade an
        // account that had already transferred the subscription away — while
        // the real owner kept Pro it was no longer paying for.
        const { accountId: ownerId, ownerFound } = await resolveOwnerAccountId(
          originalTxnId,
          accountId
        );

        const { data: revokeData, error: revokeErr } = await supabase.rpc(
          "revoke_subscription",
          {
            p_account_id: ownerId,
            p_original_transaction_id: originalTxnId,
            p_reason: "EXPIRATION",
          }
        );
        // Log it on every path. A `skipped` action here is not a failure: it
        // means the account's Pro came from somewhere RevenueCat does not
        // speak for (revolut, oxapay, an admin grant), or the transaction on
        // the row is not this one. Those are exactly the revokes that used to
        // be wrong and silent.
        console.log(
          `[webhook] EXPIRATION revoke (owner=${ownerId}, owner_found=${ownerFound}, rc_user=${accountId}) result:`,
          JSON.stringify(revokeData ?? revokeErr)
        );

        await supabase.rpc("webhook_log_event", {
          p_account_id: ownerId,
          p_original_transaction_id: originalTxnId,
          p_event_type: "EXPIRATION",
          p_platform: platform,
          p_rc_event_id: rcEventId,
          p_product_id: productId,
          p_details: {
            rc_app_user_id: accountId,
            owner_found: ownerFound,
            revoke_result: revokeData ?? null,
          },
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
        const { data: pcData, error: pcErr } = await supabase.rpc(
          "claim_subscription",
          {
            p_account_id: accountId,
            p_tier: tier,
            p_expires_at: expiresAt,
            p_original_transaction_id: originalTxnId,
            p_store: storeForRpc(platform),
            p_product_id: productId,
          }
        );
        console.log(
          `[webhook] PRODUCT_CHANGE claim (account=${accountId}) result:`,
          JSON.stringify(pcData ?? pcErr)
        );

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
