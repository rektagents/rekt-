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
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/coins/${alert.coinId}`} className="flex items-center gap-3">
          <Image
            src={alert.coinImage}
            alt={alert.coinName}
            width={32}
            height={32}
            className="rounded-full"
          />
          <div>
            <div className="font-medium text-white">{alert.coinName}</div>
            <div className="text-sm text-gray-400 uppercase">{alert.coinSymbol}</div>
          </div>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => onToggle(alert.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              alert.enabled ? 'bg-blue-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                alert.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <button
            onClick={() => onRemove(alert.id)}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400">
            {alert.condition === 'above' ? 'Price goes above' : 'Price goes below'}
          </div>
          <div className="text-lg font-semibold text-white">
            {formatCurrency(alert.targetPrice, currency)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Current Price</div>
          <div className="text-lg font-semibold text-white">
            {formatCurrency(alert.currentPrice, currency)}
          </div>
        </div>
      </div>

      {alert.triggered && (
        <div className="mt-3 px-3 py-1.5 bg-green-900/30 border border-green-800 rounded-lg text-green-400 text-sm text-center">
          Triggered
        </div>
      )}
    </div>
  );
}
