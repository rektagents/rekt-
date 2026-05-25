'use client';

import { clsx } from 'clsx';
import type { Chain } from '@/types/chain';

interface ChainBadgeProps {
  chain: Chain;
  size?: 'sm' | 'md';
  showName?: boolean;
  className?: string;
}

export function ChainBadge({ chain, size = 'sm', showName = false, className }: ChainBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-medium',
        {
          'px-1.5 py-0.5 text-xs': size === 'sm',
          'px-2.5 py-1 text-sm': size === 'md',
        },
        className
      )}
      style={{
        backgroundColor: `${chain.color}20`,
        color: chain.color,
        border: `1px solid ${chain.color}40`,
      }}
    >
      <span>{chain.icon}</span>
      {showName && <span>{chain.shortName}</span>}
    </span>
  );
}
