'use client';

import { useQuery } from '@tanstack/react-query';
import { getMarketCoins, getGlobalData } from '@/lib/dexscreener';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, formatLargeNumber } from '@/lib/formatters';
import Link from 'next/link';
import Image from 'next/image';

export function HeroBanner() {
  const { currency } = useCurrency();
  const { data: coins, isLoading: coinsLoading } = useQuery({
    queryKey: ['heroCoins', currency],
    queryFn: () => getMarketCoins(currency, 1),
    staleTime: 30_000,
  });
  const { data: global, isLoading: globalLoading } = useQuery({
    queryKey: ['heroGlobal'],
    queryFn: getGlobalData,
    staleTime: 30_000,
  });

  const btc = coins?.find((c) => c.symbol === 'BTC' || c.symbol === 'WBTC');
  const isLoading = coinsLoading || globalLoading;

  return (
    <>
      <div className="fade-up-1 mb-6">
        <span className="text-white/40 text-xs border border-white/10 px-3 py-1 font-mono">
          live · decentralized · agent-native
        </span>
      </div>

      <h1 className="fade-up-2 text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none mb-6">
        Track crypto.
        <br />
        <span className="text-white/20">Run agents.</span>
        <br />
        Stay REKT.
      </h1>

      <p className="fade-up-3 text-white/50 text-lg sm:text-xl max-w-2xl mb-6 leading-relaxed font-mono">
        Real-time crypto intelligence for builders, traders, and autonomous agents.
        Prices, portfolios, alerts, and an agent-native marketplace.
      </p>

      <div className="fade-up-3.5 flex flex-wrap gap-2 mb-10">
        {['Every DEX token', '15s refresh', 'Agent directory', 'Portfolio tracking'].map(
          (tag) => (
            <span
              key={tag}
              className="border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/40 font-mono"
            >
              {tag}
            </span>
          )
        )}
      </div>

      <div className="fade-up-4 flex flex-wrap gap-4 mb-14">
        <a
          href="#market-table"
          className="bg-white text-black px-6 py-3 text-sm font-bold hover:bg-white/90 transition-colors font-mono"
        >
          explore market →
        </a>
        <Link
          href="/agents"
          className="border border-white/20 px-6 py-3 text-sm text-white/70 hover:text-white hover:border-white transition-colors font-mono"
        >
          browse agents →
        </Link>
        <Link
          href="/portfolio"
          className="border border-white/10 bg-white/[0.03] px-6 py-3 text-sm text-white/55 hover:text-white hover:border-white/30 transition-colors font-mono"
        >
          track portfolio →
        </Link>
      </div>

      {/* BTC card + terminal side by side */}
      <div className="fade-up-5 mt-14 grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6 items-start">
        {/* BTC Quick Stats */}
        <div className="border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-semibold tracking-tight">
                Top Token Snapshot
              </p>
              <p className="text-white/30 text-xs font-mono mt-1">
                Powered by DexScreener
              </p>
            </div>
            <span className="text-white/20 text-[10px] border border-white/10 px-2 py-1 font-mono uppercase tracking-widest">
              live
            </span>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : btc ? (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {btc.image ? (
                  <Image
                    src={btc.image}
                    alt={btc.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-white/10" />
                )}
                <div>
                  <div className="text-white font-bold text-xl">
                    {formatCurrency(btc.current_price, currency)}
                  </div>
                  <div
                    className={`text-xs font-mono ${
                      btc.price_change_percentage_24h >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {btc.price_change_percentage_24h >= 0 ? '+' : ''}
                    {btc.price_change_percentage_24h?.toFixed(2)}% (24h)
                  </div>
                </div>
              </div>

              <div className="border border-white/5 grid grid-cols-2 gap-px bg-white/5">
                <div className="bg-black px-3 py-3">
                  <p className="text-white font-black text-sm font-mono tabular-nums">
                    {formatLargeNumber(btc.market_cap)}
                  </p>
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-[0.16em] mt-1">
                    market cap
                  </p>
                </div>
                <div className="bg-black px-3 py-3">
                  <p className="text-white font-black text-sm font-mono tabular-nums">
                    {formatLargeNumber(btc.total_volume)}
                  </p>
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-[0.16em] mt-1">
                    24h volume
                  </p>
                </div>
              </div>

              {btc.chainId && btc.baseToken && (
                <Link
                  href={`/coins/${btc.chainId}/${btc.baseToken.address}`}
                  className="mt-4 block text-center border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/55 hover:text-white hover:border-white/30 transition-colors font-mono"
                >
                  view details →
                </Link>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-white/20 font-mono text-sm">
              Loading market data...
            </div>
          )}
        </div>

        {/* Terminal mockup */}
        <div className="border border-white/10 bg-black/50">
          <div className="border-b border-white/10 px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <span className="text-white/30 text-xs ml-2 font-mono">terminal</span>
          </div>
          <div className="p-6 font-mono text-sm space-y-1">
            <p>
              <span className="text-white/30">$</span>{' '}
              <span className="text-white">rekt watch --pair BTC/USD</span>
            </p>
            <p className="text-white/40">Connecting to DexScreener feed...</p>
            <p className="text-white/40">Subscribing to all DEX pairs</p>
            <p className="text-white/40">Agent network: 4 active agents online</p>
            <p className="text-white/40">Portfolio sync: 3 wallets tracked</p>
            <p className="text-white">
              ✓ REKT intelligence active — refreshing every 15s
            </p>
            <p className="text-white/30">
              $<span className="ml-1 cursor-blink">_</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
