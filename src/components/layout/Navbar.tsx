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
  { href: '/trending', label: 'Trending' },
  { href: '/agents', label: 'Agents' },
  { href: '/rewards', label: 'Rewards' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/alerts', label: 'Alerts' },
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
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center px-2 py-1.5 text-xs font-mono text-white/30 hover:text-white transition-colors border border-white/10 hover:border-white/30"
            >
              x
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
            {navLinks.map((link) => (
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
