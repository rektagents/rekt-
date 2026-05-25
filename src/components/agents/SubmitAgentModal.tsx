'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { CATEGORY_LABELS } from '@/types/agent';
import type { AgentCategory } from '@/types/agent';

interface SubmitAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agent: AgentSubmission) => void;
}

interface AgentSubmission {
  name: string;
  description: string;
  category: AgentCategory;
  website: string;
  twitter: string;
  discord: string;
  github: string;
  tokenSymbol: string;
  chain: string;
}

export function SubmitAgentModal({ isOpen, onClose, onSubmit }: SubmitAgentModalProps) {
  const [form, setForm] = useState<AgentSubmission>({
    name: '',
    description: '',
    category: 'other',
    website: '',
    twitter: '',
    discord: '',
    github: '',
    tokenSymbol: '',
    chain: 'ethereum',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    setForm({
      name: '',
      description: '',
      category: 'other',
      website: '',
      twitter: '',
      discord: '',
      github: '',
      tokenSymbol: '',
      chain: 'ethereum',
    });
    onClose();
  };

  const updateForm = (field: keyof AgentSubmission, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Your Agent" className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Name */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Agent Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateForm('name', e.target.value)}
            placeholder="MyAwesomeAgent"
            required
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-gray-600"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            placeholder="What does your agent do? What makes it unique?"
            required
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-gray-600 min-h-[80px] resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => updateForm('category', e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-gray-600"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Chain */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Primary Chain *</label>
          <select
            value={form.chain}
            onChange={(e) => updateForm('chain', e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-gray-600"
          >
            <option value="ethereum">Ethereum</option>
            <option value="solana">Solana</option>
            <option value="binance-smart-chain">BNB Chain</option>
            <option value="polygon">Polygon</option>
            <option value="avalanche">Avalanche</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="optimism">Optimism</option>
            <option value="base">Base</option>
            <option value="multi">Multi-chain</option>
          </select>
        </div>

        {/* Token Symbol */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Token Symbol (optional)</label>
          <input
            type="text"
            value={form.tokenSymbol}
            onChange={(e) => updateForm('tokenSymbol', e.target.value)}
            placeholder="TOKEN"
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-gray-600"
          />
        </div>

        {/* Links Section */}
        <div className="border-t border-gray-800 pt-4">
          <h3 className="text-sm font-medium text-white mb-3">Links</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => updateForm('website', e.target.value)}
                placeholder="https://myagent.com"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Twitter</label>
              <input
                type="text"
                value={form.twitter}
                onChange={(e) => updateForm('twitter', e.target.value)}
                placeholder="@myagent"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Discord</label>
              <input
                type="text"
                value={form.discord}
                onChange={(e) => updateForm('discord', e.target.value)}
                placeholder="https://discord.gg/myagent"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">GitHub</label>
              <input
                type="text"
                value={form.github}
                onChange={(e) => updateForm('github', e.target.value)}
                placeholder="https://github.com/myagent"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!form.name || !form.description}
          className="w-full py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Agent
        </button>
      </form>
    </Modal>
  );
}
