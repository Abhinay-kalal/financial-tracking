import { z } from 'zod';
import { Role } from '@prisma/client';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const otpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(6),
  code: z.string().length(6),
});

export const incomeSchema = z.object({
  amount: z.number().positive(),
  category: z.string(),
  source: z.string(),
  description: z.string().optional(),
  date: z.string().or(z.date()),
});

export const expenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string(),
  vendorName: z.string(),
  description: z.string().optional(),
  date: z.string().or(z.date()),
});

export const clientSchema = z.object({
  companyName: z.string().min(2),
  gstin: z.string().optional(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
});

export const vendorSchema = z.object({
  vendorName: z.string().min(2),
  gstin: z.string().optional(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
});

export const receivableSchema = z.object({
  clientId: z.string().uuid(),
  amount: z.number().positive(),
  dueDate: z.string(),
  invoiceId: z.string().uuid().optional(),
});

export const payableSchema = z.object({
  vendorId: z.string().uuid(),
  amount: z.number().positive(),
  dueDate: z.string(),
});

export const invoiceItemSchema = z.object({
  description: z.string(),
  hsnSac: z.string(),
  quantity: z.number().int().positive(),
  rate: z.number().positive(),
  gstRate: z.number().nonnegative(),
});

export const invoiceSchema = z.object({
  clientId: z.string().uuid(),
  dueDate: z.string(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  gstType: z.enum(['cgst_sgst', 'igst', 'exempt']),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
});
