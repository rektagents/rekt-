import { NextRequest, NextResponse } from 'next/server';
import { markClaimed, getPendingRewards } from '@/lib/rewards-store';
import { isClaimWindowOpen, getNextDistributionDate, formatDistributionDate } from '@/lib/distribution';

export async function POST(req: NextRequest) {
  try {
    const { wallet } = await req.json();

    if (!wallet) {
      return NextResponse.json(
        { error: 'wallet is required' },
        { status: 400 }
      );
    }

    // Check if claim window is open (28th of month to 3rd of next month)
    if (!isClaimWindowOpen()) {
      const { openDate } = getNextDistributionDate();
      return NextResponse.json(
        {
          error: `Claims open on ${formatDistributionDate(openDate)}. Rewards accumulate monthly to protect token price.`,
          nextDistribution: openDate.toISOString(),
        },
        { status: 403 }
      );
    }

    const pending = await getPendingRewards(wallet);
    if (pending.total <= 0) {
      return NextResponse.json(
        { error: 'No pending rewards to claim' },
        { status: 400 }
      );
    }

    // Mark rewards as claimed in our store
    const claimed = await markClaimed(wallet);

    return NextResponse.json({
      claimed,
      totalClaimed: claimed.reduce((sum: number, r: any) => sum + r.amount, 0),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process claim' },
      { status: 400 }
    );
  }
}
