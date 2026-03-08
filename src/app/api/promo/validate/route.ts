import { NextRequest, NextResponse } from "next/server";
import { createUntypedAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { code, account_id, plan } = await req.json();

  if (!code || !account_id || !plan) {
    return NextResponse.json({ error: "code, account_id, plan required" }, { status: 400 });
  }

  const supabase = createUntypedAdminClient();

  const { data: promo, error: promoError } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .single();

  if (promoError || !promo) {
    return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ error: "Promo code expired" }, { status: 410 });
  }

  if (promo.max_redemptions && promo.current_redemptions >= promo.max_redemptions) {
    return NextResponse.json({ error: "Promo code fully redeemed" }, { status: 410 });
  }

  if (promo.applicable_plans && !promo.applicable_plans.includes(plan)) {
    return NextResponse.json({ error: "Code not valid for this plan" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("promo_redemptions")
    .select("id")
    .eq("promo_code_id", promo.id)
    .eq("account_id", account_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already redeemed" }, { status: 409 });
  }

  return NextResponse.json({
    valid: true,
    discount_percent: promo.discount_percent,
    code: promo.code,
    promo_id: promo.id,
  });
}
