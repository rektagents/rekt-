'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocalStorage } from './useLocalStorage';
import { useWallet } from './useWallet';
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
  const { address, isConnected } = useWallet();
  const [localAlerts, setLocalAlerts] = useLocalStorage<AlertsData>(STORAGE_KEY, {
    alerts: [],
    lastUpdated: new Date().toISOString(),
  });
  const [remoteAlerts, setRemoteAlerts] = useState<Alert[] | null>(null);

  // Fetch from Supabase when wallet connected
  useEffect(() => {
    if (!isConnected || !address) {
      setRemoteAlerts(null);
      return;
    }

    fetch(`/api/alerts?user_id=${address.toLowerCase()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.alerts) {
          setRemoteAlerts(
            data.alerts.map((a: any) => ({
              id: a.id,
              coinId: a.coin_id,
              coinName: a.coin_name,
              coinSymbol: a.coin_symbol,
              coinImage: a.coin_image,
              condition: a.condition,
              targetPrice: parseFloat(a.target_price),
              currentPrice: parseFloat(a.current_price || 0),
              triggered: a.triggered,
              enabled: a.enabled,
              createdAt: a.created_at,
            }))
          );
        }
      })
      .catch(() => setRemoteAlerts([]));
  }, [address, isConnected]);

  // Use remote if connected, local otherwise
  const alerts = isConnected && remoteAlerts !== null ? remoteAlerts : localAlerts.alerts;

  const tokens = alerts
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
    async (alert: Omit<Alert, 'id' | 'triggered' | 'enabled' | 'createdAt' | 'currentPrice'>) => {
      if (isConnected && address) {
        try {
          const res = await fetch('/api/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: address,
              coin_id: alert.coinId,
              coin_name: alert.coinName,
              coin_symbol: alert.coinSymbol,
              coin_image: alert.coinImage,
              condition: alert.condition,
              target_price: alert.targetPrice,
            }),
          });
          const data = await res.json();
          if (data.id) {
            setRemoteAlerts((prev) => [
              { ...alert, id: data.id, currentPrice: 0, triggered: false, enabled: true, createdAt: data.created_at },
              ...(prev || []),
            ]);
          }
        } catch (err) {
          console.error('Failed to save alert:', err);
        }
      } else {
        const newAlert: Alert = {
          ...alert,
          id: Date.now().toString(),
          currentPrice: 0,
          triggered: false,
          enabled: true,
          createdAt: new Date().toISOString(),
        };
        setLocalAlerts((prev) => ({
          alerts: [...prev.alerts, newAlert],
          lastUpdated: new Date().toISOString(),
        }));
      }
    },
    [isConnected, address, setLocalAlerts]
  );

  const removeAlert = useCallback(
    async (id: string) => {
      if (isConnected && address) {
        try {
          await fetch(`/api/alerts?id=${id}&user_id=${address.toLowerCase()}`, { method: 'DELETE' });
          setRemoteAlerts((prev) => (prev || []).filter((a) => a.id !== id));
        } catch (err) {
          console.error('Failed to remove alert:', err);
        }
      } else {
        setLocalAlerts((prev) => ({
          alerts: prev.alerts.filter((a) => a.id !== id),
          lastUpdated: new Date().toISOString(),
        }));
      }
    },
    [isConnected, address, setLocalAlerts]
  );

  const toggleAlert = useCallback(
    async (id: string) => {
      const alert = alerts.find((a) => a.id === id);
      if (!alert) return;

      if (isConnected && address) {
        try {
          await fetch(`/api/alerts?id=${id}&user_id=${address.toLowerCase()}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: !alert.enabled }),
          });
          setRemoteAlerts((prev) =>
            (prev || []).map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
          );
        } catch (err) {
          console.error('Failed to toggle alert:', err);
        }
      } else {
        setLocalAlerts((prev) => ({
          alerts: prev.alerts.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
          lastUpdated: new Date().toISOString(),
        }));
      }
    },
    [isConnected, address, alerts, setLocalAlerts]
  );

  const markTriggered = useCallback(
    async (id: string) => {
      if (isConnected && address) {
        try {
          await fetch(`/api/alerts?id=${id}&user_id=${address.toLowerCase()}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ triggered: true, enabled: false, triggered_at: new Date().toISOString() }),
          });
          setRemoteAlerts((prev) =>
            (prev || []).map((a) => (a.id === id ? { ...a, triggered: true, enabled: false } : a))
          );
        } catch (err) {
          console.error('Failed to mark triggered:', err);
        }
      } else {
        setLocalAlerts((prev) => ({
          alerts: prev.alerts.map((a) => (a.id === id ? { ...a, triggered: true, enabled: false } : a)),
          lastUpdated: new Date().toISOString(),
        }));
      }
    },
    [isConnected, address, setLocalAlerts]
  );

  const alertsWithPrices = alerts.map((a) => {
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
