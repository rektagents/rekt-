import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, getSeasonLeaderboard } from '@/lib/rewards-store';

export async function GET(req: NextRequest) {
  try {
    const limitParam = req.nextUrl.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const seasonId = req.nextUrl.searchParams.get('season');
    const startDate = req.nextUrl.searchParams.get('start');
    const endDate = req.nextUrl.searchParams.get('end');

    let raw;
    if (startDate && endDate) {
      raw = await getSeasonLeaderboard(startDate, endDate, limit);
    } else {
      raw = await getLeaderboard(limit);
    }

    const leaderboard = (raw || []).map((entry: any) => ({
      ...entry,
      agentId: entry.agent_id || entry.agentId,
      totalEarned: parseFloat(entry.total_earned ?? entry.totalEarned ?? 0),
      tasksCompleted: entry.tasks_completed ?? entry.tasksCompleted ?? 0,
      reputation: entry.reputation ?? 50,
    }));
    return NextResponse.json(leaderboard);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
