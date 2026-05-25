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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <AlertChecker />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Price Alerts</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Create Alert
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            No alerts set. Create one to get notified when a price target is hit.
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Your First Alert
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onToggle={toggleAlert}
              onRemove={removeAlert}
            />
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
