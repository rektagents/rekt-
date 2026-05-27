import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'REKT-HealthMonitor/1.0' },
    });

    clearTimeout(timeout);
    const responseTime = Date.now() - start;

    return NextResponse.json({
      url,
      status: res.ok ? 'up' : 'down',
      statusCode: res.status,
      responseTime,
    });
  } catch (err: unknown) {
    const responseTime = Date.now() - start;
    const isTimeout = err instanceof Error && err.name === 'AbortError';

    return NextResponse.json({
      url,
      status: isTimeout ? 'timeout' : 'down',
      statusCode: null,
      responseTime,
    });
  }
}
