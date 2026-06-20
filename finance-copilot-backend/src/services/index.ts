import {
  UserRepository,
  IncomeRepository,
  ExpenseRepository,
  ClientRepository,
  VendorRepository,
  InvoiceRepository,
  ReceivableRepository,
  PayableRepository,
  AuditLogRepository
} from '../repositories';
import { hashPassword, comparePassword } from '../utils/crypto';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { calculateGST, validateGSTIN } from '../utils/gst';
import { generateInvoicePDFBuffer } from '../utils/pdf';
import { uploadToS3 } from '../config/s3';
import { sendEmail, sendTelegramMessage } from '../utils/notification';
import { sendWhatsAppMessage } from '../config/twilio';
import { cache } from '../config/redis';
import { CustomError } from '../middlewares/error';
import { Role, InvoiceStatus, ReceivableStatus, PayableStatus } from '@prisma/client';

export const AuthService = {
  signup: async (data: any) => {
    const existing = await UserRepository.findByEmail(data.email);
    if (existing) throw new CustomError('User with this email already exists', 400);

    const hashedPassword = await hashPassword(data.password);
    const user = await UserRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || Role.VIEWER,
    });

    // Generate simulated OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await cache.setEx(`otp:${data.email}`, 300, otp); // Expires in 5 minutes
    
    console.log(`[OTP Simulated Notification] Registration OTP for ${data.email} is: ${otp}`);
    await sendEmail(
      data.email,
      'Email OTP Verification',
      `Welcome to Finance Copilot! Your verification code is ${otp}.`
    );

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },

  login: async (data: any) => {
    const user = await UserRepository.findByEmail(data.email);
    if (!user) throw new CustomError('Invalid email or password', 400);

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) throw new CustomError('Invalid email or password', 400);

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    };
  },

  verifyOtp: async (email: string, code: string) => {
    const stored = await cache.get(`otp:${email}`);
    if (!stored || stored !== code) {
      throw new CustomError('Invalid or expired OTP verification code', 400);
    }
    await cache.del(`otp:${email}`);
    return { verified: true };
  },

  refresh: async (token: string) => {
    try {
      const payload = verifyRefreshToken(token);
      const user = await UserRepository.findById(payload.userId);
      if (!user) throw new CustomError('User not found', 404);

      const accessToken = generateAccessToken({ userId: user.id, role: user.role });
      return { accessToken };
    } catch {
      throw new CustomError('Invalid refresh token', 401);
    }
  },

  sendResetCode: async (email: string) => {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new CustomError('No account registered with this email', 404);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await cache.setEx(`reset:${email}`, 300, code); // 5 mins

    await sendEmail(
      email,
      'Reset Password Request',
      `Your verification code to reset your account password is: ${code}`
    );
    return { sent: true };
  },

  resetPassword: async (email: string, code: string, newPass: string) => {
    const stored = await cache.get(`reset:${email}`);
    if (!stored || stored !== code) throw new CustomError('Invalid or expired password reset code', 400);

    const user = await UserRepository.findByEmail(email);
    if (!user) throw new CustomError('User not found', 404);

    const hashed = await hashPassword(newPass);
    // Explicit update since user password is not mapped to individual entity updates
    const prismaInstance = require('../config/prisma').prisma;
    await prismaInstance.user.update({
      where: { email },
      data: { password: hashed }
    });

    await cache.del(`reset:${email}`);
    return { reset: true };
  }
};

export const IncomeService = {
  create: async (data: any, createdById: string) => {
    return IncomeRepository.create({
      ...data,
      date: new Date(data.date),
      createdById,
    });
  },
  list: async (filters: any) => {
    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;
    return IncomeRepository.findMany({
      category: filters.category,
      startDate,
      endDate,
    });
  },
  update: async (id: string, data: any) => {
    const dateObj = data.date ? { date: new Date(data.date) } : {};
    return IncomeRepository.update(id, {
      ...data,
      ...dateObj,
    });
  },
  delete: async (id: string) => {
    return IncomeRepository.delete(id);
  }
};

export const ExpenseService = {
  create: async (data: any, receiptBuffer?: Buffer, receiptName?: string, mimeType?: string) => {
    let receiptUrl: string | undefined;
    if (receiptBuffer && receiptName && mimeType) {
      receiptUrl = await uploadToS3(receiptBuffer, receiptName, mimeType);
    }

    return ExpenseRepository.create({
      amount: data.amount,
      category: data.category,
      vendorName: data.vendorName,
      description: data.description,
      date: new Date(data.date),
      receiptUrl,
    });
  },
  list: async (filters: any) => {
    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;
    return ExpenseRepository.findMany({
      category: filters.category,
      startDate,
      endDate,
    });
  },
  update: async (id: string, data: any) => {
    const dateObj = data.date ? { date: new Date(data.date) } : {};
    return ExpenseRepository.update(id, {
      ...data,
      ...dateObj,
    });
  },
  delete: async (id: string) => {
    return ExpenseRepository.delete(id);
  }
};

export const ClientVendorService = {
  createClient: async (data: any) => {
    if (data.gstin && !validateGSTIN(data.gstin)) {
      throw new CustomError('Invalid GSTIN format structure provided', 400);
    }
    return ClientRepository.create(data);
  },
  listClients: async () => {
    return ClientRepository.findAll();
  },
  createVendor: async (data: any) => {
    if (data.gstin && !validateGSTIN(data.gstin)) {
      throw new CustomError('Invalid GSTIN format structure provided', 400);
    }
    return VendorRepository.create(data);
  },
  listVendors: async () => {
    return VendorRepository.findAll();
  }
};

export const InvoiceService = {
  generateInvoice: async (data: any) => {
    const client = await ClientRepository.findById(data.clientId);
    if (!client) throw new CustomError('Selected client not found', 404);

    // Calculate dynamic auto-numbering
    const count = await InvoiceRepository.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${(count + 1).toString().padStart(4, '0')}`;

    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let total = 0;

    const itemsToCreate = data.items.map((item: any) => {
      const calc = calculateGST(item.quantity, item.rate, item.gstRate, data.gstType);
      subtotal += calc.subtotal;
      totalCgst += calc.cgst;
      totalSgst += calc.sgst;
      totalIgst += calc.igst;
      total += calc.total;

      return {
        description: item.description,
        hsnSac: item.hsnSac,
        quantity: item.quantity,
        rate: item.rate,
        amount: calc.subtotal,
        gstRate: item.gstRate,
        cgst: calc.cgst,
        sgst: calc.sgst,
        igst: calc.igst,
        total: calc.total,
      };
    });

    const invoice = await InvoiceRepository.create(
      {
        invoiceNumber,
        clientId: data.clientId,
        dueDate: new Date(data.dueDate),
        subtotal,
        cgst: totalCgst,
        sgst: totalSgst,
        igst: totalIgst,
        total,
        status: InvoiceStatus.DRAFT,
      },
      itemsToCreate
    );

    // Generate dynamic mock PDF
    const pdfBuffer = await generateInvoicePDFBuffer({
      invoiceNumber,
      clientName: client.companyName,
      clientAddress: client.address,
      clientGstin: client.gstin,
      dueDate: data.dueDate,
      items: itemsToCreate,
      gstType: data.gstType,
      subtotal,
      totalCgst,
      totalSgst,
      totalIgst,
      totalGst: totalCgst + totalSgst + totalIgst,
      total,
    });

    // Upload invoice PDF to AWS S3 bucket
    const pdfUrl = await uploadToS3(pdfBuffer, `${invoiceNumber}.pdf`, 'application/pdf');
    await InvoiceRepository.updatePdfUrl(invoice.id, pdfUrl);

    // Automatically create a matching accounts Receivable
    await ReceivableRepository.create({
      clientId: data.clientId,
      invoiceId: invoice.id,
      amount: total,
      balance: total,
      dueDate: new Date(data.dueDate),
    });

    // Log Activity Feed via Telegram
    await sendTelegramMessage(
      `📑 <b>New Tax Invoice Generated</b>\nInvoice No: ${invoiceNumber}\nClient: ${client.companyName}\nTotal Amount: INR ${total}`
    );

    return { ...invoice, pdfUrl };
  },

  listInvoices: async () => {
    return InvoiceRepository.findAll();
  },

  sendInvoiceNotifications: async (invoiceId: string) => {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) throw new CustomError('Invoice not found', 404);

    const message = `Dear Accounts Team at ${invoice.client.companyName},\n\nWe have issued tax invoice ${invoice.invoiceNumber} worth INR ${invoice.total}. The due date is ${invoice.dueDate.toISOString().split('T')[0]}. Please download copy here: ${invoice.pdfUrl}`;

    // 1. Email Send
    await sendEmail(invoice.client.email, `Invoice Issued: ${invoice.invoiceNumber}`, message);

    // 2. WhatsApp message dispatch
    if (invoice.client.phone) {
      await sendWhatsAppMessage(invoice.client.phone, message);
    }

    return { notified: true };
  }
};

export const ReceivablePayableService = {
  listReceivables: async () => {
    return ReceivableRepository.findAll();
  },
  
  recordReceivablePayment: async (id: string, amountReceived: number) => {
    const rec = await ReceivableRepository.findById(id);
    if (!rec) throw new CustomError('Accounts Receivable entry not found', 404);

    const newBalance = Math.max(0, rec.balance - amountReceived);
    let status: ReceivableStatus = ReceivableStatus.PARTIAL;
    if (newBalance === 0) status = ReceivableStatus.PAID;

    const updated = await ReceivableRepository.update(id, {
      balance: newBalance,
      status,
    });

    if (rec.invoiceId && newBalance === 0) {
      await InvoiceRepository.updateStatus(rec.invoiceId, InvoiceStatus.PAID);
    }

    return updated;
  },

  listPayables: async () => {
    return PayableRepository.findAll();
  },

  recordPayablePayment: async (id: string, amountPaid: number) => {
    const pay = await PayableRepository.findById(id);
    if (!pay) throw new CustomError('Accounts Payable entry not found', 404);

    const newBalance = Math.max(0, pay.balance - amountPaid);
    let status: PayableStatus = PayableStatus.PARTIAL;
    if (newBalance === 0) status = PayableStatus.PAID;

    return PayableRepository.update(id, {
      balance: newBalance,
      status,
    });
  }
};

export const DashboardService = {
  getKPIStats: async () => {
    // Attempt to pull cached metrics from Redis to accelerate dashboard loads
    const cached = await cache.get('dashboard:kpis');
    if (cached) return JSON.parse(cached);

    const prismaInstance = require('../config/prisma').prisma;

    const revenues = await prismaInstance.income.aggregate({ _sum: { amount: true } });
    const expenses = await prismaInstance.expense.aggregate({ _sum: { amount: true } });
    const outstandingRec = await prismaInstance.receivable.aggregate({
      where: { NOT: { status: ReceivableStatus.PAID } },
      _sum: { balance: true }
    });
    const outstandingPay = await prismaInstance.payable.aggregate({
      where: { NOT: { status: PayableStatus.PAID } },
      _sum: { balance: true }
    });

    const totalRev = revenues._sum.amount || 0;
    const totalExp = expenses._sum.amount || 0;

    const kpis = {
      totalRevenue: totalRev,
      totalExpenses: totalExp,
      netProfit: totalRev - totalExp,
      outstandingReceivables: outstandingRec._sum.balance || 0,
      outstandingPayables: outstandingPay._sum.balance || 0,
      cashPosition: totalRev - totalExp,
    };

    // Cache dashboard parameters for 5 minutes
    await cache.setEx('dashboard:kpis', 300, JSON.stringify(kpis));

    return kpis;
  }
};

export const ReportsService = {
  getProfitAndLoss: async () => {
    const prismaInstance = require('../config/prisma').prisma;
    
    const incomes = await prismaInstance.income.groupBy({
      by: ['category'],
      _sum: { amount: true },
    });

    const expenses = await prismaInstance.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
    });

    return {
      revenueByCategories: incomes.map((i: any) => ({ category: i.category, total: i._sum.amount })),
      expenseByCategories: expenses.map((e: any) => ({ category: e.category, total: e._sum.amount })),
    };
  }
};

export const AdminService = {
  getAuditLogs: async () => {
    return AuditLogRepository.findAll();
  },
  getUsersList: async () => {
    return UserRepository.findAll();
  }
};

export * from './ExternalDataService';
