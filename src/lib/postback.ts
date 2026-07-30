import "server-only";

import { createUntypedAdminClient } from "@/lib/supabase/admin";

/**
 * Server-to-server conversion postbacks for paid acquisition campaigns.
 *
 * The ad network gives us a postback URL and one campaign id per goal:
 *
 *   http://postback.info/postback.php?cid=<goal cid>&click_id=<their click id>
 *
 * `click_id` is a value THEIR tracker puts on our landing URLs; we capture it in
 * src/middleware.ts, keep it in a first-party cookie, and echo it back here when
 * the visitor converts. That match is how they attribute a payout to a publisher.
 *
 * This must stay server-side: the postback host is plain http:// while the site is
 * https://, so a browser-side pixel would be blocked as mixed content.
 */

export type PostbackGoal = "download" | "purchase";

/** One campaign id per goal. A goal with no cid configured never fires. */
function cidFor(goal: PostbackGoal): string | undefined {
  const cid =
    goal === "download"
      ? process.env.POSTBACK_CID_DOWNLOAD
      : process.env.POSTBACK_CID_PURCHASE;
  return cid?.trim() || undefined;
}

const POSTBACK_BASE_URL =
  process.env.POSTBACK_BASE_URL ?? "http://postback.info/postback.php";

const POSTBACK_TIMEOUT_MS = 5000;

/** Keep the stored response readable in the admin/SQL view without bloating rows. */
const RESPONSE_SNIPPET_LEN = 200;

export interface FirePostbackInput {
  clickId: string | null | undefined;
  goal: PostbackGoal;
  /** Context stored alongside the conversion so campaign numbers can be audited. */
  meta?: {
    source?: string | null;
    arch?: string | null;
    locale?: string | null;
    pagePath?: string | null;
  };
}

function log(stage: string, data: Record<string, unknown>) {
  console.log(`[postback] ${stage}`, JSON.stringify(data));
}

/**
 * Fire one conversion postback, at most once per (click_id, goal).
 *
 * Never throws and never returns a value the caller needs — call it from `after()`
 * so a slow or dead tracker can't delay the user's response.
 */
export async function firePostback({
  clickId,
  goal,
  meta,
}: FirePostbackInput): Promise<void> {
  if (!clickId) return;

  const cid = cidFor(goal);
  if (!cid) {
    // Expected while a goal is still waiting on a campaign id from the agency.
    log("skip_no_cid", { goal, clickId });
    return;
  }

  let supabase;
  try {
    supabase = createUntypedAdminClient();
  } catch (err) {
    log("skip_no_supabase", { goal, err: (err as Error).message });
    return;
  }

  // Claim the conversion first. The unique index on (click_id, goal) is what makes
  // this idempotent — a double-click or a provider webhook retry loses the race and
  // stops here rather than inflating the advertiser's counter.
  const { data: claimed, error: claimError } = await supabase
    .from("ad_conversions")
    .insert({
      click_id: clickId,
      goal,
      source: meta?.source ?? null,
      arch: meta?.arch ?? null,
      locale: meta?.locale ?? null,
      page_path: meta?.pagePath ?? null,
      status: "pending",
    })
    .select("id")
    .single();

  if (claimError) {
    // 23505 = unique_violation: already fired for this click + goal.
    if (claimError.code === "23505") {
      log("duplicate_skip", { goal, clickId });
    } else {
      log("claim_failed", { goal, clickId, err: claimError.message });
    }
    return;
  }

  const url = new URL(POSTBACK_BASE_URL);
  url.searchParams.set("cid", cid);
  url.searchParams.set("click_id", clickId);

  let status: "ok" | "failed" = "failed";
  let response = "";

  try {
    const res = await fetch(url, {
      // Conversion counters must never be served from a cache.
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(POSTBACK_TIMEOUT_MS),
      headers: { "User-Agent": "dopplervpn-landing" },
    });
    const body = await res.text().catch(() => "");
    status = res.ok ? "ok" : "failed";
    response = `${res.status} ${body}`.slice(0, RESPONSE_SNIPPET_LEN);
    log(status === "ok" ? "fired" : "rejected", {
      goal,
      clickId,
      httpStatus: res.status,
    });
  } catch (err) {
    response = String((err as Error).message).slice(0, RESPONSE_SNIPPET_LEN);
    log("fire_failed", { goal, clickId, err: response });
  }

  // The row stays behind either way: a 'failed' row is the record we need to
  // re-fire manually or to dispute the agency's invoice.
  const { error: updateError } = await supabase
    .from("ad_conversions")
    .update({ status, response })
    .eq("id", claimed.id);

  if (updateError) {
    log("status_update_failed", { goal, clickId, err: updateError.message });
  }
}
