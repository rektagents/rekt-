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
  // Mock data - in production, fetch from API
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  const userData = {
    labels,
    datasets: [
      {
        label: 'Users',
        data: [1200, 1900, 3000, 5000, 7200, 9800, agent.metrics.users],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const transactionData = {
    labels,
    datasets: [
      {
        label: 'Transactions',
        data: [5000, 12000, 28000, 45000, 68000, 95000, agent.metrics.transactions],
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: '#8b5cf6',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
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

  const stats = [
    {
      label: 'Total Users',
      value: formatNumber(agent.metrics.users),
      change: '+12.5%',
      positive: true,
    },
    {
      label: 'Transactions',
      value: formatNumber(agent.metrics.transactions),
      change: '+8.3%',
      positive: true,
    },
    {
      label: 'Volume',
      value: agent.metrics.volume ? `$${formatNumber(agent.metrics.volume)}` : 'N/A',
      change: '+15.2%',
      positive: true,
    },
    {
      label: 'Uptime',
      value: agent.metrics.uptime ? `${agent.metrics.uptime}%` : '99.9%',
      change: '+0.1%',
      positive: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className={`text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
          <div className="h-48">
            <Line data={userData} options={chartOptions} />
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Transactions</h3>
          <div className="h-48">
            <Bar data={transactionData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { time: '2 min ago', event: 'New user registered', type: 'user' },
            { time: '15 min ago', event: 'Transaction completed: $1,250', type: 'transaction' },
            { time: '1 hour ago', event: 'Agent updated to v2.1', type: 'update' },
            { time: '3 hours ago', event: 'Milestone: 10,000 users reached', type: 'milestone' },
            { time: '5 hours ago', event: 'New integration: Uniswap V3', type: 'integration' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.type === 'user'
                    ? 'bg-blue-500'
                    : activity.type === 'transaction'
                    ? 'bg-green-500'
                    : activity.type === 'update'
                    ? 'bg-purple-500'
                    : activity.type === 'milestone'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
                }`}
              />
              <div className="flex-1">
                <div className="text-sm text-white">{activity.event}</div>
              </div>
              <div className="text-xs text-gray-500">{activity.time}</div>
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
