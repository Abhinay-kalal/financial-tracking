import z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const incomeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  clientName: z.string().optional(),
  description: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  status: z.enum(['received', 'pending']),
});

export const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  vendorName: z.string().optional(),
  description: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  status: z.enum(['paid', 'pending']),
});

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  billingAddress: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  country: z.string().default('India'),
});

export const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  category: z.string().min(1, 'Category is required'),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
});

export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  hsnSac: z.string().min(1, 'HSN/SAC is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  rate: z.number().positive('Rate must be positive'),
  gstRate: z.number().min(0).max(28),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  gstType: z.enum(['cgst_sgst', 'igst', 'exempt']),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
});

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  gstin: z.string().min(15, 'Invalid GSTIN').max(15),
  pan: z.string().length(10, 'PAN must be 10 characters'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  phone: z.string().min(10, 'Invalid phone'),
  email: z.string().email('Invalid email'),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type VendorInput = z.infer<typeof vendorSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
