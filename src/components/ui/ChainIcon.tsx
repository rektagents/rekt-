'use client';

import { clsx } from 'clsx';
import type { ChainId } from '@/types/chain';

interface ChainIconProps {
  chainId: ChainId;
  size?: number;
  className?: string;
}

export function ChainIcon({ chainId, size = 20, className }: ChainIconProps) {
  const props = {
    width: size,
    height: size,
    className: clsx('rounded-full', className),
  };

  switch (chainId) {
    case 'ethereum':
      return (
        <svg {...props} viewBox="0 0 32 32">
          <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#627EEA"/>
          <path d="M16.498 4V12.87L24 16.22L16.498 4Z" fill="white" fillOpacity="0.602"/>
          <path d="M16.498 4L9 16.22L16.498 12.87V4Z" fill="white"/>
          <path d="M16.498 21.968V27.995L24 17.616L16.498 21.968Z" fill="white" fillOpacity="0.602"/>
          <path d="M16.498 27.995V21.967L9 17.616L16.498 27.995Z" fill="white"/>
          <path d="M16.498 20.573L24 16.22L16.498 12.872V20.573Z" fill="white" fillOpacity="0.2"/>
          <path d="M9 16.22L16.498 20.573V12.872L9 16.22Z" fill="white" fillOpacity="0.602"/>
        </svg>
      );

    case 'solana':
      return (
        <svg {...props} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="url(#solana-gradient)"/>
          <path d="M10.5 21.5L16 27L21.5 21.5H10.5ZM10.5 10.5H21.5L16 5L10.5 10.5ZM16 13.25L21.5 18.75H10.5L16 13.25Z" fill="white"/>
          <defs>
            <linearGradient id="solana-gradient" x1="0" y1="32" x2="32" y2="0">
              <stop stopColor="#9945FF"/>
              <stop offset="1" stopColor="#14F195"/>
            </linearGradient>
          </defs>
        </svg>
      );

    case 'binance-smart-chain':
      return (
        <svg {...props} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#F0B90B"/>
          <path d="M16 6L12 10L16 14L20 10L16 6ZM12 10L8 14L12 18L16 14L12 10ZM20 10L24 14L20 18L16 14L20 10ZM8 14L12 18L8 22L4 18L8 14ZM24 14L28 18L24 22L20 18L24 14ZM12 18L16 22L20 18L16 14L12 18ZM12 18L16 22L20 18L12 18ZM16 22L12 26L16 30L20 26L16 22Z" fill="white"/>
        </svg>
      );

    case 'polygon-pos':
      return (
        <svg {...props} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#8247E5"/>
          <path d="M21.5 12L16 8.5L10.5 12V19L16 22.5L21.5 19V12ZM16 15.5L10.5 12L16 8.5L21.5 12L16 15.5ZM16 15.5V22.5L21.5 19V12L16 15.5Z" fill="white"/>
        </svg>
      );

    case 'avalanche':
      return (
        <svg {...props} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#E84142"/>
          <path d="M18.5 22H22L16 10L10 22H13.5L16 17L18.5 22Z" fill="white"/>
        </svg>
      );

    case 'arbitrum-one':
      return (
        <svg {...props} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#28A0F0"/>
          <path d="M16 6L22 16L16 26L10 16L16 6ZM16 10L12 16L16 22L20 16L16 10Z" fill="white"/>
          <circle cx="16" cy="16" r="3" fill="#28A0F0"/>
        </svg>
      );

    case 'optimistic-ethereum':
      return (
        <svg {...props} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#FF0420"/>
          <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8ZM16 20C13.7909 20 12 18.2091 12 16C12 13.7909 13.7909 12 16 12C18.2091 12 20 13.7909 20 16C20 18.2091 18.2091 20 16 20Z" fill="white"/>
          <circle cx="16" cy="16" r="3" fill="#FF0420"/>
        </svg>
      );

    case 'base':
      return (
        <svg {...props} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#0052FF"/>
          <path d="M16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24ZM16 20C18.2091 20 20 18.2091 20 16C20 13.7909 18.2091 12 16 12C13.7909 12 12 13.7909 12 16C12 18.2091 13.7909 20 16 20Z" fill="white"/>
        </svg>
      );

    case 'bitcoin':
      return (
        <svg {...props} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#F7931A"/>
          <path d="M23 14.5C23 10.5 20 8.5 16.5 8L16 6H14.5V8.5H13V6H11.5V8.5H9.5V10.5H11.5V21.5H9.5V23.5H11.5V26H13V23.5H14.5V26H16V23.5H16.5C20 23.5 23 21.5 23 17.5C23 16 22 14.5 20.5 14C21.5 13.5 23 13 23 14.5ZM18 18C18 20 16.5 21 15 21H14V15H15C16.5 15 18 16 18 18ZM18 13H15V10H16.5C18 10 18 12 18 13Z" fill="white"/>
        </svg>
      );

    default:
      return (
        <svg {...props} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#6B7280"/>
          <path d="M16 8L20 16L16 24L12 16L16 8Z" fill="white"/>
        </svg>
      );
  }
}
