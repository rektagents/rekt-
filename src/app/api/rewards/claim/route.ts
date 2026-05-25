import { NextRequest, NextResponse } from 'next/server';
import { markClaimed, getPendingRewards } from '@/lib/rewards-store';

export async function POST(req: NextRequest) {
  try {
    const { wallet } = await req.json();

    if (!wallet) {
      return NextResponse.json(
        { error: 'wallet is required' },
        { status: 400 }
      );
    }

    const pending = getPendingRewards(wallet);
    if (pending.total <= 0) {
      return NextResponse.json(
        { error: 'No pending rewards to claim' },
        { status: 400 }
      );
    }

    // Mark rewards as claimed in our store
    const claimed = markClaimed(wallet);

    return NextResponse.json({
      claimed,
      totalClaimed: claimed.reduce((sum, r) => sum + r.amount, 0),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process claim' },
      { status: 400 }
    );
  }
}
