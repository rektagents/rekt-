import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const supabase = getSupabase();

  let query = supabase
    .from("governance_proposals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ proposals: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title,
    description,
    proposer_address,
    metadata_uri,
    target_contract,
    call_data,
  } = body;

  if (!title || !description || !proposer_address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("governance_proposals")
    .insert({
      title,
      description,
      proposer_address,
      metadata_uri: metadata_uri || null,
      target_contract: target_contract || null,
      call_data: call_data || null,
      status: "pending",
      for_votes: 0,
      against_votes: 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
