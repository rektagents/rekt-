'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useCurrency } from '@/context/CurrencyContext';
import { useSearch } from '@/context/SearchContext';
import { CURRENCY_SYMBOLS } from '@/lib/constants';
import type { Currency } from '@/types/coin';

const navLinks = [
  { href: '/', label: 'Market' },
  { href: '/agents', label: 'Agents' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/rewards', label: 'Rewards' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/governance', label: 'Govern' },
];

const moreLinks = [
  { href: '/trending', label: 'Trending' },
  { href: '/tools', label: 'Tools' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/roadmap', label: 'Roadmap' },
];

const currencies: Currency[] = ['usd', 'eur', 'gbp', 'btc', 'eth'];

export function Navbar() {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  const { openSearch } = useSearch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/wreck.svg" alt="REKT" className="w-7 h-7" />
            <span className="text-lg font-bold tracking-tight text-white">REKT</span>
            <span className="hidden sm:inline text-white/30 text-[10px] font-mono border border-white/10 px-2 py-0.5">
              v0.1.0
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-3 py-1.5 text-xs font-mono transition-colors',
                  pathname === link.href
                    ? 'text-white'
                    : 'text-white/40 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 text-xs font-mono text-white/40 hover:text-white transition-colors flex items-center gap-1">
                More
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                <div className="bg-black border border-white/20 py-1 min-w-[140px]">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={clsx(
                        'block px-4 py-2 text-xs font-mono transition-colors',
                        pathname === link.href
                          ? 'text-white bg-white/5'
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={openSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-white/40 border border-white/10 hover:text-white hover:border-white/30 transition-colors text-xs font-mono"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] border border-white/10 text-white/30">
                /
              </kbd>
            </button>

            {/* Currency selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-transparent text-white/40 text-xs font-mono px-2 py-1.5 border border-white/10 focus:outline-none focus:border-white/30 hover:text-white hover:border-white/30 transition-colors cursor-pointer appearance-none"
            >
              {currencies.map((c) => (
                <option key={c} value={c} className="bg-black text-white">
                  {CURRENCY_SYMBOLS[c]} {c.toUpperCase()}
                </option>
              ))}
            </select>

            {/* External links */}
            <a
              href="https://x.com/rektsagents"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center px-2 py-1.5 text-white/30 hover:text-white transition-colors border border-white/10 hover:border-white/30"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black">
          <div className="px-6 py-3 space-y-1">
            {[...navLinks, ...moreLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'block px-3 py-2 text-xs font-mono transition-colors',
                  pathname === link.href
                    ? 'text-white'
                    : 'text-white/40 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
