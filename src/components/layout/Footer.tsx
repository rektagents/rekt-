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
                <a href="https://x.com" target="_blank" rel="noreferrer" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono flex items-center gap-1.5">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  x / twitter
                </a>
              </li>
              <li>
                <a href="https://github.com/kenabestilla/rekt-" target="_blank" rel="noreferrer" className="text-white/50 hover:text-white text-xs transition-colors underline-hover font-mono flex items-center gap-1.5">
                  <img src="/wreck.svg" alt="REKT" className="w-3 h-3" />
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
