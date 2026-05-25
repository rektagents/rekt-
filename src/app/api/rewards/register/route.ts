import { NextRequest, NextResponse } from 'next/server';
import { registerAgent } from '@/lib/rewards-store';

export async function POST(req: NextRequest) {
  try {
    const { agentId, wallet } = await req.json();

    if (!agentId || !wallet) {
      return NextResponse.json(
        { error: 'agentId and wallet are required' },
        { status: 400 }
      );
    }

    const registration = registerAgent(agentId, wallet);
    return NextResponse.json(registration, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to register' },
      { status: 400 }
    );
  }
}
