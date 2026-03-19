import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createUntypedAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { admin, error } = await requireAdmin();
  if (!admin) return NextResponse.json({ error }, { status: 401 });

  try {
    const sp = request.nextUrl.searchParams;
    const page = parseInt(sp.get("page") || "1");
    const limit = parseInt(sp.get("limit") || "50");
    const status = sp.get("status") || "";
    const topic = sp.get("topic") || "";
    const offset = (page - 1) * limit;
    const supabase = createUntypedAdminClient();

    let query = supabase
      .from("support_tickets")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (topic) query = query.eq("topic", topic);

    const { data, count, error: e } = await query;
    if (e) return NextResponse.json({ error: e.message }, { status: 500 });

    return NextResponse.json({
      tickets: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error("Tickets API error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { admin, error } = await requireAdmin();
  if (!admin) return NextResponse.json({ error }, { status: 401 });

  try {
    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });
    }

    const supabase = createUntypedAdminClient();
    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const { error: e } = await supabase
      .from("support_tickets")
      .update(updates)
      .eq("id", id);

    if (e) return NextResponse.json({ error: e.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Tickets PATCH error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
