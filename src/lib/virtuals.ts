import type { Agent, AgentCategory, AgentMetrics } from '@/types/agent';

const VIRTUALS_API = 'https://api.virtuals.io/api/virtuals';

// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let cachedAgents: Agent[] | null = null;
let cacheTimestamp = 0;

// Map Virtuals categories to REKT categories
function mapCategory(virtualsAgent: any): AgentCategory {
  const role = (virtualsAgent.role || '').toLowerCase();
  const category = (virtualsAgent.category || '').toLowerCase();

  if (role.includes('trading') || role.includes('defi') || category.includes('defi')) return 'defi';
  if (role.includes('research') || role.includes('analyst')) return 'research';
  if (role.includes('social') || role.includes('entertainment') || role.includes('waifu') || role.includes('husbando')) return 'social';
  if (role.includes('cod') || role.includes('develop') || role.includes('engineer')) return 'coding';
  if (role.includes('game') || role.includes('gaming')) return 'gaming';
  if (role.includes('data') || category.includes('data')) return 'data';
  if (role.includes('trade') || role.includes('sniper') || role.includes('arbitrage')) return 'trading';
  return 'other';
}

// Transform Virtuals agent to REKT Agent format
function transformVirtualsAgent(va: any): Agent {
  const tokenAddress = va.tokenAddress || '';
  return {
    id: `virtuals-${va.id}`,
    name: va.name || 'Unknown Agent',
    description: va.description || va.aidesc || '',
    category: mapCategory(va),
    status: va.status === 'AVAILABLE' ? 'live' : 'beta',
    creator: va.creator?.displayName || va.creator?.username || va.walletAddress || '',
    avatar: va.image?.url || '',
    website: va.socials?.VERIFIED_LINKS?.[0] || '',
    twitter: va.socials?.x || va.socials?.TWITTER || '',
    tokenSymbol: va.symbol || '',
    tokenAddress: tokenAddress,
    chain: va.chain?.toLowerCase() || 'base',
    tags: [
      ...(va.cores?.map((c: any) => c.name) || []),
      va.role,
      va.category,
    ].filter(Boolean),
    featured: (va.holderCount || 0) > 10000 || (va.mcapInVirtual || 0) > 1000000,
    createdAt: va.createdAt || new Date().toISOString(),
    metrics: {
      users: va.holderCount || 0,
      transactions: Math.round((va.volume24h || 0) * 100),
      volume: va.volume24h || 0,
      uptime: 99.9,
      rating: Math.min(5, (va.mindshare || 0) * 5),
      reviews: va.holderCount ? Math.round(va.holderCount / 100) : 0,
    } as AgentMetrics,
  };
}

// Fetch agents from Virtuals Protocol
export async function fetchVirtualsAgents(options: {
  page?: number;
  pageSize?: number;
  status?: string;
  chain?: string;
  sort?: string;
} = {}): Promise<{ agents: Agent[]; total: number }> {
  const {
    page = 1,
    pageSize = 50,
    status = 'AVAILABLE',
    chain = 'BASE',
    sort = 'holderCount',
  } = options;

  // Check cache
  if (cachedAgents && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return { agents: cachedAgents, total: cachedAgents.length };
  }

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      status,
      chain,
    });

    const res = await fetch(`${VIRTUALS_API}?${params}`, {
      next: { revalidate: 300 }, // ISR: 5 minutes
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) throw new Error(`Virtuals API error: ${res.status}`);

    const data = await res.json();
    const agents = (data.data || []).map(transformVirtualsAgent);

    // Sort by requested field
    agents.sort((a: Agent, b: Agent) => {
      if (sort === 'holderCount' || sort === 'users') return (b.metrics.users || 0) - (a.metrics.users || 0);
      if (sort === 'volume') return (b.metrics.volume || 0) - (a.metrics.volume || 0);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    // Update cache
    cachedAgents = agents;
    cacheTimestamp = Date.now();

    return { agents, total: data.meta?.pagination?.total || agents.length };
  } catch (err) {
    console.error('Failed to fetch Virtuals agents:', err);
    return { agents: cachedAgents || [], total: 0 };
  }
}

// Fetch a single agent by ID
export async function fetchVirtualsAgent(id: string): Promise<Agent | null> {
  try {
    // Extract numeric ID from "virtuals-123" format
    const numericId = id.replace('virtuals-', '');
    const res = await fetch(`${VIRTUALS_API}/${numericId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return transformVirtualsAgent(data.data || data);
  } catch {
    return null;
  }
}

// Search agents by query
export async function searchVirtualsAgents(query: string, limit = 20): Promise<Agent[]> {
  const { agents } = await fetchVirtualsAgents({ pageSize: 100 });
  const q = query.toLowerCase();
  return agents
    .filter((a) =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.tokenSymbol?.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, limit);
}
