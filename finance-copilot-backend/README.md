# Finance Copilot & GST Invoicing Backend

This is the production-ready REST API backend for the **Finance Copilot & GST Invoicing SaaS Platform**. Built with **Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, Redis, JWT, and S3 Storage**.

---

## 🛠️ Stack & Technologies
- **Runtime & Language**: Node.js & TypeScript
- **Framework**: Express.js
- **Database (ORM)**: PostgreSQL with Prisma ORM
- **Cache Store**: Redis Cache Client
- **Authentication**: JWT (Access Tokens + secure Refresh Token cookies)
- **API Spec**: Swagger UI & OpenAPI 3.0 Documentation
- **Integrations**: AWS S3 (Receipts upload), Twilio WhatsApp API, Nodemailer, Telegram Bots

---

## 📂 Architecture Layout
We implement a **Clean Architecture/Service-Repository** boundary pattern:
- **Controllers** (`src/controllers/`): Receives requests, maps inputs using Zod validators, and formats API JSON responses.
- **Services** (`src/services/`): Handles core business logic, calculations, caches, S3 uploads, and notification dispatches.
- **Repositories** (`src/repositories/`): Handles DB select/insert scripts via the Prisma Client.
- **Utils & Helpers** (`src/utils/`): Handles GST math algorithms, printable plain text invoice layout buffers, and notifications template.

---

## 🚀 Setup & Execution

### 1. Configure Environment variables
Duplicate the `.env` template or write values inside a new `.env` file:
```bash
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_copilot?schema=public"
REDIS_URL="redis://localhost:6379"
```

### 2. Install Packages
```bash
npm install
```

### 3. Generate Database Client & Migrations
Create your database schema using Prisma:
```bash
npx prisma generate
npx prisma db push
```

### 4. Load Mock Seed Data
Load sample clients, registered GST numbers, transactions, and admin credentials (`admin@demo.com` / `password123`):
```bash
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:5000/docs](http://localhost:5000/docs)** to test the REST APIs using the interactive Swagger UI panel.

---

## 🐋 Run with Docker Compose
To boot up the complete Postgres database, Redis cache cluster, and Node backend containers automatically:
```bash
docker-compose up --build
```
The services will be exposed at:
- **API Server & Swagger**: [http://localhost:5000/docs](http://localhost:5000/docs)
- **Postgres Database**: Port 5432
- **Redis Cache**: Port 6379
