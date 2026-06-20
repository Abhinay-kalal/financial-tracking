import { PrismaClient, Role, InvoiceStatus, ReceivableStatus, PayableStatus } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial mock data...');

  // 1. Clean existing records
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.receivable.deleteMany({});
  await prisma.payable.deleteMany({});
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.income.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const passwordHash = await bcryptjs.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      name: 'Abhinay Kumar',
      email: 'admin@demo.com',
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  const founderUser = await prisma.user.create({
    data: {
      name: 'Sarah Patel',
      email: 'founder@demo.com',
      password: passwordHash,
      role: Role.FOUNDER,
    },
  });

  console.log('Created seed users: admin@demo.com, founder@demo.com');

  // 3. Create Clients
  const client1 = await prisma.client.create({
    data: {
      companyName: 'Acme Corporation',
      email: 'billing@acme.com',
      phone: '9876543210',
      gstin: '29ABCDE1234F1Z5',
      address: '123 Business Park, Bangalore, Karnataka',
    },
  });

  await prisma.client.create({
    data: {
      companyName: 'TechStart Inc',
      email: 'accounts@techstart.in',
      phone: '9123456789',
      gstin: '27XYZAB9876C1D2',
      address: '45 Tech Hub, Mumbai, Maharashtra',
    },
  });

  console.log('Created seed clients');

  // 4. Create Vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      vendorName: 'Amazon Web Services',
      email: 'billing@aws.com',
      phone: '1800-419-0767',
      gstin: '29ABCDE1234F1Z5',
      address: 'AWS India, Bangalore, Karnataka',
    },
  });

  console.log('Created seed vendors');

  // 5. Create Income Records
  await prisma.income.create({
    data: {
      amount: 125000,
      category: 'services',
      source: 'Acme Corporation',
      description: 'Website Development project delivery',
      date: new Date('2024-12-18'),
      createdById: adminUser.id,
    },
  });

  await prisma.income.create({
    data: {
      amount: 45000,
      category: 'consulting',
      source: 'TechStart Inc',
      description: 'Consulting Fee - TechStart',
      date: new Date('2024-12-16'),
      createdById: founderUser.id,
    },
  });

  // 6. Create Expense Records
  await prisma.expense.create({
    data: {
      amount: 18500,
      category: 'software',
      vendorName: 'Amazon Web Services',
      description: 'AWS Server Costs',
      date: new Date('2024-12-17'),
    },
  });

  console.log('Created seed transactions');

  // 7. Create Invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-202412-0001',
      clientId: client1.id,
      dueDate: new Date('2024-12-31'),
      subtotal: 100000,
      cgst: 9000,
      sgst: 9000,
      igst: 0,
      total: 118000,
      status: InvoiceStatus.SENT,
      items: {
        create: [
          {
            description: 'Website Development',
            hsnSac: '998314',
            quantity: 1,
            rate: 100000,
            amount: 100000,
            gstRate: 18,
            cgst: 9000,
            sgst: 9000,
            igst: 0,
            total: 118000,
          },
        ],
      },
    },
  });

  // Create matching Receivable
  await prisma.receivable.create({
    data: {
      clientId: client1.id,
      invoiceId: invoice1.id,
      amount: 118000,
      balance: 118000,
      dueDate: new Date('2024-12-31'),
      status: ReceivableStatus.OUTSTANDING,
    },
  });

  // 8. Create manual Payables
  await prisma.payable.create({
    data: {
      vendorId: vendor1.id,
      amount: 18500,
      balance: 18500,
      dueDate: new Date('2024-12-31'),
      status: PayableStatus.OUTSTANDING,
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
