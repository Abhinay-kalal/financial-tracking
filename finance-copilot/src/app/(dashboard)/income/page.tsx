'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, TrendingUp, Edit2, Trash2, ArrowUpDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockIncomes } from '@/lib/mock-data';
import { formatCurrency, formatDate, INCOME_CATEGORIES, PAYMENT_METHODS } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { incomeService } from '@/lib/api/services';
import type { Income, IncomeCategory } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { incomeSchema, type IncomeInput } from '@/lib/validations';
import { toast } from 'react-hot-toast';

const PIE_COLORS = ['#53259A', '#6B3AB1', '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9', '#84cc16'];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Income | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: { status: 'received', paymentMethod: 'bank_transfer' },
  });

  const fetchIncomes = async () => {
    try {
      setIsLoading(true);
      const res = await incomeService.getAll();
      if (res && res.success) {
        setIncomes(res.data);
      } else {
        setIncomes(mockIncomes);
      }
    } catch (error) {
      setIncomes(mockIncomes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const filtered = incomes.filter(i =>
    (i.title?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (i.category?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const received = incomes.filter(i => i.status === 'received').reduce((sum, i) => sum + i.amount, 0);
  const pending = incomes.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);

  const categoryData = INCOME_CATEGORIES.map(cat => ({
    name: cat.label,
    value: incomes.filter(i => i.category === cat.value).reduce((sum, i) => sum + i.amount, 0),
  })).filter(d => d.value > 0);

  const openAdd = () => {
    setEditItem(null);
    reset({ status: 'received', paymentMethod: 'bank_transfer' });
    setDialogOpen(true);
  };

  const openEdit = (item: Income) => {
    setEditItem(item);
    reset({
      title: item.title,
      amount: item.amount,
      category: item.category,
      date: item.date,
      clientName: item.clientName,
      description: item.description || '',
      paymentMethod: item.paymentMethod,
      status: item.status,
    });
    setDialogOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this income record?')) return;
    try {
      const res = await incomeService.delete(id);
      if (res && res.success) {
        toast.success('Income deleted successfully');
        fetchIncomes();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      setIncomes(prev => prev.filter(item => item.id !== id));
      toast.success('Income deleted successfully (local)');
    }
  };

  const onSubmit = async (data: IncomeInput) => {
    const formattedData = {
      ...data,
      category: data.category as IncomeCategory,
      paymentMethod: data.paymentMethod as 'bank_transfer' | 'cash' | 'upi' | 'cheque' | 'card',
    };
    
    try {
      if (editItem) {
        const res = await incomeService.update(editItem.id, formattedData);
        if (res && res.success) {
          toast.success('Income updated successfully');
          fetchIncomes();
          setDialogOpen(false);
          reset();
        } else {
          throw new Error('Update failed');
        }
      } else {
        const res = await incomeService.create(formattedData);
        if (res && res.success) {
          toast.success('Income added successfully');
          fetchIncomes();
          setDialogOpen(false);
          reset();
        } else {
          throw new Error('Create failed');
        }
      }
    } catch (error: any) {
      if (editItem) {
        const updatedItem = { ...editItem, ...formattedData, date: data.date } as Income;
        setIncomes(prev => prev.map(item => item.id === editItem.id ? updatedItem : item));
        toast.success('Income updated successfully (local)');
      } else {
        const newItem = {
          id: Math.random().toString(),
          ...formattedData,
          date: data.date,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Income;
        setIncomes(prev => [newItem, ...prev]);
        toast.success('Income added successfully (local)');
      }
      setDialogOpen(false);
      reset();
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight">Income Ledger</h1>
          <p className="text-[13px] text-[#757575] mt-0.5 font-medium">Track and manage all revenue streams and payments</p>
        </div>
        <button className="btn-fintrix btn-fintrix-primary text-[13px]" onClick={openAdd} id="add-income-btn">
          <Plus className="w-4 h-4" /> Add Income
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div {...fade(0.06)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: totalIncome, accent: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.18)' },
          { label: 'Total Received', value: received, accent: '#53259A', bg: 'rgba(83,37,154,0.08)', border: 'rgba(83,37,154,0.18)' },
          { label: 'Total Pending', value: pending, accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.accent}` }}>
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <TrendingUp className="w-5 h-5" style={{ color: s.accent }} />
              </div>
              <div>
                <p className="text-[11.5px] text-[#757575] font-medium">{s.label}</p>
                <p className="text-[20px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] leading-tight mt-0.5">{formatCurrency(s.value)}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Table - 3/4 */}
        <motion.div {...fade(0.12)} className="xl:col-span-3 fintrix-card overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-3 px-5 py-4 border-b border-[#D8DFE5] dark:border-white/[0.07] bg-white dark:bg-[#162A3E]">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
              <input
                placeholder="Search income details..."
                className="fintrix-input pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="income-search"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button className="btn-fintrix btn-fintrix-ghost border border-[#D8DFE5] dark:border-white/[0.08] p-2 h-[40px] w-[40px] flex items-center justify-center rounded-lg">
                <Filter className="w-4 h-4" />
              </button>
              <button className="btn-fintrix btn-fintrix-ghost border border-[#D8DFE5] dark:border-white/[0.08] p-2 h-[40px] w-[40px] flex items-center justify-center rounded-lg">
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="fintrix-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#757575]">Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#757575]">No income records found</td>
                  </tr>
                ) : filtered.map(income => (
                  <tr key={income.id} className="group">
                    <td>
                      <div>
                        <p className="font-semibold text-[#0E1C29] dark:text-white text-[13.5px]">{income.title}</p>
                        {income.clientName && <p className="text-[11px] text-[#757575] font-medium mt-0.5">{income.clientName}</p>}
                      </div>
                    </td>
                    <td>
                      <span className="fintrix-badge badge-navy capitalize">{income.category}</span>
                    </td>
                    <td className="text-[#757575] text-[13px]">{formatDate(income.date)}</td>
                    <td className="text-[#757575] text-[13px] capitalize">{income.paymentMethod.replace('_', ' ')}</td>
                    <td className="font-bold text-[#16a34a] text-[13.5px]">{formatCurrency(income.amount)}</td>
                    <td>
                      <span className={`fintrix-badge text-[11px] ${income.status === 'received' ? 'badge-green' : 'badge-amber'}`}>
                        {income.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-md hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white" onClick={() => openEdit(income)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-rose-500/10 text-[#757575] hover:text-rose-500" onClick={() => onDelete(income.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Category Pie - 1/4 */}
        <motion.div {...fade(0.18)} className="fintrix-card p-5 h-fit">
          <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] mb-4">By Category</h2>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={4}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {categoryData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[#757575] font-medium">{d.name}</span>
                </div>
                <span className="font-semibold text-[#0E1C29] dark:text-white">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold font-['Instrument_Sans',sans-serif] text-[#0E1C29] dark:text-white">
              {editItem ? 'Edit Income' : 'Add Income Record'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Title</Label>
              <input placeholder="e.g. Consulting Fee" className="fintrix-input" {...register('title')} />
              {errors.title && <p className="text-xs text-rose-500 font-semibold">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Amount (₹)</Label>
                <input type="number" placeholder="0" className="fintrix-input" {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-xs text-rose-500 font-semibold">{errors.amount.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Date</Label>
                <input type="date" className="fintrix-input" {...register('date')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Category</Label>
                <Select onValueChange={v => setValue('category', v as IncomeInput['category'])}>
                  <SelectTrigger className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                    {INCOME_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value} className="text-[13px]">{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Payment Method</Label>
                <Select onValueChange={v => setValue('paymentMethod', v as IncomeInput['paymentMethod'])}>
                  <SelectTrigger className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                    {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value} className="text-[13px]">{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Client Name (optional)</Label>
              <input placeholder="Client name" className="fintrix-input" {...register('clientName')} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Status</Label>
              <Select onValueChange={v => setValue('status', v as 'received' | 'pending')} defaultValue="received">
                <SelectTrigger className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                  <SelectItem value="received" className="text-[13px]">Received</SelectItem>
                  <SelectItem value="pending" className="text-[13px]">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <button type="button" className="btn-fintrix btn-fintrix-ghost border border-[#D8DFE5] dark:border-white/[0.08] text-[13px] px-4 py-2" onClick={() => setDialogOpen(false)}>Cancel</button>
              <button type="submit" className="btn-fintrix btn-fintrix-primary text-[13px] px-4 py-2" id="save-income-btn">
                {editItem ? 'Update' : 'Add Income'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
