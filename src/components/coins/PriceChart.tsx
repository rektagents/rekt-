'use client';

import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { useCoinChart } from '@/hooks/useCoinDetail';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/Skeleton';
import { clsx } from 'clsx';
import type { TimeFrame } from '@/types/coin';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const timeframes: { label: string; value: TimeFrame }[] = [
  { label: '1H', value: '1' },
  { label: '24H', value: '1' },
  { label: '7D', value: '7' },
  { label: '1M', value: '30' },
  { label: '3M', value: '90' },
  { label: '1Y', value: '365' },
  { label: 'ALL', value: 'max' },
];

interface PriceChartProps {
  coinId: string;
}

export function PriceChart({ coinId }: PriceChartProps) {
  const { currency } = useCurrency();
  const [timeframe, setTimeframe] = useState<TimeFrame>('7');
  const { data, isLoading } = useCoinChart(coinId, currency, timeframe);

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!data) return null;

  const prices = data.prices.map(([timestamp, price]) => ({
    x: new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    y: price,
  }));

  const isPositive = prices[prices.length - 1].y >= prices[0].y;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';

  const chartData = {
    labels: prices.map((p) => p.x),
    datasets: [
      {
        data: prices.map((p) => p.y),
        borderColor: lineColor,
        backgroundColor: `${lineColor}0d`,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: lineColor,
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => formatCurrency(context.parsed.y, currency),
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  return (
    <div>
      <div className="flex items-center gap-1 mb-4">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={clsx(
              'px-3 py-1.5 text-xs font-mono transition-colors border',
              timeframe === tf.value
                ? 'border-white/20 text-white bg-white/[0.03]'
                : 'border-transparent text-white/30 hover:text-white'
            )}
          >
            {tf.label}
          </button>
        ))}
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
