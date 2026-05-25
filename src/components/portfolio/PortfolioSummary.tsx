'use client';

import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';

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
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="text-sm text-gray-400 mb-2">Total Portfolio Value</div>
      <div className="text-4xl font-bold text-white mb-4">
        {formatCurrency(totalValue, currency)}
      </div>
      <div className="flex items-center gap-4">
        <div>
          <div className="text-sm text-gray-400">Profit/Loss</div>
          <div className={`text-lg font-semibold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl, currency)}
          </div>
        </div>
        <Badge
          value={totalPnlPercentage}
          variant={totalPnlPercentage >= 0 ? 'gain' : 'loss'}
          className="text-lg"
        />
      </div>
    </div>
  );
}
