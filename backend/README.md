# ⚙️ ReachInbox Email Scheduler — Backend Service

Production-grade, highly scalable backend API and BullMQ worker service built with Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, BullMQ, Redis, Elasticsearch, Nodemailer (Ethereal SMTP), Google OAuth, and Slack Web API.

---

## 🛠️ Tech Stack & Services

- **Runtime**: Node.js (TypeScript)
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Queueing Engine**: BullMQ + Redis (Strictly No Cron)
- **Search Engine**: Elasticsearch
- **Email Delivery**: Nodemailer + Ethereal SMTP
- **Monitoring**: Bull Board (`/admin/queues`)
- **Deployment**: Render Web Service + Render Background Worker Service

---

## ⚙️ Local Development Setup

### Prerequisites
- Local PostgreSQL (`localhost:5432`)
- Local Redis (`localhost:6379`)
- Local Elasticsearch (`localhost:9200`)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and fill in your local credentials:
```bash
cp .env.example .env
```

### Step 3: Run Database Migrations & Seed
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Step 4: Run Backend Services
```bash
# Terminal 1: Run Express REST API (Port 5000)
npm run dev

# Terminal 2: Run BullMQ Background Worker
npm run worker
```

---

## 🧪 Testing

```bash
# Run Jest unit & integration tests
npm test
```

---

## 🚀 Deployment to Render

This repository contains a ready-to-use [`render.yaml`](./render.yaml) blueprint:
1. Push `backend/` to a Git repository.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New** -> **Blueprint**.
3. Render will provision 2 services:
   - **`reachinbox-backend-api`** (Web Service: `npm run start`)
   - **`reachinbox-email-worker`** (Background Worker: `npm run worker`)
