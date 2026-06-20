'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Eye, Trash2, FileText, Filter
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { invoiceService } from '@/lib/api/services';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Invoice } from '@/types';
import { toast } from 'react-hot-toast';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const res = await invoiceService.getAll();
      if (res.success) {
        setInvoices(res.data);
      }
    } catch (error) {
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  import('react').then(React => {
    React.useEffect(() => {
      fetchInvoices();
    }, []);
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        // Assume delete endpoint exists, or handle locally if not fully implemented in backend yet
        const res = await invoiceService.delete(id);
        if (res.success) {
          toast.success('Invoice deleted');
          fetchInvoices();
        }
      } catch (error) {
        toast.error('Failed to delete invoice');
      }
    }
  };

  const filtered = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight">GST Invoicing</h1>
          <p className="text-[13px] text-[#757575] mt-0.5 font-medium">Create, monitor, and manage your B2B and B2C tax-compliant invoices</p>
        </div>
        <Link href="/invoices/create">
          <button className="btn-fintrix btn-fintrix-primary text-[13px]" id="create-invoice-main-btn">
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div {...fade(0.06)} className="fintrix-card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#162A3E]">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
            <input
              placeholder="Search invoices by number or client..."
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
                <SelectItem value="all" className="text-[13px]">All Invoices</SelectItem>
                <SelectItem value="draft" className="text-[13px]">Draft</SelectItem>
                <SelectItem value="sent" className="text-[13px]">Sent</SelectItem>
                <SelectItem value="paid" className="text-[13px]">Paid</SelectItem>
                <SelectItem value="overdue" className="text-[13px]">Overdue</SelectItem>
                <SelectItem value="cancelled" className="text-[13px]">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Invoices Table */}
      <motion.div {...fade(0.12)} className="fintrix-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fintrix-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-right">GST (Tax)</th>
                <th className="text-right">Total (Incl. Tax)</th>
                <th className="text-center" style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-[#757575]">Loading invoices...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-[#757575]">No invoices found.</td>
                </tr>
              ) : filtered.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <div className="flex items-center gap-2 font-mono font-bold text-[#6B3AB1] dark:text-[#a78bfa] text-[13px]">
                      <FileText className="w-4 h-4 text-[#757575]" />
                      {inv.invoiceNumber}
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-semibold text-[#0E1C29] dark:text-white text-[13.5px]">{inv.clientName}</p>
                      {inv.clientGstin && (
                        <p className="text-[10px] text-[#757575] font-mono mt-0.5">GST: {inv.clientGstin}</p>
                      )}
                    </div>
                  </td>
                  <td className="text-[#757575] text-[13px]">
                    {formatDate(inv.issueDate)}
                  </td>
                  <td className="text-[#757575] text-[13px]">
                    {formatDate(inv.dueDate)}
                  </td>
                  <td>
                    <span className={`fintrix-badge text-[11px] ${
                      inv.status === 'paid' ? 'badge-green' :
                      inv.status === 'overdue' ? 'badge-red' :
                      inv.status === 'sent' ? 'badge-purple' :
                      inv.status === 'draft' ? 'badge-navy' : 'badge-amber'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="text-right font-medium text-[#757575] text-[13.5px]">
                    {formatCurrency(inv.totalGst)}
                  </td>
                  <td className="text-right font-bold text-[#0E1C29] dark:text-white text-[13.5px]">
                    {formatCurrency(inv.total)}
                  </td>
                  <td>
                    <div className="flex justify-center gap-1">
                      <Link href={`/invoices/${inv.id}/preview`}>
                        <button
                          className="p-1.5 rounded-md hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white"
                          title="Preview / Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button
                        className="p-1.5 rounded-md hover:bg-rose-500/10 text-[#757575] hover:text-rose-500"
                        onClick={() => handleDelete(inv.id)}
                        title="Delete Invoice"
                      >
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
    </div>
  );
}
