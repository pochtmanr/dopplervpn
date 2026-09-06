# Deploying `revenuecat-webhook`

**Status as of 2026-09-06: the code in `index.ts` is CHANGED and NOT DEPLOYED.
Do not deploy it yet.** The change depends on a database migration that has not
been applied.

---

## 1. Order — this one is not optional

`supabase/migrations/20260906T100300_revoke_subscription_guards.sql` (in the
**VPnReact** repo, which is where the schema lives) must be applied **before**
this function is deployed.

The new code calls:

```ts
supabase.rpc("revoke_subscription", {
  p_account_id, p_original_transaction_id, p_reason
})
```

The function live today takes **one** argument. **PostgREST resolves an RPC by
the set of argument names sent**, so against the current 1-arg function this is
`PGRST202` — *"Could not find the function public.revoke_subscription(...)"* —
and **every EXPIRATION and every refund silently stops revoking**. The webhook
would still answer HTTP 200 and RevenueCat would never retry.

The reverse order is safe: migration `T100300` gives both new arguments
defaults, so the currently deployed function's one-argument call keeps
resolving. That is the whole reason they are defaulted.

```
  1. apply VPnReact/supabase/migrations/20260906T100000_subscription_audit.sql
  2. apply … 20260906T100200_claim_subscription_guards.sql
  3. apply … 20260906T100300_revoke_subscription_guards.sql   <- the hard dependency
  4. verify (each migration has a VERIFY block in its trailing comments)
  5. THEN deploy this function
```

## 2. Clear `supabase/.temp/` first

`landing/supabase/.temp/project-ref` contains **`seakhlgyzkerxabitgoo`**, which
is **the wrong project**. So does `pooler-url`. The correct project is
**`fzlrhmjdjjzcgstaeblu`**. This trap has cost a session before.

```bash
cd landing
rm -rf supabase/.temp
supabase link --project-ref fzlrhmjdjjzcgstaeblu
supabase functions deploy revenuecat-webhook --project-ref fzlrhmjdjjzcgstaeblu
```

Pass `--project-ref` explicitly on the deploy too, not just on the link.

## 3. Check the secret survived

The function fails **closed** when `REVENUECAT_WEBHOOK_SECRET` is unset — it
returns HTTP 500 to every request rather than accepting unauthenticated events,
which would let anyone self-grant Pro.

```bash
supabase secrets list --project-ref fzlrhmjdjjzcgstaeblu | grep REVENUECAT
```

If it is missing, set it **before** deploying, and make it match the
Authorization header configured in the RevenueCat dashboard.

## 4. What changed in this deploy

| Change | Why |
|---|---|
| `storeForRpc(platform)` replaces the four inline `platform === "macos" ? "app_store" : platform` maps (was `:141`, `:161`, `:184`, `:299`) | The old expression sent `"ios"` and `"android"` as `p_store`. Both violate the committed CHECK on `accounts.subscription_store` and on `subscription_ownership.store`, and they defeat every server-side guard that asks "is this a store subscription?". |
| `EXPIRATION` resolves the current owner via `get_subscription_owner` before revoking | It used to revoke `resolveAccountId(event)` blind. After a transfer that is the wrong account: the innocent one gets downgraded and the real owner keeps Pro. `RENEWAL` has always done this lookup; now all three do. |
| `CANCELLATION` / `CUSTOMER_SUPPORT` does the same | Same defect, same fix. |
| Both pass `p_original_transaction_id` and `p_reason` | The RPC refuses to revoke when the transaction on the row is not this one, and the reason lands in `subscription_audit`. |
| The `subscription_ownership` delete on refund is now conditional on `revokeData.action === "revoked"` | The RPC can now legitimately **skip** (non-store row, transaction mismatch). Deleting ownership for a subscription we did not revoke orphans a live entitlement and breaks `verify_restore` for that customer. |
| Every branch logs its RPC result | `claim result` used to be logged on exactly one branch. Revokes were logged nowhere at all, which is why "did the webhook do this?" has never been answerable. |
| **An RPC transport failure now returns HTTP 500 instead of 200** | RevenueCat retries a non-2xx and does **not** retry a 200. Deployed out of order, every revoke would have logged `PGRST202`, answered 200, and been lost permanently. A **refusal** (`{success:false}`, `{action:"skipped"}`) is deliberately NOT treated as a failure — the RPC was reached, understood the event and declined; retrying gives the same answer forever. |
| **An RPC that returns `{success:false, error:'database_error'}` now forces a 500 too** | The RPCs answer a refusal and a failure with the same HTTP 200 and the same supabase-js shape — `error` is null and the verdict is inside `data`. So checking only `error` treated a deadlock (40P01), a CHECK violation (23514) or a statement timeout exactly like a successful claim: `claim_subscription` catches all of those in its `EXCEPTION WHEN OTHERS` and returns `database_error`, and RevenueCat never retried. Known refusals (`account_not_found`, `transaction_id_required`, `action:'ignored'`, `action:'skipped'`) stay at 200; anything else with `success:false` is unknown territory and is retried. |
| A revoke is **skipped entirely** when the event carries no `original_transaction_id` | `revoke_subscription`'s transaction-mismatch guard only fires when the argument is *supplied*; pass null and it revokes whatever account it was handed. On a refund **replay** the ownership row was deleted by the first delivery, so the owner lookup falls back to the RC `app_user_id` — a different account from the real owner after a transfer. No transaction id, no revoke; the expiry sweeper collects the row three days after it genuinely lapses. Logged as `revoke SKIPPED`, recorded as `revoke_skipped: true`, still answers 200. |
| A failed `webhook_log_event` or `subscription_ownership` delete counts as a failure too | A trail with holes in it is what made the CKC4 downgrade unreconstructable; and a revoked subscription whose ownership row survives is a half-applied refund — the account is free, the transaction is still owned, nobody else can claim it, and `verify_restore` keeps answering for it. Replay is safe: `claim_subscription` takes `GREATEST` of current and requested expiry, and a second revoke answers `skipped` because the store is NULL by then. |

## 5. Verify after deploying

Watch the function logs while a real event lands (or replay one from the
RevenueCat dashboard):

```bash
supabase functions logs revenuecat-webhook --project-ref fzlrhmjdjjzcgstaeblu
```

Expect, per event type:

- `[webhook] INITIAL_PURCHASE claim (account=VPN-…) result: {"success":true,"action":"claimed",…}`
- `[webhook] RENEWAL claim (account=VPN-…) result: {"success":true,"action":"updated",…}`
- `[webhook] EXPIRATION revoke (owner=VPN-…, owner_found=true, rc_user=VPN-…) result: {"success":true,"action":"revoked",…}`

**A `"action":"skipped"` on a revoke is not a failure.** It means the account's
Pro came from a channel RevenueCat does not speak for (`revolut`, `oxapay`,
`admin`), or the transaction on the row is not the one in the event. Those are
exactly the revokes that used to happen and used to be wrong. The webhook still
answers 200 for these, so RevenueCat does not retry.

**What you must NOT see** is this, which is the out-of-order deploy:

```
[webhook] EXPIRATION | RPC revoke_subscription FAILED: {"code":"PGRST202",…}
[webhook] EXPIRATION | returning 500 so RevenueCat retries; 1 RPC failure(s): …
```

That means migration `20260906T100300` has not been applied. Apply it — the
events are not lost, because a 500 makes RevenueCat retry.

You should also not see this, which is a fault **inside** the RPC — a deadlock,
a CHECK violation, a statement timeout:

```
[webhook] RENEWAL | claim_subscription returned an UNSUCCESSFUL result that is
  not a known refusal: {"success":false,"error":"database_error","sqlstate":"23514", …}
```

Read the `sqlstate`: `23514` is a CHECK violation (see hole #12 — the
`subscription_store` CHECK), `23505` a unique violation, `40P01` a deadlock,
`57014` a statement timeout. These are three completely different bugs and the
`sqlstate` is the only thing that tells them apart.

Then confirm the trail exists, in the Supabase SQL editor:

```sql
SELECT changed_at, account_id, old_tier, new_tier,
       old_expires_at, new_expires_at, writer_fn, reason
FROM public.subscription_audit
WHERE writer_fn IN ('revoke_subscription', 'claim_subscription', 'subscription_apply_grant')
ORDER BY changed_at DESC
LIMIT 20;
```

Also confirm no `"ios"` or `"android"` is being written any more:

```sql
SELECT new_store, count(*)
FROM public.subscription_audit
WHERE changed_at > now() - interval '1 day'
GROUP BY new_store;
-- expect app_store / play_store / revolut / oxapay / admin / NULL. Never ios, never android.
```

## 6. Rollback

Roll back **this function first**, then the migration — never the other way
round. A deployed function sending three arguments at a restored one-argument
RPC fails every revoke with `PGRST202`.

```bash
# redeploy the previous revision from git
git -C landing show <previous-sha>:supabase/functions/revenuecat-webhook/index.ts \
  > supabase/functions/revenuecat-webhook/index.ts
supabase functions deploy revenuecat-webhook --project-ref fzlrhmjdjjzcgstaeblu
```
