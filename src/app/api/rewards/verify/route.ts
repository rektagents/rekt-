import { NextRequest, NextResponse } from 'next/server';
import { verifyTask } from '@/lib/rewards-store';

export async function POST(req: NextRequest) {
  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    const task = verifyTask(taskId);
    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify task' },
      { status: 400 }
    );
  }
}
