import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/rewards-store';

export async function GET(req: NextRequest) {
  try {
    const limitParam = req.nextUrl.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    const leaderboard = getLeaderboard(limit);
    return NextResponse.json(leaderboard);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
