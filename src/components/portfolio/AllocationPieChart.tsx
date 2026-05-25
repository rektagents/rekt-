'use client';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AllocationPieChartProps {
  holdings: {
    coinName: string;
    currentValue: number;
  }[];
}

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#f43f5e',
  '#6366f1',
  '#14b8a6',
];

export function AllocationPieChart({ holdings }: AllocationPieChartProps) {
  if (holdings.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        No holdings to display
      </div>
    );
  }

  const total = holdings.reduce((sum, h) => sum + h.currentValue, 0);

  const data = {
    labels: holdings.map((h) => h.coinName),
    datasets: [
      {
        data: holdings.map((h) => h.currentValue),
        backgroundColor: COLORS.slice(0, holdings.length),
        borderColor: '#030712',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9ca3af',
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${percentage}%`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64">
      <Pie data={data} options={options} />
    </div>
  );
}
