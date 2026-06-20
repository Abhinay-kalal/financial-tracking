import { Request, Response, NextFunction } from 'express';
import {
  AuthService,
  IncomeService,
  ExpenseService,
  ClientVendorService,
  InvoiceService,
  ReceivablePayableService,
  DashboardService,
  ReportsService,
  AdminService,
  ExternalDataService
} from '../services';
import { AuthenticatedRequest } from '../middlewares/auth';

export const AuthController = {
  signup: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AuthService.signup(req.body);
      res.status(201).json({ success: true, message: 'User registered successfully. Check email for verification OTP code.', data: result });
    } catch (error) {
      next(error);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await AuthService.login(req.body);
      
      // Set Refresh Token as HTTP-only secure cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({ success: true, message: 'Login successful', data: { user, token: accessToken } });
    } catch (error) {
      next(error);
    }
  },

  verifyOtp: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, code } = req.body;
      const result = await AuthService.verifyOtp(email, code);
      res.status(200).json({ success: true, message: 'Email OTP code verified successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      if (!token) {
        res.status(401).json({ success: false, message: 'Refresh token credentials not provided' });
        return;
      }
      const result = await AuthService.refresh(token);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  sendResetCode: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AuthService.sendResetCode(req.body.email);
      res.status(200).json({ success: true, message: 'Password recovery OTP sent to email', data: result });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, code, newPassword } = req.body;
      const result = await AuthService.resetPassword(email, code, newPassword);
      res.status(200).json({ success: true, message: 'Password updated successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  selectRole: async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId; // Note: req.user contains the decoded JWT token payload { userId, role }
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const { role } = req.body;
      const prismaInstance = require('../config/prisma').prisma;
      const updatedUser = await prismaInstance.user.update({
        where: { id: userId },
        data: { role }
      });
      res.status(200).json({ success: true, message: 'Role updated successfully', data: { role: updatedUser.role } });
    } catch (error) {
      next(error);
    }
  }
};

export const IncomeController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 'admin-fallback-id';
      const result = await IncomeService.create(req.body, userId);
      res.status(201).json({ success: true, message: 'Income logged successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await IncomeService.list(req.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await IncomeService.update(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Income details updated', data: result });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await IncomeService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Income record deleted' });
    } catch (error) {
      next(error);
    }
  }
};

export const ExpenseController = {
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const receiptFile = req.file;
      const result = await ExpenseService.create(
        req.body,
        receiptFile?.buffer,
        receiptFile?.originalname,
        receiptFile?.mimetype
      );
      res.status(201).json({ success: true, message: 'Expense logged successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ExpenseService.list(req.query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ExpenseService.update(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Expense details updated', data: result });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await ExpenseService.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Expense record deleted' });
    } catch (error) {
      next(error);
    }
  }
};

export const ClientController = {
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ClientVendorService.createClient(req.body);
      res.status(201).json({ success: true, message: 'Client registered', data: result });
    } catch (error) {
      next(error);
    }
  },
  list: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ClientVendorService.listClients();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
};

export const VendorController = {
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ClientVendorService.createVendor(req.body);
      res.status(201).json({ success: true, message: 'Vendor profile created', data: result });
    } catch (error) {
      next(error);
    }
  },
  list: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ClientVendorService.listVendors();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
};

export const InvoiceController = {
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await InvoiceService.generateInvoice(req.body);
      res.status(201).json({ success: true, message: 'GST tax invoice created', data: result });
    } catch (error) {
      next(error);
    }
  },

  list: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await InvoiceService.listInvoices();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  sendNotification: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await InvoiceService.sendInvoiceNotifications(req.params.id);
      res.status(200).json({ success: true, message: 'Invoice copy dispatched to client channels', data: result });
    } catch (error) {
      next(error);
    }
  }
};

export const ReceivableController = {
  list: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ReceivablePayableService.listReceivables();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  recordPayment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { amount } = req.body;
      const result = await ReceivablePayableService.recordReceivablePayment(req.params.id, amount);
      res.status(200).json({ success: true, message: 'Collection details logged', data: result });
    } catch (error) {
      next(error);
    }
  }
};

export const PayableController = {
  list: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ReceivablePayableService.listPayables();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  recordPayment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { amount } = req.body;
      const result = await ReceivablePayableService.recordPayablePayment(req.params.id, amount);
      res.status(200).json({ success: true, message: 'Outgoing payment details logged', data: result });
    } catch (error) {
      next(error);
    }
  }
};

export const DashboardController = {
  getKPIs: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await DashboardService.getKPIStats();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
};

export const ReportsController = {
  getPL: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ReportsService.getProfitAndLoss();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
};

export const AdminController = {
  getLogs: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AdminService.getAuditLogs();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
  getUsers: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AdminService.getUsersList();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
};

export const ExternalDataController = {
  getMarketData: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await ExternalDataService.getMarketData();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
  getExchangeRates: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await ExternalDataService.getExchangeRates();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
};
