'use client';

import { useState } from 'react';

interface TokenIconProps {
  src?: string;
  alt: string;
  symbol?: string;
  size: number;
  className?: string;
}

export function TokenIcon({ src, alt, symbol, size, className = '' }: TokenIconProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    const letter = (symbol || alt || '?')[0].toUpperCase();
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-white/10 text-white/40 font-mono font-bold shrink-0 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {letter}
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={() => setError(true)}
    />
  );
}
