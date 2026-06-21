'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketData {
  nifty: { price: number; changePercent: number } | null;
  sensex: { price: number; changePercent: number } | null;
}

interface ExchangeRates {
  INR: number;
  EUR: number;
  GBP: number;
}

function TickerItem({ label, value, change }: { label: string; value: string; change?: number }) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="flex items-center gap-2 px-4 py-1 border-r border-[#D8DFE5] dark:border-white/[0.07] last:border-r-0">
      <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wide">{label}</span>
      <span className="text-[12px] font-bold text-[#0E1C29] dark:text-white">{value}</span>
      {change !== undefined && (
        <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change).toFixed(2)}%
        </span>
      )}
    </div>
  );
}

export default function MarketTicker() {
  const [market, setMarket] = useState<MarketData>({ nifty: null, sensex: null });
  const [rates, setRates] = useState<ExchangeRates | null>(null);

  const fetchData = async () => {
    try {
      const [mRes, rRes] = await Promise.allSettled([
        fetch('/api/external/market'),
        fetch('/api/external/currency'),
      ]);

      if (mRes.status === 'fulfilled' && mRes.value.ok) {
        const j = await mRes.value.json();
        if (j.success) setMarket(j.data);
      }
      if (rRes.status === 'fulfilled' && rRes.value.ok) {
        const j = await rRes.value.json();
        if (j.success) setRates(j.data);
      }
    } catch {
      // silently fail — ticker is non-critical
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center overflow-x-auto no-scrollbar">
      {market.nifty && (
        <TickerItem
          label="NIFTY 50"
          value={market.nifty.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          change={market.nifty.changePercent}
        />
      )}
      {market.sensex && (
        <TickerItem
          label="SENSEX"
          value={market.sensex.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          change={market.sensex.changePercent}
        />
      )}
      {rates && (
        <>
          <TickerItem label="USD/INR" value={`₹${rates.INR.toFixed(2)}`} />
          <TickerItem label="EUR/INR" value={`₹${(rates.INR / rates.EUR).toFixed(2)}`} />
          <TickerItem label="GBP/INR" value={`₹${(rates.INR / rates.GBP).toFixed(2)}`} />
        </>
      )}
      {!market.nifty && !rates && (
        <span className="text-[11px] text-[#757575] px-4">Loading market data...</span>
      )}
    </div>
  );
}
