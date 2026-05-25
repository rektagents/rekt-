'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/lib/formatters';
import { clsx } from 'clsx';

interface HoldingWithPrice {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
}

interface HoldingsListProps {
  holdings: HoldingWithPrice[];
  onRemove: (id: string) => void;
}

export function HoldingsList({ holdings, onRemove }: HoldingsListProps) {
  const { currency } = useCurrency();

  if (holdings.length === 0) {
    return (
      <div className="text-center py-12 text-white/30 font-mono text-sm">
        No holdings yet. Add your first coin to start tracking.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            {['Coin', 'Amount', 'Avg Buy', 'Current', 'Value', 'P&L', ''].map((h) => (
              <th
                key={h}
                className={clsx(
                  'py-3 px-4 text-[11px] font-mono uppercase tracking-[0.16em] text-white/30',
                  h === 'Coin' ? 'text-left' : 'text-right',
                  h === 'Avg Buy' && 'hidden md:table-cell'
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr
              key={holding.id}
              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-4 px-4">
                <Link
                  href={`/coins/${holding.coinId}`}
                  className="flex items-center gap-3"
                >
                  <Image
                    src={holding.coinImage}
                    alt={holding.coinName}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <div>
                    <div className="text-sm font-medium text-white">{holding.coinName}</div>
                    <div className="text-[10px] text-white/30 uppercase font-mono">
                      {holding.coinSymbol}
                    </div>
                  </div>
                </Link>
              </td>
              <td className="py-4 px-4 text-right text-sm text-white font-mono tabular-nums">
                {holding.quantity}
              </td>
              <td className="py-4 px-4 text-right text-xs text-white/40 font-mono tabular-nums hidden md:table-cell">
                {formatCurrency(holding.buyPrice, currency)}
              </td>
              <td className="py-4 px-4 text-right text-sm text-white font-mono tabular-nums">
                {formatCurrency(holding.currentPrice, currency)}
              </td>
              <td className="py-4 px-4 text-right text-sm font-medium text-white font-mono tabular-nums">
                {formatCurrency(holding.currentValue, currency)}
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex flex-col items-end">
                  <span
                    className={`text-xs font-mono tabular-nums ${
                      holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {holding.pnl >= 0 ? '+' : ''}
                    {formatCurrency(holding.pnl, currency)}
                  </span>
                  <span
                    className={`text-[10px] font-mono tabular-nums ${
                      holding.pnlPercentage >= 0 ? 'text-green-400/60' : 'text-red-400/60'
                    }`}
                  >
                    {holding.pnlPercentage >= 0 ? '+' : ''}
                    {holding.pnlPercentage.toFixed(2)}%
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-right">
                <button
                  onClick={() => onRemove(holding.id)}
                  className="text-white/20 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
