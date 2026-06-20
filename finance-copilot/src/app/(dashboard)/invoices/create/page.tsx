'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, ArrowLeft, Save
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { invoiceService, clientService } from '@/lib/api/services';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Invoice, InvoiceItem, GSTType, Client } from '@/types';
import { toast } from 'react-hot-toast';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function CreateInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);

  // Invoice headers
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [gstType, setGstType] = useState<GSTType>('cgst_sgst');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  // Line items state
  const [items, setItems] = useState<InvoiceItem[]>(
    [{ id: '1', description: '', hsnSac: '', quantity: 1, unit: 'Job', rate: 0, amount: 0, gstRate: 18, cgst: 0, sgst: 0, igst: 0, total: 0 }]
  );

  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [totalCgst, setTotalCgst] = useState(0);
  const [totalSgst, setTotalSgst] = useState(0);
  const [totalIgst, setTotalIgst] = useState(0);
  const [totalGst, setTotalGst] = useState(0);
  const [total, setTotal] = useState(0);

  // Initialize defaults
  useEffect(() => {
    // We should ideally fetch next invoice number from API. Using a timestamp for now to avoid collision.
    const nextNum = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    setInvoiceNumber(nextNum);

    const today = new Date().toISOString().split('T')[0];
    setIssueDate(today);

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setDueDate(nextMonth.toISOString().split('T')[0]);

    // Fetch clients
    clientService.getAll().then(res => {
      if (res.success) {
        setClients(res.data);
      }
    });
  }, []);

  // Compute values whenever items or gstType changes
  useEffect(() => {
    let sub = 0;
    let cgstSum = 0;
    let sgstSum = 0;
    let igstSum = 0;
    let gstSum = 0;
    let grandTotal = 0;

    const recalculatedItems = items.map(item => {
      const amount = item.quantity * item.rate;
      const gstAmount = (amount * item.gstRate) / 100;
      
      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (gstType === 'cgst_sgst') {
        cgst = gstAmount / 2;
        sgst = gstAmount / 2;
      } else if (gstType === 'igst') {
        igst = gstAmount;
      }

      const totalItem = amount + gstAmount;

      sub += amount;
      cgstSum += cgst;
      sgstSum += sgst;
      igstSum += igst;
      gstSum += gstAmount;
      grandTotal += totalItem;

      return {
        ...item,
        amount,
        cgst,
        sgst,
        igst,
        total: totalItem,
      };
    });

    const hasChanges = JSON.stringify(recalculatedItems) !== JSON.stringify(items);
    if (hasChanges) {
      setItems(recalculatedItems);
    }

    setSubtotal(sub);
    setTotalCgst(cgstSum);
    setTotalSgst(sgstSum);
    setTotalIgst(igstSum);
    setTotalGst(gstSum);
    setTotal(grandTotal);
  }, [items, gstType]);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: String(items.length + 1),
      description: '',
      hsnSac: '',
      quantity: 1,
      unit: 'Job',
      rate: 0,
      amount: 0,
      gstRate: 18,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: value
        };
      }
      return item;
    });
    setItems(updated);
  };

  const handleSave = async () => {
    if (!selectedClientId) {
      toast.error('Please select a client.');
      return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    try {
      const payload = {
        invoiceNumber,
        clientId: selectedClientId,
        issueDate: new Date(issueDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        gstType,
        notes,
        terms,
        isRecurring,
        recurringPeriod: isRecurring ? recurringPeriod : undefined,
        items: items.map(item => ({
          description: item.description,
          hsnSac: item.hsnSac,
          quantity: item.quantity,
          unit: item.unit,
          rate: item.rate,
          gstRate: item.gstRate
        }))
      };

      const res = await invoiceService.create(payload);
      if (res.success) {
        toast.success('Invoice created successfully');
        router.push('/invoices');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create invoice');
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Back Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <button className="p-2 rounded-lg hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight">New GST Tax Invoice</h1>
            <p className="text-[13px] text-[#757575] mt-0.5 font-medium">Generate B2B invoices with CGST/SGST/IGST calculations automatically</p>
          </div>
        </div>
        <button className="btn-fintrix btn-fintrix-primary text-[13px]" onClick={handleSave}>
          <Save className="w-4 h-4" /> Save Invoice
        </button>
      </motion.div>

      {/* Invoice Meta Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Client & Invoice Info */}
        <motion.div {...fade(0.06)} className="lg:col-span-2 fintrix-card p-5">
          <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] mb-4">General Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client-selector" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Client *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger id="client-selector" className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id} className="text-[13px]">{c.companyName || c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invoice-num" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Invoice Number *</Label>
                <input
                  id="invoice-num"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="fintrix-input font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="issue-date" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Issue Date *</Label>
                <input
                  id="issue-date"
                  type="date"
                  value={issueDate}
                  onChange={e => setIssueDate(e.target.value)}
                  className="fintrix-input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="due-date" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Due Date *</Label>
                <input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="fintrix-input"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Card: GST & Billing Setup */}
        <motion.div {...fade(0.12)} className="fintrix-card p-5">
          <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] mb-4">GST & Tax Settings</h2>
          <div className="space-y-5 bg-white dark:bg-[#162A3E]">
            <div className="space-y-1.5">
              <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">GST Calculation Type</Label>
              <Select value={gstType} onValueChange={val => setGstType(val as GSTType)}>
                <SelectTrigger className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                  <SelectItem value="cgst_sgst" className="text-[13px]">Intrastate (CGST + SGST)</SelectItem>
                  <SelectItem value="igst" className="text-[13px]">Interstate (IGST)</SelectItem>
                  <SelectItem value="exempt" className="text-[13px]">GST Exempt / Nil Rated</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-[#757575] mt-1">
                {gstType === 'cgst_sgst' && 'Applies CGST (9%) + SGST (9%) for clients inside your home state.'}
                {gstType === 'igst' && 'Applies integrated IGST (18%) for out-of-state billing.'}
                {gstType === 'exempt' && 'Tax rate will be set to 0% as per GST exemption guidelines.'}
              </p>
            </div>

            <div className="pt-4 border-t border-[#D8DFE5] dark:border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="recurring-toggle" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Recurring Invoice</Label>
                  <p className="text-[10px] text-[#757575]">Auto-generate invoices periodically.</p>
                </div>
                <Switch
                  id="recurring-toggle"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>

              {isRecurring && (
                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Billing Period</Label>
                  <Select
                    value={recurringPeriod}
                    onValueChange={val => setRecurringPeriod(val as any)}
                  >
                    <SelectTrigger className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-10">
                      <SelectValue placeholder="Period" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                      <SelectItem value="monthly" className="text-[13px]">Monthly</SelectItem>
                      <SelectItem value="quarterly" className="text-[13px]">Quarterly</SelectItem>
                      <SelectItem value="yearly" className="text-[13px]">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Invoice Items Card */}
      <motion.div {...fade(0.18)} className="fintrix-card overflow-hidden">
        <div className="flex flex-row items-center justify-between px-5 py-4 border-b border-[#D8DFE5] dark:border-white/[0.07] bg-white dark:bg-[#162A3E]">
          <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">Line Items</h2>
          <button className="btn-fintrix btn-fintrix-outline text-[12.5px] py-1.5 px-3 h-auto" onClick={handleAddItem}>
            <Plus className="w-3.5 h-3.5" /> Add Line
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="fintrix-table min-w-[900px]">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Description</th>
                <th style={{ width: '12%' }}>HSN / SAC</th>
                <th style={{ width: '10%' }}>Qty</th>
                <th style={{ width: '10%' }}>Unit</th>
                <th style={{ width: '12%' }}>Rate (INR)</th>
                <th style={{ width: '10%' }}>GST Rate</th>
                <th className="text-right" style={{ width: '15%' }}>Total</th>
                <th style={{ width: '6%' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-[#F4F7FA]/40 dark:hover:bg-white/[0.02]">
                  <td>
                    <input
                      placeholder="e.g. Consulting services or Software product license"
                      value={item.description}
                      onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                      className="fintrix-input h-9"
                    />
                  </td>
                  <td>
                    <input
                      placeholder="e.g. 9983"
                      value={item.hsnSac}
                      onChange={e => handleUpdateItem(item.id, 'hsnSac', e.target.value)}
                      className="fintrix-input h-9 font-mono"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="fintrix-input h-9"
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Job / Hours"
                      value={item.unit}
                      onChange={e => handleUpdateItem(item.id, 'unit', e.target.value)}
                      className="fintrix-input h-9"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="Rate"
                      value={item.rate === 0 ? '' : item.rate}
                      onChange={e => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="fintrix-input h-9"
                    />
                  </td>
                  <td>
                    <Select
                      value={String(item.gstRate)}
                      onValueChange={val => handleUpdateItem(item.id, 'gstRate', parseInt(val))}
                      disabled={gstType === 'exempt'}
                    >
                      <SelectTrigger className="fintrix-input flex items-center justify-between border-[#D8DFE5] dark:border-white/[0.1] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08]">
                        <SelectItem value="0" className="text-[13px]">0%</SelectItem>
                        <SelectItem value="5" className="text-[13px]">5%</SelectItem>
                        <SelectItem value="12" className="text-[13px]">12%</SelectItem>
                        <SelectItem value="18" className="text-[13px]">18%</SelectItem>
                        <SelectItem value="28" className="text-[13px]">28%</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="text-right font-bold text-[#0E1C29] dark:text-white text-[13.5px]">
                    {formatCurrency(item.total)}
                  </td>
                  <td>
                    <div className="flex justify-center">
                      <button
                        className="p-1.5 rounded-md hover:bg-rose-500/10 text-[#757575] hover:text-rose-500 disabled:opacity-40"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Summary and Notes Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left details */}
        <motion.div {...fade(0.24)} className="lg:col-span-2 fintrix-card p-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Notes / Bank Transfer Instructions</Label>
              <input
                id="notes"
                placeholder="Include payment link, Bank Account Number, IFSC Details..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="fintrix-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="terms" className="text-[12.5px] font-semibold text-[#253F59] dark:text-white/80">Terms & Conditions</Label>
              <input
                id="terms"
                placeholder="e.g. Due within 30 days. Interest charged on overdue accounts."
                value={terms}
                onChange={e => setTerms(e.target.value)}
                className="fintrix-input text-xs"
              />
            </div>
          </div>
        </motion.div>

        {/* Right Summary */}
        <motion.div {...fade(0.30)} className="fintrix-card p-5">
          <h2 className="text-[14px] font-semibold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] mb-4 border-b border-[#D8DFE5] dark:border-white/[0.06] pb-2">Billing Summary</h2>
          <div className="space-y-3.5 text-[13px]">
            <div className="flex justify-between text-[#757575] font-medium">
              <span>Subtotal</span>
              <span className="text-[#0E1C29] dark:text-white font-semibold">{formatCurrency(subtotal)}</span>
            </div>

            {gstType === 'cgst_sgst' && (
              <>
                <div className="flex justify-between text-[#757575] font-medium">
                  <span>Central GST (CGST)</span>
                  <span className="text-[#0E1C29] dark:text-white font-semibold">{formatCurrency(totalCgst)}</span>
                </div>
                <div className="flex justify-between text-[#757575] font-medium">
                  <span>State GST (SGST)</span>
                  <span className="text-[#0E1C29] dark:text-white font-semibold">{formatCurrency(totalSgst)}</span>
                </div>
              </>
            )}

            {gstType === 'igst' && (
              <div className="flex justify-between text-[#757575] font-medium">
                <span>Integrated GST (IGST)</span>
                <span className="text-[#0E1C29] dark:text-white font-semibold">{formatCurrency(totalIgst)}</span>
              </div>
            )}

            <div className="flex justify-between text-[#757575] font-medium pb-2 border-b border-[#D8DFE5] dark:border-white/[0.06]">
              <span>Total Tax (GST)</span>
              <span className="text-[#0E1C29] dark:text-white font-semibold">{formatCurrency(totalGst)}</span>
            </div>

            <div className="flex justify-between font-bold text-[16px] text-[#6B3AB1] dark:text-[#a78bfa] pt-1">
              <span>Grand Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
