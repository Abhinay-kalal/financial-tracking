'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download, TrendingUp, TrendingDown, Landmark, PieChart as PieIcon, BarChart2, Check
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { mockChartData } from '@/lib/mock-data';
import { formatCurrency, formatNumber } from '@/lib/utils';

const COLORS = ['#53259A', '#22c55e', '#f59e0b', '#ef4444', '#6B3AB1', '#0ea5e9', '#ec4899'];

const incomeBreakdown = [
  { name: 'Services', value: 240000 },
  { name: 'Sales', value: 160000 },
  { name: 'Consulting', value: 85000 },
];

const expenseBreakdown = [
  { name: 'Salaries', value: 450000 },
  { name: 'Rent', value: 65000 },
  { name: 'Software', value: 26900 },
  { name: 'Supplies', value: 12500 },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

interface FintrixTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}
function FintrixTooltip({ active, payload, label }: FintrixTooltipProps) {
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

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('year');
  const [isExported, setIsExported] = useState(false);

  const handleExport = () => {
    setIsExported(true);
    setTimeout(() => setIsExported(false), 2000);
  };

  const totalRevenue = mockChartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = mockChartData.reduce((sum, d) => sum + d.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = ((netProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight">Financial Analytics & Reports</h1>
          <p className="text-[13px] text-[#757575] mt-0.5 font-medium">Visualize revenue trends, expense breakdowns, and export compliant cash logs</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10 w-[160px] bg-white dark:bg-[#162A3E]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
              <SelectItem value="6months" className="text-[13px]">Last 6 Months</SelectItem>
              <SelectItem value="year" className="text-[13px]">FY 2024-25</SelectItem>
              <SelectItem value="all" className="text-[13px]">All Time</SelectItem>
            </SelectContent>
          </Select>
          <button className="btn-fintrix btn-fintrix-outline text-[13px]" onClick={handleExport}>
            {isExported ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" /> Exported CSV
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Export Report
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div {...fade(0.06)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card" style={{ borderTop: '3px solid #53259A' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] text-[#757575] font-medium">Gross Revenue</p>
              <h3 className="text-[20px] font-bold text-[#6B3AB1] dark:text-[#a78bfa] font-['Instrument_Sans',sans-serif] mt-0.5 leading-tight">₹{formatNumber(totalRevenue)}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[rgba(83,37,154,0.08)] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#6B3AB1]" />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #ef4444' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] text-[#757575] font-medium">Gross Expenses</p>
              <h3 className="text-[20px] font-bold font-['Instrument_Sans',sans-serif] mt-0.5 leading-tight text-rose-500">₹{formatNumber(totalExpenses)}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-[#ef4444]" />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #22c55e' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] text-[#757575] font-medium">Net Profit</p>
              <h3 className="text-[20px] font-bold text-[#22c55e] font-['Instrument_Sans',sans-serif] mt-0.5 leading-tight">₹{formatNumber(netProfit)}</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-[#22c55e]" />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #0ea5e9' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] text-[#757575] font-medium">Operating Margin</p>
              <h3 className="text-[20px] font-bold text-[#0ea5e9] font-['Instrument_Sans',sans-serif] mt-0.5 leading-tight">{margin}%</h3>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-[#0ea5e9]" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main bar comparison chart */}
      <motion.div {...fade(0.12)} className="fintrix-card p-5">
        <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] mb-5">Revenue vs Expense vs Net Profit Comparison</h2>
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockChartData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(216,223,229,0.5)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#757575' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#757575' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${formatNumber(v)}`} />
              <Tooltip content={<FintrixTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
              <Bar dataKey="revenue" fill="#53259A" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              <Bar dataKey="profit" fill="#22c55e" radius={[4, 4, 0, 0]} name="Net Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Sub Category Breakdowns */}
      <motion.div {...fade(0.18)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="fintrix-card p-5">
          <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#53259A]" /> Income Breakdown
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-around py-4">
            <div className="w-[180px] h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {incomeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 mt-4 sm:mt-0">
              {incomeBreakdown.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2.5 text-[12px]">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[#757575] font-medium w-20">{entry.name}:</span>
                  <span className="font-semibold text-[#0E1C29] dark:text-white">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="fintrix-card p-5">
          <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-rose-500" /> Expense Breakdown
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-around py-4">
            <div className="w-[180px] h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4 sm:mt-0">
              {expenseBreakdown.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2.5 text-[12px]">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-[#757575] font-medium w-20">{entry.name}:</span>
                  <span className="font-semibold text-[#0E1C29] dark:text-white">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
