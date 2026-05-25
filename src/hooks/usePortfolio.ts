'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocalStorage } from './useLocalStorage';
import { getSimplePrices } from '@/lib/coingecko';
import { REFRESH_INTERVALS } from '@/lib/constants';
import type { Holding, PortfolioData } from '@/types/portfolio';
import type { Currency } from '@/types/coin';

const STORAGE_KEY = 'rekt-portfolio';

export function usePortfolio(currency: Currency = 'usd') {
  const [portfolio, setPortfolio] = useLocalStorage<PortfolioData>(STORAGE_KEY, {
    holdings: [],
    lastUpdated: new Date().toISOString(),
  });

  const coinIds = portfolio.holdings.map((h) => h.coinId);

  const { data: prices } = useQuery({
    queryKey: ['portfolioPrices', coinIds.join(','), currency],
    queryFn: () => getSimplePrices(coinIds, currency),
    staleTime: REFRESH_INTERVALS.portfolio,
    refetchInterval: REFRESH_INTERVALS.portfolio,
    enabled: coinIds.length > 0,
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
      const currentPrice = priceData?.[currency] || 0;
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
  }, [portfolio.holdings, prices, currency]);

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
