import { NextRequest, NextResponse } from 'next/server';
import { verifyTask } from '@/lib/rewards-store';
import { updateStreak, progressQuests } from '@/lib/quests-store';

export async function POST(req: NextRequest) {
  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    const task = await verifyTask(taskId);

    // Update streak and progress quests
    const streak = await updateStreak(task.wallet);
    await progressQuests(task.wallet, task.task_type, task.score);

    return NextResponse.json({ ...task, streak });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify task' },
      { status: 400 }
    );
  }
}
