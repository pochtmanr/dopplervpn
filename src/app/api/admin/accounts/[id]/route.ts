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
    const { subscription_tier } = body;

    if (!["free", "pro", "premium"].includes(subscription_tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateErr } = await (adminClient as any)
      .from("accounts")
      .update({ subscription_tier })
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
    await client
      .from("vpn_user_configs")
      .delete()
      .eq("account_id", account.account_id);

    await client
      .from("device_sessions")
      .delete()
      .eq("account_id", id);

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
