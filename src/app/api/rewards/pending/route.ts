import { NextRequest, NextResponse } from 'next/server';
import { getPendingRewards, getRegistration, getTasksByWallet } from '@/lib/rewards-store';

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'wallet query parameter is required' },
        { status: 400 }
      );
    }

    const registration = getRegistration(wallet);
    const pending = getPendingRewards(wallet);
    const tasks = getTasksByWallet(wallet);

    return NextResponse.json({
      registration,
      pending,
      tasks,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending rewards' },
      { status: 400 }
    );
  }
}
