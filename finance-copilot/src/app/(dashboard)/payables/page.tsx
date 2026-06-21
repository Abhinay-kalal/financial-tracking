'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, CreditCard, Clock, AlertTriangle, CheckCircle2,
  Calendar, ArrowDownRight, Check
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { payableService } from '@/lib/api/services';
import { mockPayables } from '@/lib/mock-data';
import type { Payable } from '@/types';
import { toast } from 'react-hot-toast';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function PayablesPage() {
  const [payables, setPayables] = useState<Payable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog states
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [paymentAmount, setPaymentAmount] = useState('');
  const [newPayable, setNewPayable] = useState({
    vendorId: '',
    vendorName: '',
    description: '',
    amount: '',
    dueDate: '',
    category: 'other',
  });

  const fetchPayables = async () => {
    try {
      setIsLoading(true);
      const res = await payableService.getAll();
      if (res && res.success) {
        setPayables(res.data);
      } else {
        setPayables(mockPayables);
      }
    } catch (error) {
      setPayables(mockPayables);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayables();
  }, []);

  const handleRecordPayment = async () => {
    if (!selectedPayable) return;
    const payAmt = parseFloat(paymentAmount);
    if (isNaN(payAmt) || payAmt <= 0) return;

    try {
      const res = await payableService.update(selectedPayable.id, { amount: payAmt });
      if (res && res.success) {
        toast.success('Payment recorded');
        fetchPayables();
        setIsPaymentOpen(false);
        setPaymentAmount('');
        setSelectedPayable(null);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      // Local state fallback
      setPayables(prev => prev.map(p => {
        if (p.id === selectedPayable.id) {
          const newAmtPaid = p.amountPaid + payAmt;
          const newBal = Math.max(0, p.amount - newAmtPaid);
          return {
            ...p,
            amountPaid: newAmtPaid,
            balance: newBal,
            status: newBal === 0 ? 'paid' : p.status
          } as Payable;
        }
        return p;
      }));
      toast.success('Payment recorded (local)');
      setIsPaymentOpen(false);
      setPaymentAmount('');
      setSelectedPayable(null);
    }
  };

  const handleAddPayable = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newPayable.amount);
    if (!newPayable.vendorName || isNaN(amt) || amt <= 0 || !newPayable.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const createdPay: Payable = {
      id: Math.random().toString(),
      vendorId: newPayable.vendorId || 'demo-vendor',
      vendorName: newPayable.vendorName,
      description: newPayable.description || 'Vendor Expense',
      amount: amt,
      balance: amt,
      amountPaid: 0,
      dueDate: newPayable.dueDate,
      status: 'outstanding',
      category: newPayable.category,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPayables(prev => [createdPay, ...prev]);
    toast.success('Payable added successfully (local)');
    setIsAddOpen(false);
    setNewPayable({
      vendorId: '',
      vendorName: '',
      description: '',
      amount: '',
      dueDate: '',
      category: 'other',
    });
  };

  const filtered = payables.filter(p => {
    const matchesSearch = p.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = payables.reduce((sum, p) => p.status !== 'paid' ? sum + p.balance : sum, 0);
  const totalOverdue = payables.reduce((sum, p) => p.status === 'overdue' ? sum + p.balance : sum, 0);
  const totalPaid = payables.reduce((sum, p) => sum + p.amountPaid, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight">Outstanding Payables</h1>
          <p className="text-[13px] text-[#757575] mt-0.5 font-medium">Monitor vendor bills, lease payments, and record corporate cash outflows</p>
        </div>
        <button className="btn-fintrix btn-fintrix-primary text-[13px]" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4" /> Add Payable
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div {...fade(0.06)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] text-[#757575] font-medium">Total Outstanding Payables</p>
              <h3 className="text-[20px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] leading-tight mt-0.5">{formatCurrency(totalOutstanding)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[rgba(245,158,11,0.08)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#f59e0b]" />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #ef4444' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] text-[#757575] font-medium">Overdue Payables</p>
              <h3 className="text-[20px] font-bold text-[#dc2626] font-['Instrument_Sans',sans-serif] leading-tight mt-0.5">{formatCurrency(totalOverdue)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[rgba(239,68,68,0.08)] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #22c55e' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] text-[#757575] font-medium">Total Paid Out</p>
              <h3 className="text-[20px] font-bold text-[#16a34a] font-['Instrument_Sans',sans-serif] leading-tight mt-0.5">{formatCurrency(totalPaid)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.08)] flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-[#22c55e]" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div {...fade(0.12)} className="fintrix-card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#162A3E]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
            <input
              placeholder="Search vendor name or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="fintrix-input pl-9"
            />
          </div>
          <div className="w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10 w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                <SelectItem value="all" className="text-[13px]">All Statuses</SelectItem>
                <SelectItem value="outstanding" className="text-[13px]">Outstanding</SelectItem>
                <SelectItem value="partial" className="text-[13px]">Partial</SelectItem>
                <SelectItem value="overdue" className="text-[13px]">Overdue</SelectItem>
                <SelectItem value="paid" className="text-[13px]">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Payables Table */}
      <motion.div {...fade(0.18)} className="fintrix-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fintrix-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Category</th>
                <th>Status</th>
                <th className="text-right">Total Amount</th>
                <th className="text-right">Balance Due</th>
                <th className="text-center" style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-[#757575]">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-[#757575]">No outstanding payables found.</td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="font-semibold text-[#0E1C29] dark:text-white text-[13.5px]">{p.vendorName}</div>
                  </td>
                  <td>
                    <div className="text-[#757575] text-[13px] truncate max-w-[200px]">{p.description}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-[#757575] text-[13px]">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(p.dueDate)}
                    </div>
                  </td>
                  <td className="capitalize">
                    <span className="fintrix-badge badge-navy">{p.category}</span>
                  </td>
                  <td>
                    <span className={`fintrix-badge text-[11px] ${
                      p.status === 'paid' ? 'badge-green' :
                      p.status === 'overdue' ? 'badge-red' :
                      p.status === 'partial' ? 'badge-amber' : 'badge-navy'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-right font-semibold text-[#0E1C29] dark:text-white text-[13.5px]">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="text-right font-bold text-[#6B3AB1] dark:text-[#a78bfa] text-[13.5px]">
                    {formatCurrency(p.balance)}
                  </td>
                  <td>
                    <div className="flex justify-center gap-1">
                      {p.status !== 'paid' && (
                        <button
                          className="p-1.5 rounded-md hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white"
                          onClick={() => {
                            setSelectedPayable(p);
                            setPaymentAmount(String(p.balance));
                            setIsPaymentOpen(true);
                          }}
                          title="Log Outgoing Payment"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {p.status === 'paid' && (
                        <div className="w-7 h-7 flex items-center justify-center text-[#16a34a] bg-emerald-500/10 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold font-['Instrument_Sans',sans-serif] text-[#0E1C29] dark:text-white">Log Outgoing Payment</DialogTitle>
            <DialogDescription className="text-[12.5px] text-[#757575]">
              Record a payment made to {selectedPayable?.vendorName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Total Outstanding</Label>
              <input
                disabled
                value={selectedPayable ? formatCurrency(selectedPayable.balance) : ''}
                className="fintrix-input opacity-70"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-amount" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Payment Amount (INR)</Label>
              <input
                id="payment-amount"
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                className="fintrix-input"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <button className="btn-fintrix btn-fintrix-ghost border border-[#D8DFE5] dark:border-white/[0.08] text-[13px] px-4 py-2" onClick={() => setIsPaymentOpen(false)}>Cancel</button>
            <button className="btn-fintrix btn-fintrix-primary text-[13px] px-4 py-2" onClick={handleRecordPayment}>Confirm Payment</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payable Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold font-['Instrument_Sans',sans-serif] text-[#0E1C29] dark:text-white">Add Manual Payable</DialogTitle>
            <DialogDescription className="text-[12.5px] text-[#757575]">
              Record an outstanding bill manually for a vendor.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPayable} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="vendor-select" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Select Vendor</Label>
              <Select
                value={newPayable.vendorId}
                onValueChange={val => setNewPayable({ ...newPayable, vendorId: val })}
              >
                <SelectTrigger id="vendor-select" className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                  {/* Vendors mock data used temporarily */}
                  <SelectItem value="demo" className="text-[13px]">Demo Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pay-description" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Description</Label>
              <input
                id="pay-description"
                placeholder="e.g. AWS server cloud bill"
                value={newPayable.description}
                onChange={e => setNewPayable({ ...newPayable, description: e.target.value })}
                className="fintrix-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pay-amount" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Amount (INR)</Label>
                <input
                  id="pay-amount"
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={newPayable.amount}
                  onChange={e => setNewPayable({ ...newPayable, amount: e.target.value })}
                  className="fintrix-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pay-due" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Due Date</Label>
                <input
                  id="pay-due"
                  type="date"
                  required
                  value={newPayable.dueDate}
                  onChange={e => setNewPayable({ ...newPayable, dueDate: e.target.value })}
                  className="fintrix-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pay-category" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Category</Label>
              <Select
                value={newPayable.category}
                onValueChange={val => setNewPayable({ ...newPayable, category: val })}
              >
                <SelectTrigger id="pay-category" className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                  <SelectItem value="salaries" className="text-[13px]">Salaries</SelectItem>
                  <SelectItem value="rent" className="text-[13px]">Rent</SelectItem>
                  <SelectItem value="software" className="text-[13px]">Software</SelectItem>
                  <SelectItem value="supplies" className="text-[13px]">Supplies</SelectItem>
                  <SelectItem value="marketing" className="text-[13px]">Marketing</SelectItem>
                  <SelectItem value="utilities" className="text-[13px]">Utilities</SelectItem>
                  <SelectItem value="other" className="text-[13px]">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <button type="button" className="btn-fintrix btn-fintrix-ghost border border-[#D8DFE5] dark:border-white/[0.08] text-[13px] px-4 py-2" onClick={() => setIsAddOpen(false)}>Cancel</button>
              <button type="submit" className="btn-fintrix btn-fintrix-primary text-[13px] px-4 py-2">Save Payable</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
