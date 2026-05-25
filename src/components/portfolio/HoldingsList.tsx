'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';

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
      <div className="text-center py-12 text-gray-400">
        No holdings yet. Add your first coin to start tracking.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Coin</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400 hidden md:table-cell">Avg Buy</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Current</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Value</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">P&L</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-400"></th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr
              key={holding.id}
              className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors"
            >
              <td className="py-4 px-4">
                <Link
                  href={`/coins/${holding.coinId}`}
                  className="flex items-center gap-3"
                >
                  <Image
                    src={holding.coinImage}
                    alt={holding.coinName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div>
                    <div className="font-medium text-white">{holding.coinName}</div>
                    <div className="text-sm text-gray-400 uppercase">
                      {holding.coinSymbol}
                    </div>
                  </div>
                </Link>
              </td>
              <td className="py-4 px-4 text-right text-white">
                {holding.quantity}
              </td>
              <td className="py-4 px-4 text-right text-gray-300 hidden md:table-cell">
                {formatCurrency(holding.buyPrice, currency)}
              </td>
              <td className="py-4 px-4 text-right text-white">
                {formatCurrency(holding.currentPrice, currency)}
              </td>
              <td className="py-4 px-4 text-right font-medium text-white">
                {formatCurrency(holding.currentValue, currency)}
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex flex-col items-end">
                  <span
                    className={`font-medium ${
                      holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {holding.pnl >= 0 ? '+' : ''}
                    {formatCurrency(holding.pnl, currency)}
                  </span>
                  <Badge
                    value={holding.pnlPercentage}
                    variant={holding.pnlPercentage >= 0 ? 'gain' : 'loss'}
                  />
                </div>
              </td>
              <td className="py-4 px-4 text-right">
                <button
                  onClick={() => onRemove(holding.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
