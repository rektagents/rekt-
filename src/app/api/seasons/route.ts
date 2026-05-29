import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('seasons')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ seasons: data || [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, start_date, end_date, prize_pool } = body;

  if (!name || !start_date || !end_date) {
    return NextResponse.json({ error: 'name, start_date, end_date required' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('seasons')
    .insert({ name, start_date, end_date, prize_pool: prize_pool || 0, active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
