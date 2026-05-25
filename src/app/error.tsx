'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="text-center">
        <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">error</p>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Something went wrong</h2>
        <p className="text-white/40 font-mono text-sm mb-6">{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-white text-black text-xs font-bold font-mono uppercase tracking-widest hover:bg-white/90 transition-colors"
        >
          try again
        </button>
      </div>
    </div>
  );
}
