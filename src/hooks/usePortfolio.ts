'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocalStorage } from './useLocalStorage';
import { useWallet } from './useWallet';
import { getSimplePrices } from '@/lib/dexscreener';
import { REFRESH_INTERVALS } from '@/lib/constants';
import type { Holding, PortfolioData } from '@/types/portfolio';
import type { Currency } from '@/types/coin';

const STORAGE_KEY = 'rekt-portfolio';

// Parse "chainId:address" format
function parseCoinId(coinId: string): { chainId: string; address: string } | null {
  const parts = coinId.split(':');
  if (parts.length === 2) return { chainId: parts[0], address: parts[1] };
  return null;
}

export function usePortfolio(currency: Currency = 'usd') {
  const { address, isConnected } = useWallet();
  const [localPortfolio, setLocalPortfolio] = useLocalStorage<PortfolioData>(STORAGE_KEY, {
    holdings: [],
    lastUpdated: new Date().toISOString(),
  });
  const [remoteHoldings, setRemoteHoldings] = useState<Holding[] | null>(null);

  // Fetch from Supabase when wallet connected
  useEffect(() => {
    if (!isConnected || !address) {
      setRemoteHoldings(null);
      return;
    }

    fetch(`/api/portfolio?user_id=${address.toLowerCase()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.holdings) {
          setRemoteHoldings(
            data.holdings.map((h: any) => ({
              id: h.id,
              coinId: h.coin_id,
              coinName: h.coin_name,
              coinSymbol: h.coin_symbol,
              coinImage: h.coin_image,
              quantity: parseFloat(h.quantity),
              buyPrice: parseFloat(h.buy_price),
              buyDate: h.buy_date,
            }))
          );
        }
      })
      .catch(() => setRemoteHoldings([]));
  }, [address, isConnected]);

  // Use remote if connected, local otherwise
  const holdings = isConnected && remoteHoldings !== null ? remoteHoldings : localPortfolio.holdings;

  const tokens = holdings
    .map((h) => parseCoinId(h.coinId))
    .filter(Boolean) as { chainId: string; address: string }[];

  const { data: prices } = useQuery({
    queryKey: ['portfolioPrices', tokens.map((t) => `${t.chainId}:${t.address}`).join(','), currency],
    queryFn: () => getSimplePrices(tokens),
    staleTime: REFRESH_INTERVALS.portfolio,
    refetchInterval: REFRESH_INTERVALS.portfolio,
    enabled: tokens.length > 0,
  });

  const addHolding = useCallback(
    async (holding: Omit<Holding, 'id'>) => {
      if (isConnected && address) {
        // Save to Supabase
        try {
          const res = await fetch('/api/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: address,
              coin_id: holding.coinId,
              coin_name: holding.coinName,
              coin_symbol: holding.coinSymbol,
              coin_image: holding.coinImage,
              quantity: holding.quantity,
              buy_price: holding.buyPrice,
              buy_date: holding.buyDate,
            }),
          });
          const data = await res.json();
          if (data.id) {
            setRemoteHoldings((prev) => [
              { ...holding, id: data.id },
              ...(prev || []),
            ]);
          }
        } catch (err) {
          console.error('Failed to save holding:', err);
        }
      } else {
        // Fallback to localStorage
        const newHolding: Holding = {
          ...holding,
          id: Date.now().toString(),
        };
        setLocalPortfolio((prev) => ({
          holdings: [...prev.holdings, newHolding],
          lastUpdated: new Date().toISOString(),
        }));
      }
    },
    [isConnected, address, setLocalPortfolio]
  );

  const removeHolding = useCallback(
    async (id: string) => {
      if (isConnected && address) {
        try {
          await fetch(`/api/portfolio?id=${id}&user_id=${address.toLowerCase()}`, {
            method: 'DELETE',
          });
          setRemoteHoldings((prev) => (prev || []).filter((h) => h.id !== id));
        } catch (err) {
          console.error('Failed to remove holding:', err);
        }
      } else {
        setLocalPortfolio((prev) => ({
          holdings: prev.holdings.filter((h) => h.id !== id),
          lastUpdated: new Date().toISOString(),
        }));
      }
    },
    [isConnected, address, setLocalPortfolio]
  );

  const getHoldingsWithPrices = useCallback(() => {
    if (!prices) return holdings.map((h) => ({ ...h, currentPrice: 0, currentValue: 0, pnl: 0, pnlPercentage: 0 }));

    return holdings.map((h) => {
      const priceData = prices[h.coinId];
      const currentPrice = priceData?.usd || 0;
      const currentValue = h.quantity * currentPrice;
      const costBasis = h.quantity * h.buyPrice;
      const pnl = currentValue - costBasis;
      const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

      return {
        ...h,
        currentPrice,
        currentValue,
        pnl,
        pnlPercentage,
      };
    });
  }, [holdings, prices]);

  const holdingsWithPrices = getHoldingsWithPrices();

  const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.quantity * h.buyPrice, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercentage = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return {
    holdings: holdingsWithPrices,
    totalValue,
    totalCost,
    totalPnl,
    totalPnlPercentage,
    addHolding,
    removeHolding,
    updateHolding: useCallback((id: string, updates: Partial<Holding>) => {
      setLocalPortfolio((prev) => ({
        holdings: prev.holdings.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        lastUpdated: new Date().toISOString(),
      }));
    }, [setLocalPortfolio]),
  };
}
