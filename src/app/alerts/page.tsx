'use client';

import { useState } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { useCurrency } from '@/context/CurrencyContext';
import { AlertCard } from '@/components/alerts/AlertCard';
import { CreateAlertModal } from '@/components/alerts/CreateAlertModal';
import { AlertChecker } from '@/components/alerts/AlertChecker';

export default function AlertsPage() {
  const { currency } = useCurrency();
  const { alerts, addAlert, removeAlert, toggleAlert } = useAlerts(currency);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <AlertChecker />

      <div className="mb-12">
        <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">
          price monitoring
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h1 className="text-4xl font-black tracking-tight">Alerts</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white text-black px-6 py-2.5 text-sm font-bold font-mono hover:bg-white/90 transition-colors"
          >
            + create alert
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="border border-white/10 p-12 text-center">
          <p className="text-white/30 font-mono text-sm mb-4">
            No alerts set. Create one to get notified when a price target is hit.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="border border-white/20 px-6 py-2.5 text-sm text-white/70 hover:text-white hover:border-white font-mono transition-colors"
          >
            create your first alert →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-white/10 bg-white/10">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-black">
              <AlertCard
                alert={alert}
                onToggle={toggleAlert}
                onRemove={removeAlert}
              />
            </div>
          ))}
        </div>
      )}

      <CreateAlertModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={addAlert}
      />
    </div>
  );
}
