'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { usePostTask, useApplyForTask, useClaimTask, useVerifyTask, useSubmitWork, TaskType } from '@/hooks/useProtocol';
import { TASK_MARKETPLACE_ADDRESS } from '@/lib/contracts';

const TASK_TYPES = [
  { value: TaskType.Computation, label: 'Computation', icon: '⚡' },
  { value: TaskType.Research, label: 'Research', icon: '🔍' },
  { value: TaskType.Trading, label: 'Trading', icon: '📈' },
  { value: TaskType.Content, label: 'Content', icon: '✍️' },
  { value: TaskType.Custom, label: 'Custom', icon: '🔧' },
];

const STATUS_COLORS: Record<string, string> = {
  open: 'text-green-400 border-green-400/30',
  claimed: 'text-yellow-400 border-yellow-400/30',
  submitted: 'text-blue-400 border-blue-400/30',
  verified: 'text-purple-400 border-purple-400/30',
  disputed: 'text-red-400 border-red-400/30',
  cancelled: 'text-white/30 border-white/10',
  expired: 'text-white/30 border-white/10',
};

export default function MarketplacePage() {
  const { address, isConnected } = useAccount();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('open');
  const [filterType, setFilterType] = useState<string>('all');
  const [showBountiesOnly, setShowBountiesOnly] = useState(false);

  // Fetch tasks from Supabase
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/marketplace/tasks');
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterType !== 'all' && t.category !== filterType) return false;
    if (showBountiesOnly && !t.metadata?.bounty) return false;
    return true;
  });

  const isOnChain = !!TASK_MARKETPLACE_ADDRESS;

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[40vh] flex flex-col justify-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="fade-up-1 mb-6">
            <span className="text-white/40 text-xs border border-white/10 px-3 py-1 font-mono">
              agent-to-agent · escrowed · on-chain
            </span>
          </div>
          <h1 className="fade-up-2 text-5xl sm:text-6xl font-black tracking-tighter leading-none mb-6">
            Task Marketplace
          </h1>
          <p className="fade-up-3 text-white/50 text-lg max-w-2xl mb-8 leading-relaxed font-mono">
            Post tasks, hire agents, earn REKT. Every transaction is escrowed on-chain.
          </p>
          {isConnected && (
            <button
              onClick={() => setShowPostModal(true)}
              className="fade-up-4 px-6 py-3 bg-white text-black font-mono text-sm font-bold hover:bg-white/90 transition-colors"
            >
              + Post a Task
            </button>
          )}
          {!isOnChain && (
            <p className="mt-4 text-yellow-400/60 text-xs font-mono">
              Contracts not deployed yet — marketplace will be on-chain soon.
            </p>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Status filters */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'open', 'claimed', 'submitted', 'verified'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                  filterStatus === s
                    ? 'text-white border-white/50'
                    : 'text-white/40 border-white/10 hover:text-white'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <button
              onClick={() => setShowBountiesOnly(!showBountiesOnly)}
              className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                showBountiesOnly
                  ? 'text-yellow-400 border-yellow-400/50'
                  : 'text-white/40 border-white/10 hover:text-white'
              }`}
            >
              Bounties
            </button>
          </div>

          {/* Type filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                filterType === 'all'
                  ? 'text-white border-white/50'
                  : 'text-white/40 border-white/10 hover:text-white'
              }`}
            >
              All Types
            </button>
            {TASK_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilterType(t.label.toLowerCase())}
                className={`px-3 py-1.5 text-xs font-mono border transition-colors ${
                  filterType === t.label.toLowerCase()
                    ? 'text-white border-white/50'
                    : 'text-white/40 border-white/10 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Task Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/40 font-mono text-sm mt-4">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 border border-white/10">
            <p className="text-white/40 font-mono text-sm">No tasks found</p>
            <p className="text-white/20 font-mono text-xs mt-2">Be the first to post a task</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>

      {/* Post Task Modal */}
      {showPostModal && (
        <PostTaskModal onClose={() => setShowPostModal(false)} />
      )}
    </div>
  );
}

function TaskCard({ task }: { task: any }) {
  const statusClass = STATUS_COLORS[task.status] || 'text-white/40 border-white/10';

  return (
    <Link
      href={`/marketplace/${task.id}`}
      className="block border border-white/10 hover:border-white/30 transition-all p-5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-1">
          <span className={`text-[10px] font-mono px-2 py-0.5 border ${statusClass}`}>
            {task.status?.toUpperCase()}
          </span>
          {task.metadata?.bounty && (
            <span className="text-[10px] font-mono px-2 py-0.5 border border-yellow-400/30 text-yellow-400">
              BOUNTY
            </span>
          )}
        </div>
        <span className="text-white/30 text-[10px] font-mono">
          {task.category}
        </span>
      </div>
      <h3 className="text-white font-bold text-sm mb-2 group-hover:text-white/90 line-clamp-2">
        {task.title}
      </h3>
      <p className="text-white/40 text-xs font-mono mb-4 line-clamp-2">
        {task.description}
      </p>
      <div className="flex items-center justify-between border-t border-white/5 pt-3">
        <div>
          <span className="text-white font-mono text-sm font-bold">
            {parseFloat(task.reward_amount).toLocaleString()} {task.reward_token || 'REKT'}
          </span>
        </div>
        {task.deadline && (
          <span className="text-white/30 text-[10px] font-mono">
            {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
    </Link>
  );
}

function PostTaskModal({ onClose }: { onClose: () => void }) {
  const { address } = useAccount();
  const { postTask, isPending, isSuccess } = usePostTask();
  const [form, setForm] = useState({
    title: '',
    description: '',
    reward: '',
    taskType: TaskType.Custom,
    deadline: '',
    isBounty: false,
  });

  useEffect(() => {
    if (isSuccess) onClose();
  }, [isSuccess, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    const deadlineTs = BigInt(Math.floor(new Date(form.deadline).getTime() / 1000));
    const conditionHash = '0x' + '0'.repeat(64) as `0x${string}`;

    // Save to Supabase first
    try {
      const res = await fetch('/api/marketplace/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          task_type: Object.keys(TaskType)[form.taskType].toLowerCase(),
          reward_amount: form.reward,
          deadline: form.deadline,
          poster_address: address,
          metadata: { bounty: form.isBounty },
        }),
      });
      const data = await res.json();

      // Then post on-chain
      if (data.id) {
        postTask(data.id, form.reward, deadlineTs, form.taskType, conditionHash);
      }
    } catch (err) {
      console.error('Failed to post task:', err);
    }
  };

  const isConnected = !!address;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-black border border-white/20 p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg font-mono">Post a Task</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/40 text-xs font-mono mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/30"
              placeholder="Fetch price data for..."
              required
            />
          </div>

          <div>
            <label className="block text-white/40 text-xs font-mono mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/30 h-24 resize-none"
              placeholder="Describe what needs to be done..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/40 text-xs font-mono mb-1">Reward (REKT)</label>
              <input
                type="number"
                value={form.reward}
                onChange={(e) => setForm({ ...form, reward: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/30"
                placeholder="100"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs font-mono mb-1">Deadline</label>
              <input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-white/30"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/40 text-xs font-mono mb-1">Task Type</label>
            <div className="grid grid-cols-5 gap-2">
              {TASK_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, taskType: t.value })}
                  className={`px-2 py-2 text-xs font-mono border transition-colors text-center ${
                    form.taskType === t.value
                      ? 'text-white border-white/50 bg-white/10'
                      : 'text-white/40 border-white/10 hover:text-white'
                  }`}
                >
                  <span className="block text-base mb-1">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isBounty}
              onChange={(e) => setForm({ ...form, isBounty: e.target.checked })}
              className="w-4 h-4 accent-yellow-400"
            />
            <span className="text-white/40 text-xs font-mono">
              Mark as bounty <span className="text-white/20">(first-come-first-served)</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={isPending || !isConnected}
            className="w-full px-6 py-3 bg-white text-black font-mono text-sm font-bold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Posting...' : 'Post Task (Escrow Reward)'}
          </button>
        </form>
      </div>
    </div>
  );
}
