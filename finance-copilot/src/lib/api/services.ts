import apiClient from './client';
import type { User, UserRole } from '@/types';

export interface LoginPayload { email: string; password: string; }
export interface SignupPayload { name: string; email: string; password: string; }
export interface OtpPayload { email: string; otp: string; }

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },
  signup: async (payload: SignupPayload) => {
    const { data } = await apiClient.post('/auth/signup', payload);
    return data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },
  verifyOtp: async (payload: OtpPayload) => {
    const { data } = await apiClient.post('/auth/verify-otp', payload);
    return data;
  },
  resetPassword: async (token: string, password: string) => {
    const { data } = await apiClient.post('/auth/reset-password', { token, password });
    return data;
  },
  selectRole: async (role: UserRole) => {
    const { data } = await apiClient.post('/auth/select-role', { role });
    return data;
  },
  logout: async () => {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  },
  getProfile: async () => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};

export const incomeService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/income', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/income/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post('/income', payload);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put(`/income/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/income/${id}`);
    return data;
  },
  getAnalytics: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/income/analytics', { params });
    return data;
  },
};

export const expenseService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/expenses', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/expenses/${id}`);
    return data;
  },
  create: async (payload: FormData | Record<string, unknown>) => {
    const { data } = await apiClient.post('/expenses', payload, {
      headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put(`/expenses/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/expenses/${id}`);
    return data;
  },
  getAnalytics: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/expenses/analytics', { params });
    return data;
  },
};

export const clientService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/clients', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/clients/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post('/clients', payload);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put(`/clients/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/clients/${id}`);
    return data;
  },
};

export const vendorService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/vendors', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/vendors/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post('/vendors', payload);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put(`/vendors/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/vendors/${id}`);
    return data;
  },
};

export const invoiceService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/invoices', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/invoices/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await apiClient.post('/invoices', payload);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put(`/invoices/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/invoices/${id}`);
    return data;
  },
  send: async (id: string) => {
    const { data } = await apiClient.post(`/invoices/${id}/send`);
    return data;
  },
  markPaid: async (id: string) => {
    const { data } = await apiClient.post(`/invoices/${id}/mark-paid`);
    return data;
  },
};

export const receivableService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/receivables', { params });
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put(`/receivables/${id}`, payload);
    return data;
  },
  sendReminder: async (id: string) => {
    const { data } = await apiClient.post(`/receivables/${id}/reminder`);
    return data;
  },
};

export const payableService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/payables', { params });
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await apiClient.put(`/payables/${id}`, payload);
    return data;
  },
  markPaid: async (id: string) => {
    const { data } = await apiClient.post(`/payables/${id}/mark-paid`);
    return data;
  },
};

export const reportService = {
  getDashboardStats: async () => {
    const { data } = await apiClient.get('/dashboard/stats');
    return data;
  },
  getCategoryReport: async (type: 'income' | 'expense', params?: Record<string, unknown>) => {
    const { data } = await apiClient.get(`/reports/category/${type}`, { params });
    return data;
  },
  getMonthlyReport: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/reports/monthly', { params });
    return data;
  },
  getAnnualReport: async (year: number) => {
    const { data } = await apiClient.get(`/reports/annual/${year}`);
    return data;
  },
  exportReport: async (type: string, format: 'pdf' | 'csv', params?: Record<string, unknown>) => {
    const { data } = await apiClient.get(`/reports/export/${type}`, {
      params: { format, ...params },
      responseType: 'blob',
    });
    return data;
  },
};

export const notificationService = {
  getAll: async () => {
    const { data } = await apiClient.get('/notifications');
    return data;
  },
  markRead: async (id: string) => {
    const { data } = await apiClient.put(`/notifications/${id}/read`);
    return data;
  },
  markAllRead: async () => {
    const { data } = await apiClient.put('/notifications/read-all');
    return data;
  },
};

export const adminService = {
  getUsers: async () => {
    const { data } = await apiClient.get('/admin/users');
    return data;
  },
  updateUserRole: async (userId: string, role: UserRole) => {
    const { data } = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return data;
  },
  getAuditLogs: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get('/admin/audit-logs', { params });
    return data;
  },
  getSystemAnalytics: async () => {
    const { data } = await apiClient.get('/admin/analytics');
    return data;
  },
};

export const externalDataService = {
  getMarketData: async () => {
    const { data } = await apiClient.get('/external/market');
    return data;
  },
  getExchangeRates: async () => {
    const { data } = await apiClient.get('/external/exchange-rates');
    return data;
  }
};
