-- ============================================================
-- Finance Copilot — Supabase SQL Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ENUMS
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FOUNDER', 'ACCOUNTANT', 'VIEWER');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "ReceivableStatus" AS ENUM ('OUTSTANDING', 'PARTIAL', 'PAID', 'OVERDUE');
CREATE TYPE "PayableStatus" AS ENUM ('OUTSTANDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- ============================================================
-- TABLE: User
-- ============================================================
CREATE TABLE "User" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "name"      TEXT        NOT NULL,
  "email"     TEXT        NOT NULL,
  "password"  TEXT        NOT NULL,
  "role"      "Role"      NOT NULL DEFAULT 'VIEWER',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Auto-update updatedAt on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "User_updatedAt_trigger"
BEFORE UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: Income
-- ============================================================
CREATE TABLE "Income" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "amount"      DOUBLE PRECISION NOT NULL,
  "category"    TEXT        NOT NULL,
  "source"      TEXT        NOT NULL,
  "description" TEXT,
  "date"        TIMESTAMPTZ NOT NULL,
  "createdById" TEXT        NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Income_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Income_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- TABLE: Expense
-- ============================================================
CREATE TABLE "Expense" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "amount"      DOUBLE PRECISION NOT NULL,
  "category"    TEXT        NOT NULL,
  "vendorName"  TEXT        NOT NULL,
  "receiptUrl"  TEXT,
  "description" TEXT,
  "date"        TIMESTAMPTZ NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- TABLE: Client
-- ============================================================
CREATE TABLE "Client" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "companyName" TEXT        NOT NULL,
  "gstin"       TEXT,
  "email"       TEXT        NOT NULL,
  "phone"       TEXT        NOT NULL,
  "address"     TEXT        NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- TABLE: Vendor
-- ============================================================
CREATE TABLE "Vendor" (
  "id"         TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "vendorName" TEXT        NOT NULL,
  "gstin"      TEXT,
  "email"      TEXT        NOT NULL,
  "phone"      TEXT        NOT NULL,
  "address"    TEXT        NOT NULL,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- TABLE: Invoice
-- ============================================================
CREATE TABLE "Invoice" (
  "id"            TEXT            NOT NULL DEFAULT gen_random_uuid()::text,
  "invoiceNumber" TEXT            NOT NULL,
  "clientId"      TEXT            NOT NULL,
  "issueDate"     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  "dueDate"       TIMESTAMPTZ     NOT NULL,
  "subtotal"      DOUBLE PRECISION NOT NULL,
  "cgst"          DOUBLE PRECISION NOT NULL,
  "sgst"          DOUBLE PRECISION NOT NULL,
  "igst"          DOUBLE PRECISION NOT NULL,
  "total"         DOUBLE PRECISION NOT NULL,
  "status"        "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
  "pdfUrl"        TEXT,
  "createdAt"     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

  CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- ============================================================
-- TABLE: InvoiceItem
-- ============================================================
CREATE TABLE "InvoiceItem" (
  "id"          TEXT             NOT NULL DEFAULT gen_random_uuid()::text,
  "invoiceId"   TEXT             NOT NULL,
  "description" TEXT             NOT NULL,
  "hsnSac"      TEXT             NOT NULL,
  "quantity"    INTEGER          NOT NULL,
  "rate"        DOUBLE PRECISION NOT NULL,
  "amount"      DOUBLE PRECISION NOT NULL,
  "gstRate"     DOUBLE PRECISION NOT NULL,
  "cgst"        DOUBLE PRECISION NOT NULL,
  "sgst"        DOUBLE PRECISION NOT NULL,
  "igst"        DOUBLE PRECISION NOT NULL,
  "total"       DOUBLE PRECISION NOT NULL,

  CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- TABLE: RecurringInvoice
-- ============================================================
CREATE TABLE "RecurringInvoice" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "invoiceId" TEXT        NOT NULL,
  "frequency" TEXT        NOT NULL,
  "nextRun"   TIMESTAMPTZ NOT NULL,
  "active"    BOOLEAN     NOT NULL DEFAULT TRUE,

  CONSTRAINT "RecurringInvoice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "RecurringInvoice_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "RecurringInvoice_invoiceId_key" ON "RecurringInvoice"("invoiceId");

-- ============================================================
-- TABLE: Receivable
-- ============================================================
CREATE TABLE "Receivable" (
  "id"        TEXT               NOT NULL DEFAULT gen_random_uuid()::text,
  "clientId"  TEXT               NOT NULL,
  "invoiceId" TEXT,
  "amount"    DOUBLE PRECISION   NOT NULL,
  "balance"   DOUBLE PRECISION   NOT NULL,
  "dueDate"   TIMESTAMPTZ        NOT NULL,
  "status"    "ReceivableStatus" NOT NULL DEFAULT 'OUTSTANDING',
  "createdAt" TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

  CONSTRAINT "Receivable_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Receivable_clientId_fkey"  FOREIGN KEY ("clientId")  REFERENCES "Client"("id")  ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Receivable_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Receivable_invoiceId_key" ON "Receivable"("invoiceId");

-- ============================================================
-- TABLE: Payable
-- ============================================================
CREATE TABLE "Payable" (
  "id"        TEXT             NOT NULL DEFAULT gen_random_uuid()::text,
  "vendorId"  TEXT             NOT NULL,
  "amount"    DOUBLE PRECISION NOT NULL,
  "balance"   DOUBLE PRECISION NOT NULL,
  "dueDate"   TIMESTAMPTZ      NOT NULL,
  "status"    "PayableStatus"  NOT NULL DEFAULT 'OUTSTANDING',
  "createdAt" TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

  CONSTRAINT "Payable_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Payable_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- TABLE: Notification
-- ============================================================
CREATE TABLE "Notification" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "type"      TEXT        NOT NULL,
  "recipient" TEXT        NOT NULL,
  "message"   TEXT        NOT NULL,
  "status"    TEXT        NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- TABLE: AuditLog
-- ============================================================
CREATE TABLE "AuditLog" (
  "id"        TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"    TEXT        NOT NULL,
  "action"    TEXT        NOT NULL,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- Prisma Migrations Table (required for prisma to work)
-- ============================================================
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  "id"                  TEXT        NOT NULL,
  "checksum"            TEXT        NOT NULL,
  "finished_at"         TIMESTAMPTZ,
  "migration_name"      TEXT        NOT NULL,
  "logs"                TEXT,
  "rolled_back_at"      TIMESTAMPTZ,
  "started_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "applied_steps_count" INTEGER     NOT NULL DEFAULT 0,

  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- DONE! All tables created successfully.
-- ============================================================
