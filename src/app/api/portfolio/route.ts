import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id');
  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('portfolio_holdings')
    .select('*')
    .eq('user_id', userId.toLowerCase())
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ holdings: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, coin_id, coin_name, coin_symbol, coin_image, quantity, buy_price, buy_date } = body;

  if (!user_id || !coin_id || !coin_name || !quantity || !buy_price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('portfolio_holdings')
    .insert({
      user_id: user_id.toLowerCase(),
      coin_id,
      coin_name,
      coin_symbol: coin_symbol || '',
      coin_image: coin_image || '',
      quantity,
      buy_price,
      buy_date: buy_date || new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const userId = req.nextUrl.searchParams.get('user_id');
  if (!id || !userId) return NextResponse.json({ error: 'id and user_id required' }, { status: 400 });

  const supabase = getSupabase();
  const { error } = await supabase
    .from('portfolio_holdings')
    .delete()
    .eq('id', id)
    .eq('user_id', userId.toLowerCase());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
