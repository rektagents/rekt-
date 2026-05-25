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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Add Holding
        </button>
      </div>

      <PortfolioSummary
        totalValue={totalValue}
        totalPnl={totalPnl}
        totalPnlPercentage={totalPnlPercentage}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Holdings</h2>
            <HoldingsList holdings={holdings} onRemove={removeHolding} />
          </div>
        </div>

        <div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Allocation</h2>
            <AllocationPieChart holdings={holdings} />
          </div>
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
