import { prisma } from '../config/prisma';
import { Role, InvoiceStatus, ReceivableStatus, PayableStatus, Prisma } from '@prisma/client';

export const UserRepository = {
  findById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },
  create: async (data: Prisma.UserCreateInput) => {
    return prisma.user.create({ data });
  },
  updateRole: async (id: string, role: Role) => {
    return prisma.user.update({ where: { id }, data: { role } });
  },
  findAll: async () => {
    return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
  }
};

export const IncomeRepository = {
  create: async (data: Prisma.IncomeUncheckedCreateInput) => {
    return prisma.income.create({ data });
  },
  findById: async (id: string) => {
    return prisma.income.findUnique({ where: { id } });
  },
  update: async (id: string, data: Prisma.IncomeUpdateInput) => {
    return prisma.income.update({ where: { id }, data });
  },
  delete: async (id: string) => {
    return prisma.income.delete({ where: { id } });
  },
  findMany: async (filter: { category?: string; startDate?: Date; endDate?: Date }) => {
    const where: Prisma.IncomeWhereInput = {};
    if (filter.category) where.category = filter.category;
    if (filter.startDate || filter.endDate) {
      where.date = {
        gte: filter.startDate,
        lte: filter.endDate,
      };
    }
    return prisma.income.findMany({ where, orderBy: { date: 'desc' } });
  }
};

export const ExpenseRepository = {
  create: async (data: Prisma.ExpenseCreateInput) => {
    return prisma.expense.create({ data });
  },
  findById: async (id: string) => {
    return prisma.expense.findUnique({ where: { id } });
  },
  update: async (id: string, data: Prisma.ExpenseUpdateInput) => {
    return prisma.expense.update({ where: { id }, data });
  },
  delete: async (id: string) => {
    return prisma.expense.delete({ where: { id } });
  },
  findMany: async (filter: { category?: string; startDate?: Date; endDate?: Date }) => {
    const where: Prisma.ExpenseWhereInput = {};
    if (filter.category) where.category = filter.category;
    if (filter.startDate || filter.endDate) {
      where.date = {
        gte: filter.startDate,
        lte: filter.endDate,
      };
    }
    return prisma.expense.findMany({ where, orderBy: { date: 'desc' } });
  }
};

export const ClientRepository = {
  create: async (data: Prisma.ClientCreateInput) => {
    return prisma.client.create({ data });
  },
  findById: async (id: string) => {
    return prisma.client.findUnique({ where: { id } });
  },
  update: async (id: string, data: Prisma.ClientUpdateInput) => {
    return prisma.client.update({ where: { id }, data });
  },
  delete: async (id: string) => {
    return prisma.client.delete({ where: { id } });
  },
  findAll: async () => {
    return prisma.client.findMany({ orderBy: { companyName: 'asc' } });
  }
};

export const VendorRepository = {
  create: async (data: Prisma.VendorCreateInput) => {
    return prisma.vendor.create({ data });
  },
  findById: async (id: string) => {
    return prisma.vendor.findUnique({ where: { id } });
  },
  update: async (id: string, data: Prisma.VendorUpdateInput) => {
    return prisma.vendor.update({ where: { id }, data });
  },
  delete: async (id: string) => {
    return prisma.vendor.delete({ where: { id } });
  },
  findAll: async () => {
    return prisma.vendor.findMany({ orderBy: { vendorName: 'asc' } });
  }
};

export const InvoiceRepository = {
  create: async (invoiceData: Prisma.InvoiceUncheckedCreateInput, items: Prisma.InvoiceItemCreateManyInvoiceInput[]) => {
    return prisma.invoice.create({
      data: {
        ...invoiceData,
        items: {
          createMany: {
            data: items
          }
        }
      },
      include: { items: true, client: true }
    });
  },
  findById: async (id: string) => {
    return prisma.invoice.findUnique({ where: { id }, include: { items: true, client: true } });
  },
  findByInvoiceNumber: async (invoiceNumber: string) => {
    return prisma.invoice.findUnique({ where: { invoiceNumber }, include: { items: true, client: true } });
  },
  updateStatus: async (id: string, status: InvoiceStatus) => {
    return prisma.invoice.update({ where: { id }, data: { status } });
  },
  updatePdfUrl: async (id: string, pdfUrl: string) => {
    return prisma.invoice.update({ where: { id }, data: { pdfUrl } });
  },
  findAll: async () => {
    return prisma.invoice.findMany({ include: { client: true }, orderBy: { issueDate: 'desc' } });
  },
  count: async () => {
    return prisma.invoice.count();
  }
};

export const ReceivableRepository = {
  create: async (data: Prisma.ReceivableUncheckedCreateInput) => {
    return prisma.receivable.create({ data });
  },
  findById: async (id: string) => {
    return prisma.receivable.findUnique({ where: { id } });
  },
  findByInvoiceId: async (invoiceId: string) => {
    return prisma.receivable.findUnique({ where: { invoiceId } });
  },
  update: async (id: string, data: Prisma.ReceivableUpdateInput) => {
    return prisma.receivable.update({ where: { id }, data });
  },
  findAll: async () => {
    return prisma.receivable.findMany({ include: { client: true }, orderBy: { dueDate: 'asc' } });
  }
};

export const PayableRepository = {
  create: async (data: Prisma.PayableUncheckedCreateInput) => {
    return prisma.payable.create({ data });
  },
  findById: async (id: string) => {
    return prisma.payable.findUnique({ where: { id } });
  },
  update: async (id: string, data: Prisma.PayableUpdateInput) => {
    return prisma.payable.update({ where: { id }, data });
  },
  findAll: async () => {
    return prisma.payable.findMany({ include: { vendor: true }, orderBy: { dueDate: 'asc' } });
  }
};

export const AuditLogRepository = {
  create: async (data: Prisma.AuditLogUncheckedCreateInput) => {
    return prisma.auditLog.create({ data });
  },
  findAll: async () => {
    return prisma.auditLog.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } });
  }
};

export const NotificationRepository = {
  create: async (data: Prisma.NotificationCreateInput) => {
    return prisma.notification.create({ data });
  },
  updateStatus: async (id: string, status: string) => {
    return prisma.notification.update({ where: { id }, data: { status } });
  }
};
