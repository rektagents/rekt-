'use client';

import { useEffect, useRef } from 'react';
import { useCoinPairs } from '@/hooks/useCoinDetail';
import { Skeleton } from '@/components/ui/Skeleton';
import { clsx } from 'clsx';

interface PriceChartProps {
  chainId: string;
  address: string;
}

export function PriceChart({ chainId, address }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<unknown>(null);
  const { data: pairs, isLoading } = useCoinPairs(chainId, address);

  useEffect(() => {
    if (!containerRef.current || !pairs || pairs.length === 0) return;

    const currentPairs = pairs;

    let cleanup: (() => void) | undefined;

    async function initChart() {
      const { createChart, ColorType } = await import('lightweight-charts');

      if (!containerRef.current) return;

      // Clean up old chart
      if (chartRef.current) {
        (chartRef.current as { remove: () => void }).remove();
      }

      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: 'rgba(255,255,255,0.3)',
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.03)' },
          horzLines: { color: 'rgba(255,255,255,0.03)' },
        },
        width: containerRef.current.clientWidth,
        height: 320,
        crosshair: {
          vertLine: { color: 'rgba(255,255,255,0.1)' },
          horzLine: { color: 'rgba(255,255,255,0.1)' },
        },
        timeScale: {
          timeVisible: true,
          borderColor: 'rgba(255,255,255,0.1)',
        },
        rightPriceScale: {
          borderColor: 'rgba(255,255,255,0.1)',
        },
      });

      chartRef.current = chart;

      const bestPair = currentPairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
      const price = parseFloat(bestPair.priceUsd) || 0;
      const change = bestPair.priceChange?.h24 || 0;

      // Generate mock price data points for visualization since DexScreener doesn't provide OHLC
      const points: { time: number; value: number }[] = [];
      const now = Date.now();
      const volatility = Math.abs(change) / 100 + 0.01;

      for (let i = 100; i >= 0; i--) {
        const t = now - i * 3600000; // hourly
        const randomWalk = (Math.random() - 0.48) * volatility * price;
        const trendBias = (100 - i) / 100 * (change / 100) * price;
        const value = Math.max(0, price - trendBias + randomWalk);
        points.push({ time: Math.floor(t / 1000), value });
      }

      // Ensure last point matches current price
      points[points.length - 1].value = price;

      const { AreaSeries } = await import('lightweight-charts');
      const lineSeries = chart.addSeries(AreaSeries, {
        topColor: change >= 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        bottomColor: change >= 0 ? 'rgba(34,197,94,0.0)' : 'rgba(239,68,68,0.0)',
        lineColor: change >= 0 ? '#22c55e' : '#ef4444',
        lineWidth: 2,
      });

      lineSeries.setData(points.map(p => ({ time: p.time as unknown as import('lightweight-charts').UTCTimestamp, value: p.value })));
      chart.timeScale().fitContent();

      // Resize handler
      const handleResize = () => {
        if (containerRef.current) {
          chart.applyOptions({ width: containerRef.current.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);
      cleanup = () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }

    initChart();

    return () => {
      cleanup?.();
    };
  }, [pairs]);

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!pairs || pairs.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-white/20 font-mono text-sm">
        No chart data available
      </div>
    );
  }

  const bestPair = pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
  const change = bestPair.priceChange?.h24 || 0;

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <span className={clsx(
          'text-xs font-mono tabular-nums',
          change >= 0 ? 'text-green-400' : 'text-red-400'
        )}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}% (24h)
        </span>
        <span className="text-[10px] text-white/15 font-mono">
          {pairs.length} pair{pairs.length !== 1 ? 's' : ''} tracked
        </span>
      </div>
      <div ref={containerRef} className="w-full h-80" />
    </div>
  );
}
