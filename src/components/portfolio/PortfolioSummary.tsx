'use client';

import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/lib/formatters';

interface PortfolioSummaryProps {
  totalValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
}

export function PortfolioSummary({
  totalValue,
  totalPnl,
  totalPnlPercentage,
}: PortfolioSummaryProps) {
  const { currency } = useCurrency();

  return (
    <div className="border border-white/10 bg-white/[0.02]">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-2">
          total portfolio value
        </p>
        <div className="text-4xl font-black text-white font-mono tabular-nums tracking-tight">
          {formatCurrency(totalValue, currency)}
        </div>
      </div>
      <div className="px-6 py-4 flex items-center gap-8">
        <div>
          <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest mb-1">
            profit / loss
          </p>
          <p className={`text-lg font-bold font-mono tabular-nums ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl, currency)}
          </p>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div>
          <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest mb-1">
            change
          </p>
          <p className={`text-lg font-bold font-mono tabular-nums ${totalPnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnlPercentage >= 0 ? '+' : ''}{totalPnlPercentage.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
