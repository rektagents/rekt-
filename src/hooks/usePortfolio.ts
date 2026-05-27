'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocalStorage } from './useLocalStorage';
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
  const [portfolio, setPortfolio] = useLocalStorage<PortfolioData>(STORAGE_KEY, {
    holdings: [],
    lastUpdated: new Date().toISOString(),
  });

  const tokens = portfolio.holdings
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
    (holding: Omit<Holding, 'id'>) => {
      const newHolding: Holding = {
        ...holding,
        id: Date.now().toString(),
      };
      setPortfolio((prev) => ({
        holdings: [...prev.holdings, newHolding],
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setPortfolio]
  );

  const removeHolding = useCallback(
    (id: string) => {
      setPortfolio((prev) => ({
        holdings: prev.holdings.filter((h) => h.id !== id),
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setPortfolio]
  );

  const updateHolding = useCallback(
    (id: string, updates: Partial<Holding>) => {
      setPortfolio((prev) => ({
        holdings: prev.holdings.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setPortfolio]
  );

  const getHoldingsWithPrices = useCallback(() => {
    if (!prices) return portfolio.holdings.map((h) => ({ ...h, currentPrice: 0, currentValue: 0, pnl: 0, pnlPercentage: 0 }));

    return portfolio.holdings.map((h) => {
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
  }, [portfolio.holdings, prices]);

  const holdingsWithPrices = getHoldingsWithPrices();

  const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = portfolio.holdings.reduce((sum, h) => sum + h.quantity * h.buyPrice, 0);
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
    updateHolding,
  };
}
