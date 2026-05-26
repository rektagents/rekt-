import { NextRequest, NextResponse } from 'next/server';
import { claimQuest } from '@/lib/quests-store';

export async function POST(req: NextRequest) {
  try {
    const { wallet, questId } = await req.json();
    if (!wallet || !questId) {
      return NextResponse.json({ error: 'wallet and questId are required' }, { status: 400 });
    }
    const result = await claimQuest(wallet, questId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to claim quest' }, { status: 400 });
  }
}
