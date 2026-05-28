'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';

const STORAGE_KEY = 'rekt-onboarded';

const steps = [
  {
    title: 'Welcome to REKT',
    description: 'Real-time crypto intelligence for builders, traders, and autonomous agents on Base.',
    tag: 'get started',
  },
  {
    title: 'Track Everything',
    description: '1000+ tokens with 10-second refresh. Prices, volume, market cap, and liquidity across every DEX.',
    tag: 'market data',
  },
  {
    title: 'Discover Agents',
    description: 'Browse the agent directory. Track agent tokens. Find builders to hire in the marketplace.',
    tag: 'agents',
  },
  {
    title: 'Earn REKT',
    description: 'Complete quests, maintain streaks, and climb the leaderboard. Connect your wallet to start earning.',
    tag: 'rewards',
  },
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { isConnected, connectWallet, connectors } = useWallet();

  useEffect(() => {
    const onboarded = localStorage.getItem(STORAGE_KEY);
    if (!onboarded) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleSkip} />
      <div className="relative bg-black border border-white/20 max-w-md w-full">
        {/* Progress */}
        <div className="flex border-b border-white/10">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-0.5 transition-colors ${
                i <= step ? 'bg-white' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="p-8">
          <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-4 block">
            {current.tag}
          </span>
          <h2 className="text-2xl font-black tracking-tight mb-4">{current.title}</h2>
          <p className="text-white/50 font-mono text-sm leading-relaxed mb-8">
            {current.description}
          </p>

          {/* Wallet connect on last step */}
          {isLast && !isConnected && (
            <div className="mb-6 border border-white/10 p-4">
              <p className="text-white/40 text-xs font-mono mb-3">Connect to start earning:</p>
              <div className="space-y-2">
                {connectors.map((connector: any) => (
                  <button
                    key={connector.uid}
                    onClick={() => connectWallet()}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors text-xs font-mono"
                  >
                    <span className="w-5 h-5 border border-white/10 flex items-center justify-center text-[10px]">
                      {connector.name === 'MetaMask' ? 'M' : connector.name === 'Coinbase Wallet' ? 'C' : 'W'}
                    </span>
                    {connector.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLast && isConnected && (
            <div className="mb-6 border border-green-400/20 p-4 bg-green-400/5">
              <p className="text-green-400 text-xs font-mono">Wallet connected. You're ready to go.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-white/30 hover:text-white/60 text-xs font-mono transition-colors"
            >
              Skip
            </button>
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-white/10 text-white/40 hover:text-white text-xs font-mono transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-white text-black text-xs font-mono font-bold hover:bg-white/90 transition-colors"
              >
                {isLast ? "Let's go" : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
