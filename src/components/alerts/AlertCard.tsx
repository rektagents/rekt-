'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/lib/formatters';
import type { Alert } from '@/types/alerts';

interface AlertCardProps {
  alert: Alert & { shouldTrigger?: boolean };
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function AlertCard({ alert, onToggle, onRemove }: AlertCardProps) {
  const { currency } = useCurrency();

  return (
    <div className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/coins/${alert.coinId}`} className="flex items-center gap-3">
          <Image
            src={alert.coinImage}
            alt={alert.coinName}
            width={24}
            height={24}
            className="rounded-full"
          />
          <div>
            <div className="text-sm font-medium text-white">{alert.coinName}</div>
            <div className="text-[10px] text-white/30 uppercase font-mono">{alert.coinSymbol}</div>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => onToggle(alert.id)}
            className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest border transition-colors ${
              alert.enabled
                ? 'border-green-500/20 text-green-400'
                : 'border-white/10 text-white/20'
            }`}
          >
            {alert.enabled ? 'on' : 'off'}
          </button>
          <button
            onClick={() => onRemove(alert.id)}
            className="text-white/20 hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">
            {alert.condition === 'above' ? 'above' : 'below'}
          </p>
          <p className="text-lg font-bold text-white font-mono tabular-nums">
            {formatCurrency(alert.targetPrice, currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">
            current
          </p>
          <p className="text-sm text-white/50 font-mono tabular-nums">
            {formatCurrency(alert.currentPrice, currency)}
          </p>
        </div>
      </div>

      {alert.triggered && (
        <div className="mt-3 pt-3 border-t border-green-500/20 text-center">
          <span className="text-[10px] text-green-400 font-mono uppercase tracking-widest">
            triggered
          </span>
        </div>
      )}
    </div>
  );
}
