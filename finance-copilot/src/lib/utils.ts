import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatDate(date: string | Date, formatStr = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(dueDate: string): boolean {
  return isBefore(parseISO(dueDate), new Date());
}

export function isDueSoon(dueDate: string, days = 7): boolean {
  const due = parseISO(dueDate);
  const soon = new Date();
  soon.setDate(soon.getDate() + days);
  return isBefore(due, soon) && isAfter(due, new Date());
}

export function generateInvoiceNumber(prefix = 'INV'): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${year}${month}-${random}`;
}

export function calculateGST(
  amount: number,
  gstRate: number,
  gstType: 'cgst_sgst' | 'igst' | 'exempt'
): { cgst: number; sgst: number; igst: number; total: number } {
  if (gstType === 'exempt') {
    return { cgst: 0, sgst: 0, igst: 0, total: amount };
  }
  const gstAmount = (amount * gstRate) / 100;
  if (gstType === 'igst') {
    return { cgst: 0, sgst: 0, igst: gstAmount, total: amount + gstAmount };
  }
  const half = gstAmount / 2;
  return { cgst: half, sgst: half, igst: 0, total: amount + gstAmount };
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    paid: 'status-paid',
    received: 'status-paid',
    outstanding: 'status-pending',
    pending: 'status-pending',
    overdue: 'status-overdue',
    draft: 'status-draft',
    sent: 'status-pending',
    cancelled: 'status-draft',
    partial: 'status-pending',
  };
  return map[status.toLowerCase()] || 'status-draft';
}

export function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
];

export const GST_RATES = [0, 5, 12, 18, 28];

export const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'card', label: 'Card' },
];

export const INCOME_CATEGORIES = [
  { value: 'sales', label: 'Sales' },
  { value: 'services', label: 'Services' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'rental', label: 'Rental' },
  { value: 'interest', label: 'Interest' },
  { value: 'dividends', label: 'Dividends' },
  { value: 'other', label: 'Other' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'salaries', label: 'Salaries & Wages' },
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'travel', label: 'Travel & Transport' },
  { value: 'software', label: 'Software & Tools' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'supplies', label: 'Office Supplies' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'taxes', label: 'Taxes & Duties' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'other', label: 'Other' },
];
