import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, adminClient, error } = await requireAdmin();
  if (!admin) return NextResponse.json({ error }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { subscription_tier, duration_days } = body;

    if (!["free", "pro"].includes(subscription_tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = adminClient as any;

    const updateData: Record<string, unknown> = {
      subscription_tier,
      updated_at: new Date().toISOString(),
    };

    if (subscription_tier === "free") {
      // Downgrading to free — clear subscription fields
      updateData.subscription_expires_at = null;
      updateData.subscription_store = null;
    } else if (subscription_tier === "pro") {
      // Granting Pro — require duration_days to prevent permanent free pro
      if (!duration_days) {
        return NextResponse.json({ error: "duration_days is required when upgrading to pro" }, { status: 400 });
      }
      const days = Number(duration_days);
      if (!Number.isInteger(days) || days < 1 || days > 3650) {
        return NextResponse.json({ error: "duration_days must be 1-3650" }, { status: 400 });
      }
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
      updateData.subscription_expires_at = expiresAt.toISOString();
      updateData.subscription_store = "admin";
    }

    const { error: updateErr } = await client
      .from("accounts")
      .update(updateData)
      .eq("id", id);

    if (updateErr) throw new Error(`Failed to update: ${updateErr.message}`);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, adminClient, error } = await requireAdmin();
  if (!admin) return NextResponse.json({ error }, { status: 401 });

  try {
    const { id } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = adminClient as any;

    // Get account_id first
    const { data: account } = await client
      .from("accounts")
      .select("account_id")
      .eq("id", id)
      .single();

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Delete configs (uses text VPN-XXXX), device sessions (uses UUID), then account
    const { error: configErr } = await client
      .from("vpn_user_configs")
      .delete()
      .eq("account_id", account.account_id);
    if (configErr) throw new Error(`Failed to delete configs: ${configErr.message}`);

    const { error: sessErr } = await client
      .from("device_sessions")
      .delete()
      .eq("account_id", id);
    if (sessErr) throw new Error(`Failed to delete sessions: ${sessErr.message}`);

    const { error: delErr } = await client
      .from("accounts")
      .delete()
      .eq("id", id);

    if (delErr) throw new Error(`Failed to delete: ${delErr.message}`);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
