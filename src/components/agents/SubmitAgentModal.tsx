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

  const inputClass = "w-full bg-transparent text-white text-sm font-mono px-4 py-2.5 border border-white/10 focus:outline-none focus:border-white/30 placeholder-white/20";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Your Agent" className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Agent Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateForm('name', e.target.value)}
            placeholder="MyAwesomeAgent"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            placeholder="What does your agent do?"
            required
            className={`${inputClass} min-h-[80px] resize-none`}
          />
        </div>

        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Category *</label>
          <select
            value={form.category}
            onChange={(e) => updateForm('category', e.target.value)}
            className={inputClass}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-black">
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Primary Chain *</label>
          <select
            value={form.chain}
            onChange={(e) => updateForm('chain', e.target.value)}
            className={inputClass}
          >
            {['ethereum', 'solana', 'binance-smart-chain', 'polygon', 'avalanche', 'arbitrum', 'optimism', 'base', 'multi'].map((c) => (
              <option key={c} value={c} className="bg-black">{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-white/30 font-mono uppercase tracking-widest mb-2">Token Symbol</label>
          <input
            type="text"
            value={form.tokenSymbol}
            onChange={(e) => updateForm('tokenSymbol', e.target.value)}
            placeholder="TOKEN"
            className={inputClass}
          />
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-3">Links</p>
          <div className="space-y-3">
            <input
              type="url"
              value={form.website}
              onChange={(e) => updateForm('website', e.target.value)}
              placeholder="Website URL"
              className={inputClass}
            />
            <input
              type="text"
              value={form.twitter}
              onChange={(e) => updateForm('twitter', e.target.value)}
              placeholder="Twitter @handle"
              className={inputClass}
            />
            <input
              type="text"
              value={form.discord}
              onChange={(e) => updateForm('discord', e.target.value)}
              placeholder="Discord URL"
              className={inputClass}
            />
            <input
              type="text"
              value={form.github}
              onChange={(e) => updateForm('github', e.target.value)}
              placeholder="GitHub URL"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!form.name || !form.description}
          className="w-full py-2.5 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          submit agent
        </button>
      </form>
    </Modal>
  );
}
