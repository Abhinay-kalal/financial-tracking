'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Plus, Mail, CreditCard, Clock, AlertTriangle, CheckCircle2,
  Calendar, FileText, ArrowUpRight, TrendingUp, Check
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { receivableService } from '@/lib/api/services';
import { mockReceivables } from '@/lib/mock-data';
import type { Receivable } from '@/types';
import { toast } from 'react-hot-toast';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Dialog states
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [paymentAmount, setPaymentAmount] = useState('');
  const [newRec, setNewRec] = useState({
    clientId: '',
    clientName: '',
    amount: '',
    dueDate: '',
    invoiceNumber: '',
  });

  const fetchReceivables = async () => {
    try {
      setIsLoading(true);
      const res = await receivableService.getAll();
      if (res && res.success) {
        setReceivables(res.data);
      } else {
        setReceivables(mockReceivables);
      }
    } catch (error) {
      setReceivables(mockReceivables);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivables();
  }, []);

  const handleRecordPayment = async () => {
    if (!selectedReceivable) return;
    const payAmt = parseFloat(paymentAmount);
    if (isNaN(payAmt) || payAmt <= 0) return;

    try {
      const res = await receivableService.update(selectedReceivable.id, { amount: payAmt });
      if (res && res.success) {
        toast.success('Payment recorded');
        fetchReceivables();
        setIsPaymentOpen(false);
        setPaymentAmount('');
        setSelectedReceivable(null);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      // Local state fallback
      setReceivables(prev => prev.map(r => {
        if (r.id === selectedReceivable.id) {
          const newAmtRec = r.amountReceived + payAmt;
          const newBal = Math.max(0, r.amount - newAmtRec);
          return {
            ...r,
            amountReceived: newAmtRec,
            balance: newBal,
            status: newBal === 0 ? 'paid' : r.status
          } as Receivable;
        }
        return r;
      }));
      toast.success('Payment recorded (local)');
      setIsPaymentOpen(false);
      setPaymentAmount('');
      setSelectedReceivable(null);
    }
  };

  const handleSendReminder = async () => {
    if (!selectedReceivable) return;
    
    try {
      const res = await receivableService.sendReminder(selectedReceivable.id);
      if (res && res.success) {
        toast.success('Reminder sent');
        fetchReceivables();
        setIsReminderOpen(false);
        setSelectedReceivable(null);
      } else {
        throw new Error('Reminder failed');
      }
    } catch (error) {
      setReceivables(prev => prev.map(r => {
        if (r.id === selectedReceivable.id) {
          return {
            ...r,
            reminderSent: true,
            lastReminderDate: new Date().toISOString().split('T')[0]
          };
        }
        return r;
      }));
      toast.success('Reminder sent (local)');
      setIsReminderOpen(false);
      setSelectedReceivable(null);
    }
  };

  const handleAddReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newRec.amount);
    if (!newRec.clientName || isNaN(amt) || amt <= 0 || !newRec.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const createdRec: Receivable = {
      id: Math.random().toString(),
      clientId: newRec.clientId || 'demo-client',
      clientName: newRec.clientName,
      invoiceNumber: newRec.invoiceNumber || `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: amt,
      balance: amt,
      amountReceived: 0,
      dueDate: newRec.dueDate,
      status: 'outstanding',
      reminderSent: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setReceivables(prev => [createdRec, ...prev]);
    toast.success('Receivable added successfully (local)');
    setIsAddOpen(false);
    setNewRec({
      clientId: '',
      clientName: '',
      amount: '',
      dueDate: '',
      invoiceNumber: '',
    });
  };

  const filtered = receivables.filter(r => {
    const matchesSearch = r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (r.invoiceNumber && r.invoiceNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = receivables.reduce((sum, r) => r.status !== 'paid' ? sum + r.balance : sum, 0);
  const totalOverdue = receivables.reduce((sum, r) => r.status === 'overdue' ? sum + r.balance : sum, 0);
  const totalCollected = receivables.reduce((sum, r) => sum + r.amountReceived, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight">Outstanding Receivables</h1>
          <p className="text-[13px] text-[#757575] mt-0.5 font-medium">Track client invoices, pending collections, and payment reminders</p>
        </div>
        <button className="btn-fintrix btn-fintrix-primary text-[13px]" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4" /> Add Receivable
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div {...fade(0.06)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card" style={{ borderTop: '3px solid #f59e0b' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11.5px] text-[#757575] font-medium">Total Outstanding</p>
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
              <p className="text-[11.5px] text-[#757575] font-medium">Total Overdue</p>
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
              <p className="text-[11.5px] text-[#757575] font-medium">Collected / Received</p>
              <h3 className="text-[20px] font-bold text-[#16a34a] font-['Instrument_Sans',sans-serif] leading-tight mt-0.5">{formatCurrency(totalCollected)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.08)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#22c55e]" />
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
              placeholder="Search client name or invoice..."
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

      {/* Receivables Table */}
      <motion.div {...fade(0.18)} className="fintrix-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fintrix-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Invoice #</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-right">Total Amount</th>
                <th className="text-right">Balance Due</th>
                <th className="text-center" style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#757575]">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#757575]">No outstanding receivables found.</td>
                </tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div>
                      <p className="font-semibold text-[#0E1C29] dark:text-white text-[13.5px]">{r.clientName}</p>
                      <p className="text-[11px] text-[#757575] font-medium mt-0.5">Recorded {formatDate(r.createdAt)}</p>
                    </div>
                  </td>
                  <td>
                    {r.invoiceNumber ? (
                      <div className="flex items-center gap-1 text-[#6B3AB1] dark:text-[#a78bfa] font-semibold text-[13px]">
                        <FileText className="w-3.5 h-3.5" />
                        {r.invoiceNumber}
                      </div>
                    ) : (
                      <span className="text-[#757575] text-[11px] font-semibold uppercase tracking-wide bg-[#F4F7FA] dark:bg-white/5 px-2 py-0.5 rounded">Manual Entry</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-[#757575] text-[13px]">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(r.dueDate)}
                    </div>
                  </td>
                  <td>
                    <span className={`fintrix-badge text-[11px] ${
                      r.status === 'paid' ? 'badge-green' :
                      r.status === 'overdue' ? 'badge-red' :
                      r.status === 'partial' ? 'badge-amber' : 'badge-navy'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="text-right font-semibold text-[#0E1C29] dark:text-white text-[13.5px]">
                    {formatCurrency(r.amount)}
                  </td>
                  <td className="text-right font-bold text-[#6B3AB1] dark:text-[#a78bfa] text-[13.5px]">
                    {formatCurrency(r.balance)}
                  </td>
                  <td>
                    <div className="flex justify-center gap-1">
                      {r.status !== 'paid' && (
                        <>
                          <button
                            className="p-1.5 rounded-md hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white"
                            onClick={() => {
                              setSelectedReceivable(r);
                              setPaymentAmount(String(r.balance));
                              setIsPaymentOpen(true);
                            }}
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-md hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white"
                            onClick={() => {
                              setSelectedReceivable(r);
                              setIsReminderOpen(true);
                            }}
                            title="Send Email Reminder"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {r.status === 'paid' && (
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
            <DialogTitle className="text-[16px] font-bold font-['Instrument_Sans',sans-serif] text-[#0E1C29] dark:text-white">Record Payment Received</DialogTitle>
            <DialogDescription className="text-[12.5px] text-[#757575]">
              Log a partial or full payment for {selectedReceivable?.clientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Total Outstanding</Label>
              <input
                disabled
                value={selectedReceivable ? formatCurrency(selectedReceivable.balance) : ''}
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

      {/* Send Reminder Dialog */}
      <Dialog open={isReminderOpen} onOpenChange={setIsReminderOpen}>
        <DialogContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold font-['Instrument_Sans',sans-serif] text-[#0E1C29] dark:text-white">Send Payment Reminder</DialogTitle>
            <DialogDescription className="text-[12.5px] text-[#757575]">
              Send a professional invoice payment reminder email to the client.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <div className="p-4 rounded-xl bg-[rgba(83,37,154,0.06)] border border-[#53259A]/10 text-[12px] space-y-2 text-[#757575]">
              <p className="font-bold text-[#0E1C29] dark:text-white">Email Template Preview:</p>
              <p><strong>Subject:</strong> Payment Reminder: Invoice {selectedReceivable?.invoiceNumber || 'Outstanding balance'}</p>
              <p>Dear Finance Team at {selectedReceivable?.clientName},</p>
              <p>This is a friendly reminder that a balance of <strong>{selectedReceivable ? formatCurrency(selectedReceivable.balance) : ''}</strong> is outstanding, with a due date of {selectedReceivable ? formatDate(selectedReceivable.dueDate) : ''}.</p>
              <p>Please settle the dues at your earliest convenience.</p>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <button className="btn-fintrix btn-fintrix-ghost border border-[#D8DFE5] dark:border-white/[0.08] text-[13px] px-4 py-2" onClick={() => setIsReminderOpen(false)}>Cancel</button>
            <button className="btn-fintrix btn-fintrix-primary text-[13px] px-4 py-2" onClick={handleSendReminder}>Send Email</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Receivable Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08] rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold font-['Instrument_Sans',sans-serif] text-[#0E1C29] dark:text-white">Add Manual Receivable</DialogTitle>
            <DialogDescription className="text-[12.5px] text-[#757575]">
              Record an outstanding balance manually for a client.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddReceivable} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="client-select" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Select Client</Label>
              <Select
                value={newRec.clientId}
                onValueChange={val => setNewRec({ ...newRec, clientId: val })}
              >
                <SelectTrigger id="client-select" className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                  {/* Clients mock data used temporarily */}
                  <SelectItem value="demo" className="text-[13px]">Demo Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="rec-amount" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Amount (INR)</Label>
                <input
                  id="rec-amount"
                  type="number"
                  required
                  placeholder="e.g. 50000"
                  value={newRec.amount}
                  onChange={e => setNewRec({ ...newRec, amount: e.target.value })}
                  className="fintrix-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rec-due" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Due Date</Label>
                <input
                  id="rec-due"
                  type="date"
                  required
                  value={newRec.dueDate}
                  onChange={e => setNewRec({ ...newRec, dueDate: e.target.value })}
                  className="fintrix-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rec-invoice" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Invoice Number (Optional)</Label>
              <input
                id="rec-invoice"
                placeholder="e.g. INV-202412-0050"
                value={newRec.invoiceNumber}
                onChange={e => setNewRec({ ...newRec, invoiceNumber: e.target.value })}
                className="fintrix-input"
              />
            </div>

            <DialogFooter className="pt-4">
              <button type="button" className="btn-fintrix btn-fintrix-ghost border border-[#D8DFE5] dark:border-white/[0.08] text-[13px] px-4 py-2" onClick={() => setIsAddOpen(false)}>Cancel</button>
              <button type="submit" className="btn-fintrix btn-fintrix-primary text-[13px] px-4 py-2">Save Receivable</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
