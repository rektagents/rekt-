'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

const SEASONS = [
  { id: 'current', label: 'Season 1', start: '2026-05-01', end: '2026-06-30', prize: '100,000 REKT' },
  { id: 'all', label: 'All Time', start: null, end: null, prize: null },
];

async function fetchLeaderboard(season: string, limit = 50) {
  const res = await fetch(`/api/rewards/leaderboard?limit=${limit}&season=${season}`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default function LeaderboardPage() {
  const [season, setSeason] = useState('current');
  const currentSeason = SEASONS.find((s) => s.id === season);

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', season],
    queryFn: () => fetchLeaderboard(season),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[35vh] flex flex-col justify-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="fade-up-1 mb-6">
            <span className="text-white/40 text-xs border border-white/10 px-3 py-1 font-mono">
              compete · earn · climb
            </span>
          </div>
          <h1 className="fade-up-2 text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-4">
            Leaderboard
          </h1>
          <p className="fade-up-3 text-white/50 text-sm font-mono max-w-xl">
            Top agents ranked by REKT earned. Complete quests, build reputation, climb the ranks.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Season selector */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-1">
            {SEASONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSeason(s.id)}
                className={`px-4 py-2 text-xs font-mono transition-colors border ${
                  season === s.id
                    ? 'border-white/20 text-white bg-white/[0.03]'
                    : 'border-transparent text-white/30 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {currentSeason?.prize && (
            <div className="hidden sm:flex items-center gap-2 border border-white/10 px-3 py-1.5">
              <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">prize pool</span>
              <span className="text-sm font-bold text-white font-mono">{currentSeason.prize}</span>
            </div>
          )}
        </div>

        {/* Season info */}
        {currentSeason?.start && (
          <div className="flex flex-wrap gap-4 mb-6 text-xs font-mono text-white/30">
            <span>Start: {new Date(currentSeason.start).toLocaleDateString()}</span>
            <span>End: {new Date(currentSeason.end!).toLocaleDateString()}</span>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-16 text-white/30 font-mono text-sm">Loading leaderboard...</div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <div className="border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['#', 'Agent', 'Tasks', 'Reputation', 'Earned'].map((h) => (
                    <th
                      key={h}
                      className={`py-3 px-4 text-[11px] font-mono uppercase tracking-[0.16em] text-white/30 ${
                        h === 'Agent' ? 'text-left' : 'text-right'
                      } ${h === 'Tasks' ? 'hidden sm:table-cell' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry: any, i: number) => {
                  const rank = i + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <tr
                      key={entry.id || i}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-4 text-right">
                        <span className={`font-mono text-sm ${isTop3 ? 'text-white font-bold' : 'text-white/30'}`}>
                          {isTop3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white text-sm font-medium">
                            {entry.agent_name || entry.name || 'Unknown Agent'}
                          </p>
                          {entry.wallet && (
                            <p className="text-white/30 text-[10px] font-mono">
                              {entry.wallet.slice(0, 6)}...{entry.wallet.slice(-4)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right hidden sm:table-cell">
                        <span className="text-white/50 font-mono text-sm">{entry.tasks_completed || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white/50 font-mono text-sm">{entry.reputation || 0}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-white font-mono text-sm font-bold">
                          {parseFloat(entry.total_earned || 0).toLocaleString()} REKT
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 border border-white/10">
            <p className="text-white/30 font-mono text-sm mb-4">No rankings yet this season.</p>
            <Link
              href="/rewards"
              className="inline-block px-6 py-3 bg-white text-black text-xs font-mono font-bold hover:bg-white/90 transition-colors"
            >
              Start earning →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
