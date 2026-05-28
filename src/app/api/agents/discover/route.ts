import { NextRequest, NextResponse } from 'next/server';
import { fetchVirtualsAgents, searchVirtualsAgents } from '@/lib/virtuals';

// In-memory cache for the merged result
let mergedCache: any = null;
let mergedCacheTime = 0;
const MERGED_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source') || 'all'; // 'virtuals' | 'all'
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '50');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'users';

  try {
    // If searching, use search endpoint
    if (query) {
      const agents = await searchVirtualsAgents(query, pageSize);
      return NextResponse.json({
        agents,
        total: agents.length,
        source: 'virtuals',
        meta: { query, page, pageSize },
      });
    }

    // Fetch from Virtuals
    const { agents: virtualsAgents, total } = await fetchVirtualsAgents({
      page,
      pageSize: Math.min(pageSize, 100),
      sort,
    });

    // Filter by category if requested
    let agents = virtualsAgents;
    if (category && category !== 'all') {
      agents = agents.filter((a) => a.category === category);
    }

    return NextResponse.json({
      agents,
      total,
      source: 'virtuals',
      meta: {
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to discover agents', agents: [] },
      { status: 500 }
    );
  }
}
