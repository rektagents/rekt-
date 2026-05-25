'use client';

import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import type { Agent } from '@/types/agent';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler, Legend);

interface AgentAnalyticsProps {
  agent: Agent;
}

export function AgentAnalytics({ agent }: AgentAnalyticsProps) {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  const userData = {
    labels,
    datasets: [
      {
        label: 'Users',
        data: [1200, 1900, 3000, 5000, 7200, 9800, agent.metrics.users],
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
      },
    ],
  };

  const transactionData = {
    labels,
    datasets: [
      {
        label: 'Transactions',
        data: [5000, 12000, 28000, 45000, 68000, 95000, agent.metrics.transactions],
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#ffffff',
        borderWidth: 1,
        borderRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  const stats = [
    { label: 'Total Users', value: formatNumber(agent.metrics.users), change: '+12.5%' },
    { label: 'Transactions', value: formatNumber(agent.metrics.transactions), change: '+8.3%' },
    { label: 'Volume', value: agent.metrics.volume ? `$${formatNumber(agent.metrics.volume)}` : 'N/A', change: '+15.2%' },
    { label: 'Uptime', value: agent.metrics.uptime ? `${agent.metrics.uptime}%` : '99.9%', change: '+0.1%' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px border border-white/10 bg-white/10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-black p-4">
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-white font-mono tabular-nums">{stat.value}</p>
            <p className="text-[10px] text-green-400 font-mono tabular-nums mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px border border-white/10 bg-white/10">
        <div className="bg-black p-6">
          <h3 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-4">User Growth</h3>
          <div className="h-48">
            <Line data={userData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-black p-6">
          <h3 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-4">Transactions</h3>
          <div className="h-48">
            <Bar data={transactionData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="border border-white/10 p-6">
        <h3 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-4">Recent Activity</h3>
        <div className="space-y-0">
          {[
            { time: '2 min ago', event: 'New user registered', type: 'user' },
            { time: '15 min ago', event: 'Transaction completed: $1,250', type: 'transaction' },
            { time: '1 hour ago', event: 'Agent updated to v2.1', type: 'update' },
            { time: '3 hours ago', event: 'Milestone: 10,000 users reached', type: 'milestone' },
            { time: '5 hours ago', event: 'New integration: Uniswap V3', type: 'integration' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <div className="w-1.5 h-1.5 bg-white/20" />
              <div className="flex-1">
                <div className="text-xs text-white/60">{activity.event}</div>
              </div>
              <div className="text-[10px] text-white/20 font-mono">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}
