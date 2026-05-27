import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const metric = searchParams.get('metric') || 'users';
  const days = parseInt(searchParams.get('days') || '30', 10);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabaseServer
    .from('agent_analytics')
    .select('value, recorded_at')
    .eq('agent_id', id)
    .eq('metric_type', metric)
    .gte('recorded_at', since.toISOString())
    .order('recorded_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
