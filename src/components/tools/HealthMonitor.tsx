'use client';

import { useState } from 'react';
import { clsx } from 'clsx';

interface HealthResult {
  url: string;
  status: 'up' | 'down' | 'timeout';
  statusCode: number | null;
  responseTime: number;
  checkedAt: string;
}

export function HealthMonitor() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<HealthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HealthResult[]>([]);

  async function checkHealth() {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('/api/tools/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.startsWith('http') ? url : `https://${url}` }),
      });
      const data = await res.json();
      const entry: HealthResult = {
        url: data.url || url,
        status: data.status,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        checkedAt: new Date().toLocaleTimeString(),
      };
      setResult(entry);
      setHistory((prev) => [entry, ...prev].slice(0, 10));
    } catch {
      setResult({
        url,
        status: 'down',
        statusCode: null,
        responseTime: 0,
        checkedAt: new Date().toLocaleTimeString(),
      });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-white/60 uppercase font-mono tracking-widest mb-2">
          Agent Health Monitor
        </h3>
        <p className="text-xs text-white/30 font-mono mb-4">
          Ping any agent endpoint to check uptime and response time
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkHealth()}
          placeholder="https://your-agent.example.com/health"
          className="flex-1 bg-black border border-white/10 px-4 py-3 text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
        />
        <button
          onClick={checkHealth}
          disabled={loading || !url}
          className={clsx(
            'px-6 py-3 text-sm font-bold font-mono transition-colors',
            loading || !url
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-white text-black hover:bg-white/90'
          )}
        >
          {loading ? '...' : 'PING'}
        </button>
      </div>

      {result && (
        <div className="border border-white/10 bg-black">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={clsx(
                'w-3 h-3 rounded-full',
                result.status === 'up' ? 'bg-green-500' :
                result.status === 'timeout' ? 'bg-yellow-500' :
                'bg-red-500'
              )} />
              <span className="text-white font-mono text-sm font-bold uppercase">
                {result.status}
              </span>
              {result.statusCode && (
                <span className="text-white/30 font-mono text-xs">
                  HTTP {result.statusCode}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10">
              <div className="bg-black p-4">
                <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">Response Time</p>
                <p className="text-lg font-bold text-white font-mono tabular-nums">{result.responseTime}ms</p>
              </div>
              <div className="bg-black p-4">
                <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-1">Checked At</p>
                <p className="text-lg font-bold text-white font-mono tabular-nums">{result.checkedAt}</p>
              </div>
            </div>
            <p className="text-[10px] text-white/20 font-mono mt-3 truncate">{result.url}</p>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h4 className="text-[10px] text-white/30 font-mono uppercase tracking-widest mb-3">History</h4>
          <div className="border border-white/10 divide-y divide-white/5">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2">
                <div className={clsx(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  h.status === 'up' ? 'bg-green-500' :
                  h.status === 'timeout' ? 'bg-yellow-500' :
                  'bg-red-500'
                )} />
                <span className="text-xs text-white/40 font-mono truncate flex-1">{h.url}</span>
                <span className="text-xs text-white/30 font-mono tabular-nums">{h.responseTime}ms</span>
                <span className="text-[10px] text-white/20 font-mono">{h.checkedAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
