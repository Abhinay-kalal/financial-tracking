'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Download, CheckSquare, Printer, FileText
} from 'lucide-react';
import { invoiceService } from '@/lib/api/services';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import type { Invoice } from '@/types';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] },
});

export default function InvoicePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (id) {
      invoiceService.getAll().then(res => {
        if (res.success) {
          const found = res.data.find((inv: Invoice) => inv.id === id);
          if (found) {
            setInvoice(found);
          }
        }
      });
    }
  }, [id]);

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-[#757575] font-medium">Invoice not found.</p>
        <Link href="/invoices">
          <button className="btn-fintrix btn-fintrix-outline text-[13px] px-4 py-2">Go Back</button>
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsPaid = async () => {
    // For now update locally or call generic update if backend has it.
    // Assuming backend might have an update/markPaid endpoint soon, 
    // but for now we'll optimistically update UI:
    try {
      // If there was an update API: await invoiceService.update(invoice.id, { status: 'paid' })
      setInvoice({
        ...invoice,
        status: 'paid',
      });
    } catch (e) {
      // Handle error
    }
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto print:p-0 print:max-w-full">
      {/* Action Header */}
      <motion.div {...fade(0)} className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <button className="p-2 rounded-lg hover:bg-[#F4F7FA] dark:hover:bg-white/5 text-[#757575] hover:text-[#0E1C29] dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-[22px] font-bold text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif] tracking-tight font-bold">Invoice Preview</h1>
            <p className="text-[13px] text-[#757575] mt-0.5 font-medium">Verify values before printing or sending to the customer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {invoice.status !== 'paid' && (
            <button className="btn-fintrix btn-fintrix-outline text-[13px] px-4 py-2 border-[#16a34a] hover:bg-emerald-500/5 text-[#16a34a]" onClick={handleMarkAsPaid}>
              <CheckSquare className="w-4 h-4" /> Mark Paid
            </button>
          )}
          <button className="btn-fintrix btn-fintrix-outline text-[13px] px-4 py-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="btn-fintrix btn-fintrix-primary text-[13px] px-4 py-2">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </motion.div>

      {/* Tax Invoice Document */}
      <motion.div {...fade(0.06)} className="fintrix-card p-8 bg-white dark:bg-[#162A3E] border-[#D8DFE5] dark:border-white/[0.08] shadow-2xl print:bg-white print:text-black print:shadow-none print:border-none print:p-0">
        <div className="space-y-8">
          
          {/* Document Title Header */}
          <div className="flex justify-between items-start border-b border-[#D8DFE5] dark:border-white/[0.07] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#6B3AB1] dark:text-[#a78bfa] font-bold text-lg">
                <FileText className="w-6 h-6" />
                <span className="font-['Instrument_Sans',sans-serif] tracking-tight">Finance Copilot Inc.</span>
              </div>
              <p className="text-[12px] text-[#757575] leading-relaxed">
                GSTIN: 29ABCDE1234F1Z5<br />
                100 Fintech Heights, Outer Ring Road,<br />
                Bangalore, Karnataka, 560103
              </p>
            </div>
            
            <div className="text-right space-y-2">
              <h2 className="text-[20px] font-black uppercase tracking-tight text-[#6B3AB1] dark:text-[#a78bfa] font-['Instrument_Sans',sans-serif]">Tax Invoice</h2>
              <div className="font-mono text-sm font-bold text-[#0E1C29] dark:text-white print:text-black">
                {invoice.invoiceNumber}
              </div>
              <span className={`fintrix-badge text-[11px] ${
                invoice.status === 'paid' ? 'badge-green' :
                invoice.status === 'overdue' ? 'badge-red' : 'badge-amber'
              }`}>
                {invoice.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Dates & Parties info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-[12.5px]">
            <div>
              <p className="font-bold text-[#757575] uppercase text-[10px] tracking-wider mb-1">Billing To:</p>
              <p className="font-bold text-[14px] text-[#0E1C29] dark:text-white font-['Instrument_Sans',sans-serif]">{invoice.clientName}</p>
              <p className="text-[#757575] leading-relaxed mt-1">
                {invoice.clientAddress}<br />
                {invoice.clientGstin && `GSTIN: ${invoice.clientGstin}`}
              </p>
            </div>

            <div>
              <p className="font-bold text-[#757575] uppercase text-[10px] tracking-wider mb-1">Invoice Details:</p>
              <table className="text-left w-full">
                <tbody>
                  <tr>
                    <td className="text-[#757575] pr-2 py-0.5">Issue Date:</td>
                    <td className="font-semibold text-[#0E1C29] dark:text-white">{formatDate(invoice.issueDate)}</td>
                  </tr>
                  <tr>
                    <td className="text-[#757575] pr-2 py-0.5">Due Date:</td>
                    <td className="font-semibold text-[#0E1C29] dark:text-white">{formatDate(invoice.dueDate)}</td>
                  </tr>
                  <tr>
                    <td className="text-[#757575] pr-2 py-0.5">Tax Scheme:</td>
                    <td className="font-mono uppercase font-semibold text-[#0E1C29] dark:text-white">{invoice.gstType.replace('_', ' + ')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="col-span-2 md:col-span-1 text-right">
              <p className="font-bold text-[#757575] uppercase text-[10px] tracking-wider mb-1">Amount Due:</p>
              <p className="text-[22px] font-black text-[#6B3AB1] dark:text-[#a78bfa] font-['Instrument_Sans',sans-serif]">
                {invoice.status === 'paid' ? formatCurrency(0) : formatCurrency(invoice.total)}
              </p>
            </div>
          </div>

          {/* Itemized Line Table */}
          <div className="border border-[#D8DFE5] dark:border-white/[0.07] rounded-xl overflow-hidden">
            <table className="fintrix-table text-[12.5px]">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>HSN/SAC</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Tax Rate</th>
                  <th className="text-right">Taxable Val</th>
                  {invoice.gstType === 'cgst_sgst' && (
                    <>
                      <th className="text-right">CGST</th>
                      <th className="text-right">SGST</th>
                    </>
                  )}
                  {invoice.gstType === 'igst' && <th className="text-right">IGST</th>}
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F4F7FA]/40 dark:hover:bg-white/[0.02]">
                    <td className="font-bold text-[#0E1C29] dark:text-white">{item.description}</td>
                    <td className="font-mono">{item.hsnSac || '—'}</td>
                    <td className="text-right">{item.quantity} {item.unit}</td>
                    <td className="text-right">{formatCurrency(item.rate)}</td>
                    <td className="text-right">{item.gstRate}%</td>
                    <td className="text-right">{formatCurrency(item.amount)}</td>
                    {invoice.gstType === 'cgst_sgst' && (
                      <>
                        <td className="text-right">{formatCurrency(item.cgst)}</td>
                        <td className="text-right">{formatCurrency(item.sgst)}</td>
                      </>
                    )}
                    {invoice.gstType === 'igst' && <td className="text-right">{formatCurrency(item.igst)}</td>}
                    <td className="text-right font-bold text-[#0E1C29] dark:text-white">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Note / Terms & Summary columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[12.5px] pt-4">
            
            {/* Notes & Terms */}
            <div className="space-y-4 bg-white dark:bg-[#162A3E]">
              {invoice.notes && (
                <div>
                  <p className="font-bold text-[#757575] uppercase text-[10px] tracking-wider mb-1">Notes / Payment Instructions:</p>
                  <p className="text-[#757575] leading-relaxed bg-[#F4F7FA] dark:bg-white/[0.03] border border-[#D8DFE5] dark:border-white/[0.08] rounded-xl p-3.5 print:bg-transparent print:border-none print:p-0">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="font-bold text-[#757575] uppercase text-[10px] tracking-wider mb-1">Terms & Conditions:</p>
                  <p className="text-[#757575] leading-relaxed">{invoice.terms}</p>
                </div>
              )}
            </div>

            {/* Total breakdown */}
            <div className="space-y-2 text-right">
              <div className="flex justify-between md:justify-end gap-10 text-[#757575] font-medium">
                <span>Subtotal (Taxable Value):</span>
                <span className="font-semibold text-[#0E1C29] dark:text-white">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.gstType === 'cgst_sgst' && (
                <>
                  <div className="flex justify-between md:justify-end gap-10 text-[#757575] font-medium">
                    <span>Central GST (CGST):</span>
                    <span className="font-semibold text-[#0E1C29] dark:text-white">{formatCurrency(invoice.totalCgst)}</span>
                  </div>
                  <div className="flex justify-between md:justify-end gap-10 text-[#757575] font-medium">
                    <span>State GST (SGST):</span>
                    <span className="font-semibold text-[#0E1C29] dark:text-white">{formatCurrency(invoice.totalSgst)}</span>
                  </div>
                </>
              )}
              {invoice.gstType === 'igst' && (
                <div className="flex justify-between md:justify-end gap-10 text-[#757575] font-medium">
                  <span>Integrated GST (IGST):</span>
                  <span className="font-semibold text-[#0E1C29] dark:text-white">{formatCurrency(invoice.totalIgst)}</span>
                </div>
              )}
              <div className="flex justify-between md:justify-end gap-10 text-[#757575] font-medium">
                <span>Total GST Tax Amount:</span>
                <span className="font-semibold text-[#0E1C29] dark:text-white">{formatCurrency(invoice.totalGst)}</span>
              </div>
              
              <div className="flex justify-between md:justify-end gap-10 text-[15px] font-bold text-[#6B3AB1] dark:text-[#a78bfa] pt-2 border-t border-[#D8DFE5] dark:border-white/[0.06]">
                <span>Grand Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer signature */}
          <div className="pt-10 border-t border-[#D8DFE5] dark:border-white/[0.06] flex justify-between items-end text-[10px] text-[#757575] font-medium">
            <p>Generated by Finance Copilot SaaS.</p>
            <div className="text-right space-y-4 w-40 print:w-auto">
              <p>Authorized Signatory</p>
              <div className="h-6 border-b border-dashed border-[#D8DFE5] dark:border-white/[0.1] print:border-black" />
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
