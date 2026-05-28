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
  const category = searchParams.get("category");
  const poster = searchParams.get("poster");
  const worker = searchParams.get("worker");

  const supabase = getSupabase();

  let query = supabase
    .from("marketplace_tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (poster) query = query.eq("poster_address", poster);
  if (worker) query = query.eq("worker_address", worker);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    title,
    description,
    task_type,
    reward_amount,
    deadline,
    poster_address,
    metadata,
  } = body;

  if (!title || !description || !poster_address || !reward_amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("marketplace_tasks")
    .insert({
      title,
      description,
      category: task_type || "custom",
      reward_amount: parseFloat(reward_amount),
      deadline: deadline || null,
      poster_address,
      metadata: metadata || {},
      status: "open",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
