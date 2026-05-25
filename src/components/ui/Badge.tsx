'use client';

import { clsx } from 'clsx';

interface BadgeProps {
  value: number | string;
  variant?: 'gain' | 'loss' | 'neutral';
  className?: string;
}

export function Badge({ value, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center text-sm font-medium',
        {
          'text-green-400': variant === 'gain',
          'text-red-400': variant === 'loss',
          'text-gray-400': variant === 'neutral',
        },
        className
      )}
    >
      {typeof value === 'number' ? (
        <>
          {value >= 0 ? (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {typeof value === 'number' ? `${Math.abs(value).toFixed(2)}%` : value}
        </>
      ) : (
        value
      )}
    </span>
  );
}
