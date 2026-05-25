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
        backgroundColor: `${lineColor}1a`,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: lineColor,
        borderWidth: 2,
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
      <div className="flex items-center gap-2 mb-4">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              timeframe === tf.value
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
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
