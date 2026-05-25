'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <p className="text-white/30 text-xs mb-3 uppercase tracking-widest font-mono">
              Track
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono">
                  Market
                </Link>
              </li>
              <li>
                <Link href="/trending" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono">
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white/30 text-xs mb-3 uppercase tracking-widest font-mono">
              Agents
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/agents" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono">
                  Submit Agent
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono">
                  Rewards
                </Link>
              </li>
              <li>
                <Link href="/alerts" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono">
                  Alerts
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white/30 text-xs mb-3 uppercase tracking-widest font-mono">
              Learn
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/trending" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono">
                  Top Movers
                </Link>
              </li>
              <li>
                <a href="https://www.coingecko.com" target="_blank" rel="noreferrer" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono">
                  CoinGecko API
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white/30 text-xs mb-3 uppercase tracking-widest font-mono">
              Community
            </p>
            <ul className="space-y-2">
              <li>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono">
                  x / twitter
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono">
                  github
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-white/70">REKT</span>
            <span className="text-white/20 text-[10px] font-mono">
              — crypto intelligence
            </span>
          </div>
          <p className="text-white/20 text-[10px] font-mono">
            Data by CoinGecko. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
