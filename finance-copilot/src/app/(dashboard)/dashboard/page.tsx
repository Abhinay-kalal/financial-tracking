'use client';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Clock, AlertCircle, Banknote,
  ArrowUpRight, ArrowDownRight, Plus, ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import {
  mockDashboardStats, mockChartData, mockTransactions,
  mockReceivables, mockPayables,
} from '@/lib/mock-data';
import { reportService, payableService, receivableService, incomeService, expenseService } from '@/lib/api/services';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}
function FintrixTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#162A3E] border border-[#D8DFE5] dark:border-white/[0.08] rounded-xl px-4 py-3 shadow-xl shadow-[#0E1C29]/10">
      <p className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider mb-2">{label}</p>
      {payload.map((e) => (
        <div key={e.name} className="flex items-center gap-2 text-[12.5px]">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.color }} />
          <span className="text-[#757575] capitalize">{e.name}:</span>
          <span className="font-semibold text-[#0E1C29] dark:text-white">{formatCurrency(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [payables, setPayables] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>(mockTransactions);

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsRes = await reportService.getDashboardStats();
        if (statsRes.success) setStats(statsRes.data);
        
        const payRes = await payableService.getAll();
        if (payRes.success) setPayables(payRes.data.slice(0, 5)); // Just take top 5

        const recRes = await receivableService.getAll();
        if (recRes.success) setReceivables(recRes.data.slice(0, 5));

        // Let's assume income and expenses have recent list in API, if not we fall back to mock
        // ...
      } catch (e) {
        toast.error('Failed to load dashboard data');
      }
    };
    loadData();
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue || 0,
      change: stats?.revenueChange || 0,
      icon: TrendingUp,
      accent: '#22c55e',
      accentBg: 'rgba(34,197,94,0.08)',
      accentBorder: 'rgba(34,197,94,0.18)',
    },
    {
      title: 'Total Expenses',
      value: stats?.totalExpenses || 0,
      change: stats?.expenseChange || 0,
      icon: TrendingDown,
      accent: '#ef4444',
      accentBg: 'rgba(239,68,68,0.08)',
      accentBorder: 'rgba(239,68,68,0.18)',
      negative: true,
    },
    {
      title: 'Net Profit',
      value: stats?.netProfit || 0,
      change: stats?.profitChange || 0,
      icon: DollarSign,
      accent: '#53259A',
      accentBg: 'rgba(83,37,154,0.08)',
      accentBorder: 'rgba(83,37,154,0.18)',
    },
    {
      title: 'Receivables',
      value: stats?.outstandingReceivables || 0,
      icon: Clock,
      accent: '#f59e0b',
      accentBg: 'rgba(245,158,11,0.08)',
      accentBorder: 'rgba(245,158,11,0.18)',
    },
    {
      title: 'Payables',
      value: stats?.outstandingPayables || 0,
      icon: AlertCircle,
      accent: '#f97316',
      accentBg: 'rgba(249,115,22,0.08)',
      accentBorder: 'rgba(249,115,22,0.18)',
    },
    {
      title: 'Cash Position',
      value: stats?.cashPosition || 0,
      icon: Banknote,
      accent: '#0ea5e9',
      accentBg: 'rgba(14,165,233,0.08)',
      accentBorder: 'rgba(14,165,233,0.18)',
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">

      {/* ── Header ── */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight">
            Overview
          </h1>
          <p className="text-[13px] text-[#757575] mt-0.5">Welcome back — here's your financial snapshot</p>
        </div>
        <Link href="/invoices/create">
          <button className="btn-fintrix btn-fintrix-primary text-[13px]" id="new-invoice-btn">
            <Plus className="w-4 h-4" />
            New Invoice
          </button>
        </Link>
      </motion.div>

      {/* ── KPI Cards ── */}
      <motion.div {...fade(0.06)} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="stat-card"
            style={{ borderTop: `3px solid ${card.accent}` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: card.accentBg, border: `1px solid ${card.accentBorder}` }}
              >
                <card.icon className="w-4 h-4" style={{ color: card.accent }} />
              </div>
              {card.change !== undefined && (
                <div
                  className="flex items-center gap-0.5 text-[11.5px] font-semibold"
                  style={{
                    color: card.negative
                      ? (card.change > 0 ? '#dc2626' : '#16a34a')
                      : (card.change > 0 ? '#16a34a' : '#dc2626'),
                  }}
                >
                  {card.change > 0
                    ? <ArrowUpRight className="w-3.5 h-3.5" />
                    : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(card.change).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-[19px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] leading-tight">
              ₹{formatNumber(card.value)}
            </p>
            <p className="text-[11.5px] text-[#757575] mt-1">{card.title}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Charts ── */}
      <motion.div {...fade(0.12)} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Revenue & Expense Trend — 3/5 */}
        <div className="lg:col-span-3 fintrix-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">Revenue vs Expenses</h2>
              <p className="text-[11.5px] text-[#757575] mt-0.5">Jan – Dec 2024 · Monthly</p>
            </div>
            <div className="flex items-center gap-3 text-[11.5px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#53259A]" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />Expenses</span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ left: -10 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#53259A" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#53259A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(216,223,229,0.6)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#757575' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#757575' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${formatNumber(v)}`} />
                <Tooltip content={<FintrixTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#53259A" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#53259A' }} />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expGrad)" dot={false} activeDot={{ r: 4, fill: '#ef4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Profit — 2/5 */}
        <div className="lg:col-span-2 fintrix-card p-5">
          <div className="mb-5">
            <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">Net Profit</h2>
            <p className="text-[11.5px] text-[#757575] mt-0.5">Monthly after expenses</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData} margin={{ left: -15 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#22c55e" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(216,223,229,0.6)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#757575' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#757575' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${formatNumber(v)}`} />
                <Tooltip content={<FintrixTooltip />} />
                <Bar dataKey="profit" fill="url(#profitGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ── Transactions + Due Payments ── */}
      <motion.div {...fade(0.18)} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Transactions */}
        <div className="fintrix-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8DFE5] dark:border-white/[0.07]">
            <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">Recent Transactions</h2>
            <Link href="/income">
              <button className="flex items-center gap-1 text-[12px] text-[#53259A] dark:text-[#a78bfa] font-semibold hover:underline">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          <div className="divide-y divide-[#F4F7FA] dark:divide-white/[0.04]">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F4F7FA]/60 dark:hover:bg-white/[0.02] transition-colors">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: tx.type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  }}
                >
                  {tx.type === 'income'
                    ? <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} />
                    : <TrendingDown className="w-4 h-4" style={{ color: '#ef4444' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#0E1C29] dark:text-white truncate">{tx.title}</p>
                  <p className="text-[11.5px] text-[#757575]">{formatDate(tx.date)} · {tx.category}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className="text-[13px] font-semibold"
                    style={{ color: tx.type === 'income' ? '#16a34a' : '#dc2626' }}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <span
                    className="fintrix-badge text-[10.5px]"
                    style={
                      tx.status === 'received' || tx.status === 'paid'
                        ? { background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }
                        : { background: 'rgba(245,158,11,0.1)', color: '#b45309', border: '1px solid rgba(245,158,11,0.2)' }
                    }
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Due */}
        <div className="fintrix-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8DFE5] dark:border-white/[0.07]">
            <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">Upcoming Due Payments</h2>
            <Link href="/payables">
              <button className="flex items-center gap-1 text-[12px] text-[#53259A] dark:text-[#a78bfa] font-semibold hover:underline">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          <div className="divide-y divide-[#F4F7FA] dark:divide-white/[0.04]">
            {payables.length === 0 && receivables.length === 0 ? (
               <div className="p-6 text-center text-[#757575] text-[13px]">No upcoming due payments.</div>
            ) : null}
            {payables.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F4F7FA]/60 dark:hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[rgba(245,158,11,0.1)] flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#0E1C29] dark:text-white truncate">{p.vendorName}</p>
                  <p className="text-[11.5px] text-[#757575] truncate">{p.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-semibold text-[#0E1C29] dark:text-white">{formatCurrency(p.balance)}</p>
                  <span
                    className="fintrix-badge text-[10.5px]"
                    style={
                      p.status === 'overdue'
                        ? { background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }
                        : { background: 'rgba(245,158,11,0.1)', color: '#b45309', border: '1px solid rgba(245,158,11,0.2)' }
                    }
                  >
                    {p.status === 'overdue' ? 'Overdue' : `Due ${formatDate(p.dueDate, 'dd MMM')}`}
                  </span>
                </div>
              </div>
            ))}
            {receivables.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F4F7FA]/60 dark:hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[rgba(83,37,154,0.08)] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-[#6B3AB1]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#0E1C29] dark:text-white truncate">{r.clientName}</p>
                  <p className="text-[11.5px] text-[#757575]">{r.invoiceNumber}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-semibold text-[#6B3AB1] dark:text-[#a78bfa]">{formatCurrency(r.balance)}</p>
                  <span className="fintrix-badge badge-purple text-[10.5px]">Receivable</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
