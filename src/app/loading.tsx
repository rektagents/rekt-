'use client';

import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <Skeleton className="h-6 w-48 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-white/10 bg-white/10 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-black p-4">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-5 w-28" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-7 w-7" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20 ml-auto" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
