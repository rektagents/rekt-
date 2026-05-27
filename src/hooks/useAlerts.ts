'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocalStorage } from './useLocalStorage';
import { getSimplePrices } from '@/lib/dexscreener';
import { REFRESH_INTERVALS } from '@/lib/constants';
import type { Alert, AlertsData } from '@/types/alerts';
import type { Currency } from '@/types/coin';

const STORAGE_KEY = 'rekt-alerts';

// Parse "chainId:address" format
function parseCoinId(coinId: string): { chainId: string; address: string } | null {
  const parts = coinId.split(':');
  if (parts.length === 2) return { chainId: parts[0], address: parts[1] };
  return null;
}

export function useAlerts(currency: Currency = 'usd') {
  const [alertsData, setAlertsData] = useLocalStorage<AlertsData>(STORAGE_KEY, {
    alerts: [],
    lastUpdated: new Date().toISOString(),
  });

  const tokens = alertsData.alerts
    .filter((a) => a.enabled)
    .map((a) => parseCoinId(a.coinId))
    .filter(Boolean) as { chainId: string; address: string }[];

  const { data: prices } = useQuery({
    queryKey: ['alertPrices', tokens.map((t) => `${t.chainId}:${t.address}`).join(','), currency],
    queryFn: () => getSimplePrices(tokens),
    staleTime: REFRESH_INTERVALS.alerts,
    refetchInterval: REFRESH_INTERVALS.alerts,
    enabled: tokens.length > 0,
  });

  const addAlert = useCallback(
    (alert: Omit<Alert, 'id' | 'triggered' | 'enabled' | 'createdAt' | 'currentPrice'>) => {
      const newAlert: Alert = {
        ...alert,
        id: Date.now().toString(),
        currentPrice: 0,
        triggered: false,
        enabled: true,
        createdAt: new Date().toISOString(),
      };
      setAlertsData((prev) => ({
        alerts: [...prev.alerts, newAlert],
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setAlertsData]
  );

  const removeAlert = useCallback(
    (id: string) => {
      setAlertsData((prev) => ({
        alerts: prev.alerts.filter((a) => a.id !== id),
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setAlertsData]
  );

  const toggleAlert = useCallback(
    (id: string) => {
      setAlertsData((prev) => ({
        alerts: prev.alerts.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setAlertsData]
  );

  const markTriggered = useCallback(
    (id: string) => {
      setAlertsData((prev) => ({
        alerts: prev.alerts.map((a) => (a.id === id ? { ...a, triggered: true, enabled: false } : a)),
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setAlertsData]
  );

  const alertsWithPrices = alertsData.alerts.map((a) => {
    const priceData = prices?.[a.coinId];
    const currentPrice = priceData?.usd || a.currentPrice;

    let shouldTrigger = false;
    if (a.enabled && !a.triggered && prices) {
      if (a.condition === 'above' && currentPrice >= a.targetPrice) {
        shouldTrigger = true;
      } else if (a.condition === 'below' && currentPrice <= a.targetPrice) {
        shouldTrigger = true;
      }
    }

    return {
      ...a,
      currentPrice,
      shouldTrigger,
    };
  });

  return {
    alerts: alertsWithPrices,
    addAlert,
    removeAlert,
    toggleAlert,
    markTriggered,
  };
}
