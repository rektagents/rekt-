import { NextRequest, NextResponse } from 'next/server';
import { getQuests } from '@/lib/quests-store';

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get('wallet');
    if (!wallet) {
      return NextResponse.json({ error: 'wallet is required' }, { status: 400 });
    }
    const data = await getQuests(wallet);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch quests' }, { status: 500 });
  }
}
