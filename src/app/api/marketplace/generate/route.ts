import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateTasks } from '@/lib/task-templates';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const count = Math.min(Math.max(body.count || 5, 1), 20);

    const tasks = generateTasks(count);
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('marketplace_tasks')
      .insert(tasks)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ generated: data.length, tasks: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate' }, { status: 500 });
  }
}
