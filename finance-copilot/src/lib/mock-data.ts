// Mock data for development (replaces real API calls)
import type {
  DashboardStats,
  ChartDataPoint,
  Transaction,
  Income,
  Expense,
  Client,
  Vendor,
  Invoice,
  Receivable,
  Payable,
} from '@/types';

export const mockDashboardStats: DashboardStats = {
  totalRevenue: 4850000,
  totalExpenses: 2120000,
  netProfit: 2730000,
  outstandingReceivables: 890000,
  outstandingPayables: 340000,
  cashPosition: 2390000,
  revenueChange: 12.5,
  expenseChange: 8.2,
  profitChange: 18.7,
};

export const mockChartData: ChartDataPoint[] = [
  { month: 'Jan', revenue: 380000, expenses: 160000, profit: 220000 },
  { month: 'Feb', revenue: 420000, expenses: 185000, profit: 235000 },
  { month: 'Mar', revenue: 390000, expenses: 172000, profit: 218000 },
  { month: 'Apr', revenue: 460000, expenses: 195000, profit: 265000 },
  { month: 'May', revenue: 520000, expenses: 210000, profit: 310000 },
  { month: 'Jun', revenue: 485000, expenses: 198000, profit: 287000 },
  { month: 'Jul', revenue: 550000, expenses: 225000, profit: 325000 },
  { month: 'Aug', revenue: 510000, expenses: 215000, profit: 295000 },
  { month: 'Sep', revenue: 480000, expenses: 190000, profit: 290000 },
  { month: 'Oct', revenue: 560000, expenses: 235000, profit: 325000 },
  { month: 'Nov', revenue: 610000, expenses: 248000, profit: 362000 },
  { month: 'Dec', revenue: 485000, expenses: 187000, profit: 298000 },
];

export const mockTransactions: Transaction[] = [
  { id: '1', type: 'income', title: 'Website Development - Acme Corp', amount: 125000, date: '2024-12-18', category: 'services', status: 'received' },
  { id: '2', type: 'expense', title: 'AWS Server Costs', amount: 18500, date: '2024-12-17', category: 'software', status: 'paid' },
  { id: '3', type: 'income', title: 'Consulting Fee - TechStart', amount: 45000, date: '2024-12-16', category: 'consulting', status: 'received' },
  { id: '4', type: 'expense', title: 'Office Rent - December', amount: 65000, date: '2024-12-15', category: 'rent', status: 'paid' },
  { id: '5', type: 'income', title: 'Mobile App License - GlobalSoft', amount: 85000, date: '2024-12-14', category: 'sales', status: 'pending' },
  { id: '6', type: 'expense', title: 'Team Salaries', amount: 450000, date: '2024-12-01', category: 'salaries', status: 'paid' },
];

export const mockIncomes: Income[] = [
  { id: '1', title: 'Website Development - Acme Corp', amount: 125000, category: 'services', date: '2024-12-18', clientName: 'Acme Corp', description: 'Full website development project', paymentMethod: 'bank_transfer', status: 'received', createdAt: '2024-12-18', updatedAt: '2024-12-18' },
  { id: '2', title: 'Consulting Fee - TechStart', amount: 45000, category: 'consulting', date: '2024-12-16', clientName: 'TechStart Inc', paymentMethod: 'upi', status: 'received', createdAt: '2024-12-16', updatedAt: '2024-12-16' },
  { id: '3', title: 'Mobile App License', amount: 85000, category: 'sales', date: '2024-12-14', clientName: 'GlobalSoft', paymentMethod: 'bank_transfer', status: 'pending', createdAt: '2024-12-14', updatedAt: '2024-12-14' },
  { id: '4', title: 'Annual Maintenance Contract', amount: 36000, category: 'services', date: '2024-12-10', clientName: 'RetailChain Ltd', paymentMethod: 'cheque', status: 'received', createdAt: '2024-12-10', updatedAt: '2024-12-10' },
  { id: '5', title: 'Training Workshop', amount: 28000, category: 'services', date: '2024-12-08', clientName: 'EduTech Hub', paymentMethod: 'upi', status: 'received', createdAt: '2024-12-08', updatedAt: '2024-12-08' },
];

export const mockExpenses: Expense[] = [
  { id: '1', title: 'AWS Server Costs', amount: 18500, category: 'software', date: '2024-12-17', vendorName: 'Amazon Web Services', paymentMethod: 'card', status: 'paid', createdAt: '2024-12-17', updatedAt: '2024-12-17' },
  { id: '2', title: 'Office Rent - December', amount: 65000, category: 'rent', date: '2024-12-15', description: 'Monthly office rent', paymentMethod: 'bank_transfer', status: 'paid', createdAt: '2024-12-15', updatedAt: '2024-12-15' },
  { id: '3', title: 'Team Salaries', amount: 450000, category: 'salaries', date: '2024-12-01', description: 'Monthly payroll', paymentMethod: 'bank_transfer', status: 'paid', createdAt: '2024-12-01', updatedAt: '2024-12-01' },
  { id: '4', title: 'Google Workspace', amount: 8400, category: 'software', date: '2024-12-05', vendorName: 'Google', paymentMethod: 'card', status: 'paid', createdAt: '2024-12-05', updatedAt: '2024-12-05' },
  { id: '5', title: 'Office Supplies', amount: 12500, category: 'supplies', date: '2024-12-12', paymentMethod: 'cash', status: 'paid', createdAt: '2024-12-12', updatedAt: '2024-12-12' },
];

export const mockClients: Client[] = [
  { id: '1', name: 'Acme Corporation', email: 'billing@acme.com', phone: '9876543210', gstin: '29ABCDE1234F1Z5', billingAddress: '123 Business Park', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India', totalBilled: 450000, totalReceived: 325000, outstanding: 125000, createdAt: '2024-01-15', updatedAt: '2024-12-18' },
  { id: '2', name: 'TechStart Inc', email: 'accounts@techstart.in', phone: '9123456789', gstin: '27XYZAB9876C1D2', billingAddress: '45 Tech Hub', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India', totalBilled: 180000, totalReceived: 180000, outstanding: 0, createdAt: '2024-03-20', updatedAt: '2024-12-16' },
  { id: '3', name: 'GlobalSoft Solutions', email: 'finance@globalsoft.com', phone: '9988776655', billingAddress: '7 Software Park', city: 'Hyderabad', state: 'Telangana', pincode: '500001', country: 'India', totalBilled: 320000, totalReceived: 235000, outstanding: 85000, createdAt: '2024-02-10', updatedAt: '2024-12-14' },
  { id: '4', name: 'RetailChain Ltd', email: 'ap@retailchain.co', phone: '9765432109', gstin: '06PQRST5678G2H3', billingAddress: '89 Commerce Street', city: 'Delhi', state: 'Delhi', pincode: '110001', country: 'India', totalBilled: 120000, totalReceived: 120000, outstanding: 0, createdAt: '2024-06-05', updatedAt: '2024-12-10' },
];

export const mockVendors: Vendor[] = [
  { id: '1', name: 'Amazon Web Services', email: 'billing@aws.com', phone: '1800-419-0767', address: 'AWS India', city: 'Bangalore', state: 'Karnataka', pincode: '560001', category: 'software', totalBilled: 185000, totalPaid: 185000, outstanding: 0, createdAt: '2024-01-01', updatedAt: '2024-12-17' },
  { id: '2', name: 'PropTech Spaces', email: 'lease@proptech.in', phone: '9876512345', address: '1 Realty Tower', city: 'Bangalore', state: 'Karnataka', pincode: '560002', category: 'rent', totalBilled: 780000, totalPaid: 780000, outstanding: 0, createdAt: '2024-01-01', updatedAt: '2024-12-15' },
  { id: '3', name: 'Office Mart', email: 'orders@officemart.in', phone: '9345678901', address: '23 Supply Lane', city: 'Pune', state: 'Maharashtra', pincode: '411001', category: 'supplies', totalBilled: 45000, totalPaid: 45000, outstanding: 0, createdAt: '2024-04-15', updatedAt: '2024-12-12' },
];

export const mockInvoices: Invoice[] = [
  {
    id: '1', invoiceNumber: 'INV-202412-0042', clientId: '1', clientName: 'Acme Corporation',
    clientGstin: '29ABCDE1234F1Z5', clientAddress: '123 Business Park, Bangalore',
    issueDate: '2024-12-01', dueDate: '2024-12-31', status: 'sent',
    items: [
      { id: '1', description: 'Website Development', hsnSac: '998314', quantity: 1, unit: 'Job', rate: 100000, amount: 100000, gstRate: 18, cgst: 9000, sgst: 9000, igst: 0, total: 118000 }
    ],
    subtotal: 100000, totalCgst: 9000, totalSgst: 9000, totalIgst: 0, totalGst: 18000, total: 118000,
    gstType: 'cgst_sgst', notes: 'Thank you for your business!', terms: 'Payment due within 30 days',
    isRecurring: false, createdAt: '2024-12-01', updatedAt: '2024-12-01'
  },
  {
    id: '2', invoiceNumber: 'INV-202411-0038', clientId: '2', clientName: 'TechStart Inc',
    clientGstin: '27XYZAB9876C1D2', clientAddress: '45 Tech Hub, Mumbai',
    issueDate: '2024-11-15', dueDate: '2024-12-15', status: 'paid',
    items: [
      { id: '1', description: 'Monthly Consulting', hsnSac: '998312', quantity: 10, unit: 'Hours', rate: 4500, amount: 45000, gstRate: 18, cgst: 0, sgst: 0, igst: 8100, total: 53100 }
    ],
    subtotal: 45000, totalCgst: 0, totalSgst: 0, totalIgst: 8100, totalGst: 8100, total: 53100,
    gstType: 'igst', isRecurring: true, recurringPeriod: 'monthly', createdAt: '2024-11-15', updatedAt: '2024-12-16'
  },
  {
    id: '3', invoiceNumber: 'INV-202411-0035', clientId: '3', clientName: 'GlobalSoft Solutions',
    clientAddress: '7 Software Park, Hyderabad',
    issueDate: '2024-11-01', dueDate: '2024-11-30', status: 'overdue',
    items: [
      { id: '1', description: 'Mobile App License - Annual', hsnSac: '998313', quantity: 1, unit: 'Year', rate: 85000, amount: 85000, gstRate: 18, cgst: 7650, sgst: 7650, igst: 0, total: 100300 }
    ],
    subtotal: 85000, totalCgst: 7650, totalSgst: 7650, totalIgst: 0, totalGst: 15300, total: 100300,
    gstType: 'cgst_sgst', isRecurring: false, createdAt: '2024-11-01', updatedAt: '2024-11-01'
  },
];

export const mockReceivables: Receivable[] = [
  { id: '1', clientId: '1', clientName: 'Acme Corporation', invoiceId: '1', invoiceNumber: 'INV-202412-0042', amount: 118000, dueDate: '2024-12-31', status: 'outstanding', amountReceived: 0, balance: 118000, reminderSent: true, lastReminderDate: '2024-12-15', createdAt: '2024-12-01' },
  { id: '2', clientId: '3', clientName: 'GlobalSoft Solutions', invoiceId: '3', invoiceNumber: 'INV-202411-0035', amount: 100300, dueDate: '2024-11-30', status: 'overdue', amountReceived: 15000, balance: 85300, reminderSent: true, lastReminderDate: '2024-12-10', createdAt: '2024-11-01' },
  { id: '3', clientId: '4', clientName: 'RetailChain Ltd', amount: 42480, dueDate: '2024-12-25', status: 'outstanding', amountReceived: 0, balance: 42480, reminderSent: false, createdAt: '2024-12-10' },
];

export const mockPayables: Payable[] = [
  { id: '1', vendorId: '1', vendorName: 'Amazon Web Services', description: 'December Cloud Services', amount: 18500, dueDate: '2024-12-31', status: 'outstanding', amountPaid: 0, balance: 18500, category: 'software', createdAt: '2024-12-01' },
  { id: '2', vendorId: '2', vendorName: 'PropTech Spaces', description: 'January 2025 Rent', amount: 65000, dueDate: '2025-01-05', status: 'outstanding', amountPaid: 0, balance: 65000, category: 'rent', createdAt: '2024-12-15' },
  { id: '3', vendorId: '3', vendorName: 'Office Mart', description: 'Stationery Order #4521', amount: 8750, dueDate: '2024-12-20', status: 'overdue', amountPaid: 0, balance: 8750, category: 'supplies', createdAt: '2024-12-10' },
];
