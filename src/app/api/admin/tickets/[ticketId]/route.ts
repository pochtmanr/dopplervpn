import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createUntypedAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const { admin, error } = await requireAdmin();
  if (!admin) return NextResponse.json({ error }, { status: 401 });

  try {
    const { ticketId } = await params;
    const supabase = createUntypedAdminClient();

    const { data: ticket, error: e } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (e || !ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    let account = null;
    if (ticket.account_id) {
      const { data: acc } = await supabase
        .from("accounts")
        .select("id, account_id, subscription_tier, subscription_expires_at, subscription_store, subscription_product_id, max_devices, created_at")
        .eq("account_id", ticket.account_id)
        .single();
      account = acc;
    }

    return NextResponse.json({ ticket, account });
  } catch (err) {
    console.error("Ticket detail API error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const { admin, error } = await requireAdmin();
  if (!admin) return NextResponse.json({ error }, { status: 401 });

  try {
    const { ticketId } = await params;
    const body = await request.json();
    const { status, admin_notes } = body;

    const supabase = createUntypedAdminClient();
    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const { error: e } = await supabase
      .from("support_tickets")
      .update(updates)
      .eq("id", ticketId);

    if (e) return NextResponse.json({ error: e.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Ticket detail PATCH error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
