import { Router } from 'express';
import multer from 'multer';
import {
  AuthController,
  IncomeController,
  ExpenseController,
  ClientController,
  VendorController,
  InvoiceController,
  ReceivableController,
  PayableController,
  DashboardController,
  ReportsController,
  AdminController,
  ExternalDataController
} from '../controllers';
import { validateRequest } from '../middlewares/validate';
import { requireAuth, requireRoles } from '../middlewares/auth';
import {
  signupSchema,
  loginSchema,
  otpSchema,
  resetPasswordSchema,
  incomeSchema,
  expenseSchema,
  clientSchema,
  vendorSchema,
  invoiceSchema
} from '../models';
import { Role } from '@prisma/client';

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
const router = Router();

// --- AUTHENTICATION ROUTES ---
router.post('/auth/signup', validateRequest(signupSchema), AuthController.signup);
router.post('/auth/login', validateRequest(loginSchema), AuthController.login);
router.post('/auth/otp-verify', validateRequest(otpSchema), AuthController.verifyOtp);
router.post('/auth/refresh', AuthController.refresh);
router.post('/auth/forgot-password', AuthController.sendResetCode);
router.post('/auth/reset-password', validateRequest(resetPasswordSchema), AuthController.resetPassword);
router.post('/auth/select-role', requireAuth, AuthController.selectRole);

// --- INCOME MODULE ---
router.post('/income', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER, Role.ACCOUNTANT]), validateRequest(incomeSchema), IncomeController.create);
router.get('/income', requireAuth, IncomeController.list);
router.put('/income/:id', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER, Role.ACCOUNTANT]), IncomeController.update);
router.delete('/income/:id', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER]), IncomeController.delete);

// --- EXPENSES MODULE ---
router.post('/expenses', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER, Role.ACCOUNTANT]), upload.single('receipt'), ExpenseController.create);
router.get('/expenses', requireAuth, ExpenseController.list);
router.put('/expenses/:id', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER, Role.ACCOUNTANT]), ExpenseController.update);
router.delete('/expenses/:id', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER]), ExpenseController.delete);

// --- CLIENTS & VENDORS MODULE ---
router.post('/clients', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER, Role.ACCOUNTANT]), validateRequest(clientSchema), ClientController.create);
router.get('/clients', requireAuth, ClientController.list);
router.post('/vendors', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER, Role.ACCOUNTANT]), validateRequest(vendorSchema), VendorController.create);
router.get('/vendors', requireAuth, VendorController.list);

// --- GST TAX INVOICES ---
router.post('/invoices', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER, Role.ACCOUNTANT]), validateRequest(invoiceSchema), InvoiceController.create);
router.get('/invoices', requireAuth, InvoiceController.list);
router.post('/invoices/:id/send', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER, Role.ACCOUNTANT]), InvoiceController.sendNotification);

// --- RECEIVABLES & PAYABLES ---
router.get('/receivables', requireAuth, ReceivableController.list);
router.post('/receivables/:id/pay', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER, Role.ACCOUNTANT]), ReceivableController.recordPayment);
router.get('/payables', requireAuth, PayableController.list);
router.post('/payables/:id/pay', requireAuth, requireRoles([Role.ADMIN, Role.FOUNDER, Role.ACCOUNTANT]), PayableController.recordPayment);

// --- DASHBOARD & REPORTS ---
router.get('/dashboard/stats', requireAuth, DashboardController.getKPIs);
router.get('/reports/profit-loss', requireAuth, ReportsController.getPL);

// --- ADMIN PANEL ---
router.get('/admin/logs', requireAuth, requireRoles([Role.ADMIN]), AdminController.getLogs);
router.get('/admin/users', requireAuth, requireRoles([Role.ADMIN]), AdminController.getUsers);

// --- EXTERNAL DATA ---
router.get('/external/market', requireAuth, ExternalDataController.getMarketData);
router.get('/external/exchange-rates', requireAuth, ExternalDataController.getExchangeRates);

export default router;
