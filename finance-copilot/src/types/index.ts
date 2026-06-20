// Global TypeScript Types

export type UserRole = 'admin' | 'founder' | 'accountant' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  logo?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Income Types
export type IncomeCategory =
  | 'sales'
  | 'services'
  | 'consulting'
  | 'rental'
  | 'interest'
  | 'dividends'
  | 'other';

export interface Income {
  id: string;
  title: string;
  amount: number;
  category: IncomeCategory;
  date: string;
  clientId?: string;
  clientName?: string;
  description?: string;
  invoiceId?: string;
  paymentMethod: 'bank_transfer' | 'cash' | 'upi' | 'cheque' | 'card';
  status: 'received' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// Expense Types
export type ExpenseCategory =
  | 'salaries'
  | 'rent'
  | 'utilities'
  | 'marketing'
  | 'travel'
  | 'software'
  | 'equipment'
  | 'supplies'
  | 'maintenance'
  | 'taxes'
  | 'insurance'
  | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  vendorId?: string;
  vendorName?: string;
  description?: string;
  receiptUrl?: string;
  paymentMethod: 'bank_transfer' | 'cash' | 'upi' | 'cheque' | 'card';
  status: 'paid' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// Client Types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstin?: string;
  pan?: string;
  billingAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  totalBilled: number;
  totalReceived: number;
  outstanding: number;
  createdAt: string;
  updatedAt: string;
}

// Vendor Types
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstin?: string;
  pan?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  category: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  totalBilled: number;
  totalPaid: number;
  outstanding: number;
  createdAt: string;
  updatedAt: string;
}

// Invoice Types
export type GSTType = 'cgst_sgst' | 'igst' | 'exempt';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientGstin?: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalGst: number;
  total: number;
  gstType: GSTType;
  notes?: string;
  terms?: string;
  isRecurring: boolean;
  recurringPeriod?: 'monthly' | 'quarterly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

// Receivable Types
export interface Receivable {
  id: string;
  clientId: string;
  clientName: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  dueDate: string;
  status: 'outstanding' | 'partial' | 'paid' | 'overdue';
  amountReceived: number;
  balance: number;
  reminderSent: boolean;
  lastReminderDate?: string;
  createdAt: string;
}

// Payable Types
export interface Payable {
  id: string;
  vendorId: string;
  vendorName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'outstanding' | 'partial' | 'paid' | 'overdue';
  amountPaid: number;
  balance: number;
  category: string;
  createdAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingReceivables: number;
  outstandingPayables: number;
  cashPosition: number;
  revenueChange: number;
  expenseChange: number;
  profitChange: number;
}

export interface ChartDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  date: string;
  category: string;
  status: string;
}

// Report Types
export interface CategoryReport {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyReport {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter Types
export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  dateRange?: DateRange;
  page?: number;
  limit?: number;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
