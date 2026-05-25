'use client';

import { useState } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useCurrency } from '@/context/CurrencyContext';
import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary';
import { HoldingsList } from '@/components/portfolio/HoldingsList';
import { AllocationPieChart } from '@/components/portfolio/AllocationPieChart';
import { AddHoldingModal } from '@/components/portfolio/AddHoldingModal';

export default function PortfolioPage() {
  const { currency } = useCurrency();
  const {
    holdings,
    totalValue,
    totalPnl,
    totalPnlPercentage,
    addHolding,
    removeHolding,
  } = usePortfolio(currency);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">
          your holdings
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h1 className="text-4xl font-black tracking-tight">Portfolio</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white text-black px-6 py-2.5 text-sm font-bold font-mono hover:bg-white/90 transition-colors"
          >
            + add holding
          </button>
        </div>
      </div>

      <PortfolioSummary
        totalValue={totalValue}
        totalPnl={totalPnl}
        totalPnlPercentage={totalPnlPercentage}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px border border-white/10 bg-white/10 mt-8">
        <div className="lg:col-span-2 bg-black p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold tracking-tight uppercase font-mono text-white/60">
              Holdings
            </h2>
          </div>
          <HoldingsList holdings={holdings} onRemove={removeHolding} />
        </div>

        <div className="bg-black p-6">
          <h2 className="text-sm font-bold tracking-tight uppercase font-mono text-white/60 mb-4">
            Allocation
          </h2>
          <AllocationPieChart holdings={holdings} />
        </div>
      </div>

      <AddHoldingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addHolding}
      />
    </div>
  );
}
