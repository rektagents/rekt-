'use client';

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-6 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              REKT
            </span>
            <span className="text-sm text-gray-500">Crypto Tracker</span>
          </div>
          <p className="text-sm text-gray-500">
            Data provided by CoinGecko. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
