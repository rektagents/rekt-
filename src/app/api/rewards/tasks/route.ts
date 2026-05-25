import { NextRequest, NextResponse } from 'next/server';
import { submitTask } from '@/lib/rewards-store';
import type { TaskType } from '@/types/rewards';

export async function POST(req: NextRequest) {
  try {
    const { agentId, wallet, type, score, proof } = await req.json();

    if (!agentId || !wallet || !type || score === undefined) {
      return NextResponse.json(
        { error: 'agentId, wallet, type, and score are required' },
        { status: 400 }
      );
    }

    const validTypes: TaskType[] = ['data_processing', 'api_call', 'computation', 'content_generation'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid task type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const task = submitTask(agentId, wallet, type, score, proof || '');
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit task' },
      { status: 400 }
    );
  }
}
