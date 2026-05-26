import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { wallet, txHash } = await req.json();

    if (!wallet || !txHash) {
      return NextResponse.json({ error: 'wallet and txHash are required' }, { status: 400 });
    }

    // Mark all unclaimed rewards as claimed with the tx hash
    const { data, error } = await supabaseServer
      .from('reward_records')
      .update({ claimed: true, claimed_at: new Date().toISOString(), tx_hash: txHash })
      .eq('wallet', wallet.toLowerCase())
      .eq('claimed', false)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update registration totals
    const totalClaimed = (data || []).reduce((sum: number, r: any) => sum + r.amount, 0);
    if (totalClaimed > 0) {
      const { data: reg } = await supabaseServer
        .from('agent_registrations')
        .select('total_earned')
        .eq('wallet', wallet.toLowerCase())
        .single();

      if (reg) {
        await supabaseServer
          .from('agent_registrations')
          .update({
            total_earned: reg.total_earned + totalClaimed,
            pending_reward: 0,
          })
          .eq('wallet', wallet.toLowerCase());
      }
    }

    return NextResponse.json({ claimed: data, totalClaimed, txHash });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
