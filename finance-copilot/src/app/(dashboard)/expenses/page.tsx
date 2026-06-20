'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, TrendingDown, Edit2, Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockExpenses } from '@/lib/mock-data';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { expenseService } from '@/lib/api/services';
import type { Expense, ExpenseCategory } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema, type ExpenseInput } from '@/lib/validations';
import { toast } from 'react-hot-toast';

const PIE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#0ea5e9', '#6B3AB1', '#ec4899', '#53259A'];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Expense | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { status: 'paid', paymentMethod: 'bank_transfer' },
  });

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const res = await expenseService.getAll();
      if (res.success) {
        setExpenses(res.data);
      }
    } catch (error) {
      toast.error('Failed to load expense data');
    } finally {
      setIsLoading(false);
    }
  };

  import('react').then(React => {
    React.useEffect(() => {
      fetchExpenses();
    }, []);
  });

  const filtered = expenses.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paid = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const pending = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);

  const categoryData = EXPENSE_CATEGORIES.map(cat => ({
    name: cat.label,
    value: expenses.filter(e => e.category === cat.value).reduce((sum, e) => sum + e.amount, 0),
  })).filter(d => d.value > 0);

  const openAdd = () => { setEditItem(null); reset({ status: 'paid', paymentMethod: 'bank_transfer' }); setDialogOpen(true); };
  
  const openEdit = (item: Expense) => {
    setEditItem(item);
    reset({ title: item.title, amount: item.amount, category: item.category, date: item.date, vendorName: item.vendorName, description: item.description, paymentMethod: item.paymentMethod, status: item.status });
    setDialogOpen(true);
  };
  
  const onDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await expenseService.delete(id);
      if (res.success) {
        toast.success('Expense deleted successfully');
        fetchExpenses();
      }
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };
  
  const onSubmit = async (data: ExpenseInput) => {
    const formattedData = {
      ...data,
      category: data.category as ExpenseCategory,
      paymentMethod: data.paymentMethod as 'bank_transfer' | 'cash' | 'upi' | 'cheque' | 'card',
    };
    
    try {
      if (editItem) {
        const res = await expenseService.update(editItem.id, formattedData);
        if (res.success) {
          toast.success('Expense updated successfully');
          fetchExpenses();
          setDialogOpen(false);
          reset();
        }
      } else {
        const res = await expenseService.create(formattedData);
        if (res.success) {
          toast.success('Expense added successfully');
          fetchExpenses();
          setDialogOpen(false);
          reset();
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save expense');
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight">Expense Ledger</h1>
          <p className="text-[13px] text-[#757575] mt-0.5 font-medium">Monitor and audit company operating expenses</p>
        </div>
        <button className="btn-fintrix btn-fintrix-primary text-[13px]" onClick={openAdd} id="add-expense-btn">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div {...fade(0.06)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Expenses', value: total, accent: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)' },
          { label: 'Total Paid', value: paid, accent: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.18)' },
          { label: 'Total Pending', value: pending, accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.accent}` }}>
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <TrendingDown className="w-5 h-5" style={{ color: s.accent }} />
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
                placeholder="Search expense details..."
                className="fintrix-input pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="expense-search"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button className="btn-fintrix btn-fintrix-ghost border border-[#D8DFE5] dark:border-white/[0.08] p-2 h-[40px] w-[40px] flex items-center justify-center rounded-lg">
                <Filter className="w-4 h-4" />
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
                  <th>Receipt</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-[#757575]">Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-[#757575]">No expense records found</td>
                  </tr>
                ) : filtered.map(expense => (
                  <tr key={expense.id} className="group">
                    <td>
                      <div>
                        <p className="font-semibold text-[#0E1C29] dark:text-white text-[13.5px]">{expense.title}</p>
                        {expense.vendorName && <p className="text-[11px] text-[#757575] font-medium mt-0.5">{expense.vendorName}</p>}
                      </div>
                    </td>
                    <td>
                      <span className="fintrix-badge badge-navy capitalize">{expense.category}</span>
                    </td>
                    <td className="text-[#757575] text-[13px]">{formatDate(expense.date)}</td>
                    <td className="text-[#757575] text-[13px] capitalize">{expense.paymentMethod.replace('_', ' ')}</td>
                    <td className="font-bold text-[#dc2626] text-[13.5px]">{formatCurrency(expense.amount)}</td>
                    <td>
                      <span className={`fintrix-badge text-[11px] ${expense.status === 'paid' ? 'badge-green' : 'badge-amber'}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td>
                      {expense.receiptUrl ? (
                        <span className="fintrix-badge badge-purple text-[10.5px] cursor-pointer">View</span>
                      ) : (
                        <button className="flex items-center gap-1 text-[11px] text-[#53259A] dark:text-[#a78bfa] font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer">
                          <Upload className="w-3 h-3" /> Upload
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-md hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white" onClick={() => openEdit(expense)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-rose-500/10 text-[#757575] hover:text-rose-500" onClick={() => onDelete(expense.id)}>
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
                  {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
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
              {editItem ? 'Edit Expense' : 'Add Expense Record'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Title</Label>
              <input placeholder="e.g. Server Hosting" className="fintrix-input" {...register('title')} />
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
                <Select onValueChange={v => setValue('category', v as ExpenseInput['category'])}>
                  <SelectTrigger className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                    {EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value} className="text-[13px]">{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Payment Method</Label>
                <Select onValueChange={v => setValue('paymentMethod', v as ExpenseInput['paymentMethod'])}>
                  <SelectTrigger className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                    {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value} className="text-[13px]">{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Vendor Name (optional)</Label>
              <input placeholder="Vendor name" className="fintrix-input" {...register('vendorName')} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Upload Receipt</Label>
              <input type="file" accept="image/*,.pdf" className="fintrix-input pt-1.5 cursor-pointer" />
            </div>
            <DialogFooter className="pt-4">
              <button type="button" className="btn-fintrix btn-fintrix-ghost border border-[#D8DFE5] dark:border-white/[0.08] text-[13px] px-4 py-2" onClick={() => setDialogOpen(false)}>Cancel</button>
              <button type="submit" className="btn-fintrix btn-fintrix-primary text-[13px] px-4 py-2" id="save-expense-btn">{editItem ? 'Update' : 'Add Expense'}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
