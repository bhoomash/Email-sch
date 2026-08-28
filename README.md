# 🚀 ReachInbox Full-Stack Email Job Scheduler

Production-grade, highly scalable email job scheduling platform built with Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, BullMQ, Redis, Elasticsearch, Nodemailer (Ethereal SMTP), Google OAuth, Slack OAuth, React, and Tailwind CSS.

---

## 🏗️ ASCII System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                             React Frontend                             │
│       Vite + TypeScript + Tailwind CSS + Lucide Icons + TanStack       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST APIs
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             Express Backend                            │
│        Routes ──► Controllers ──► Services ──► Prisma ORM             │
└───────┬───────────────────────────┬────────────────────────────┬───────┘
        │                           │                            │
        ▼                           ▼                            ▼
┌───────────────┐           ┌───────────────┐           ┌────────────────┐
│  PostgreSQL   │           │     Redis     │           │ Elasticsearch  │
│  (Database)   │           │ (BullMQ Queue │           │ (Email Search  │
│               │           │ + Rate Limit) │           │     Index)     │
└───────────────┘           └───────┬───────┘           └────────────────┘
                                    │ Job Dispatch
                                    ▼
                            ┌───────────────┐
                            │ BullMQ Worker │
                            │ (Concurrency) │
                            └───────┬───────┘
                                    │ Send Mail
                                    ▼
                            ┌───────────────┐
                            │ Ethereal SMTP │
                            └───────────────┘
```

---

## 🌟 Key Features

- **Strictly No Cron Jobs**: All scheduling is handled natively via BullMQ delayed jobs backed by Redis persistent storage.
- **Restart-Safe Scheduling**: Server restarts do NOT lose or duplicate scheduled emails. Jobs resume seamlessly from Redis.
- **Distributed Hourly Rate Limiting**: Per-sender atomic Redis counters (`INCR`) enforce custom or max hourly send limits.
- **Next Available Hour Rescheduling**: Emails exceeding hourly sender limits are automatically deferred to the next hour window (`YYYY-MM-DD HH:00:00`) without data loss.
- **Per-Sender Minimum Delay**: Guaranteed minimum spacing between emails (`MIN_SEND_DELAY_MS`, default 2000ms) enforced across concurrent worker instances using Redis coordination.
- **Strong Idempotency**: Deterministic job IDs (`email-{emailId}`) and DB status tracking prevent duplicate email dispatches.
- **Real Slack OAuth & Alerts**: Automatically sends real Slack notifications when a sender reaches their hourly rate limit.
- **Elasticsearch Powered Search**: Instant multi-field text search (`recipient`, `subject`, `body`, `status`) strictly scoped to the authenticated user.
- **Bull Board Queue Monitoring**: Real-time monitoring UI mounted at `/admin/queues`.
- **Intelligent CSV Upload**: Auto-detects email columns, strips invalid syntax, removes duplicates, and provides real-time counts before scheduling.
- **Ethereal SMTP Integration**: Real email sending via Nodemailer with web preview links logged in worker output.

---

## 🛠️ Mandatory Tech Stack

- **Backend**: Node.js, TypeScript, Express.js, Prisma ORM, PostgreSQL, BullMQ, Redis, Elasticsearch, Nodemailer, Passport.js, Slack Web API, Zod, Pino.
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Lucide Icons, Axios.
- **Infrastructure**: Docker Compose (PostgreSQL 15, Redis 7, Elasticsearch 8.11).

---

## 📦 Installation & Setup

### Prerequisites
- Node.js >= 18
- Docker Desktop / Docker Compose

### Step 1: Clone Repository & Install Dependencies
```bash
git clone <repository-url>
cd reachinbox-email-scheduler

# Install root & workspace dependencies
npm install
```

### Step 2: Launch Docker Infrastructure
```bash
docker compose up -d
```
This starts PostgreSQL (`5432`), Redis (`6379`), and Elasticsearch (`9200`) with persistent Docker volumes.

### Step 3: Run Database Migrations & Seed Data
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

---

## 🔑 Environment Variables

The system relies on `.env` (copied from `.env.example`).

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend HTTP API port | `5000` |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/reachinbox` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `ELASTICSEARCH_URL` | Elasticsearch cluster URL | `http://localhost:9200` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `""` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `""` |
| `GOOGLE_CALLBACK_URL` | Google OAuth redirect callback | `http://localhost:5000/api/auth/google/callback` |
| `FRONTEND_URL` | React frontend URL | `http://localhost:5173` |
| `WORKER_CONCURRENCY` | Max worker concurrent jobs | `10` |
| `MIN_SEND_DELAY_MS` | Min delay between sends (ms) | `2000` |
| `MAX_EMAILS_PER_HOUR_PER_SENDER` | Max hourly send limit per sender | `50` |
| `DEV_AUTH_MODE` | Developer test auth mode | `true` |

---

## 🏃 Running the Application

In root directory:

```bash
# Start both Backend API and React Frontend concurrently
npm run dev
```

Or run services individually:

```bash
# Terminal 1: Backend API
npm --prefix backend run dev

# Terminal 2: BullMQ Worker Process
npm --prefix backend run worker

# Terminal 3: React Frontend
npm --prefix frontend run dev
```

Access Points:
- **Frontend Dashboard**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5000/api`
- **Bull Board Queue UI**: `http://localhost:5000/admin/queues`
- **Elasticsearch Cluster**: `http://localhost:9200`

---

## ⚡ Technical Deep Dives

### 1. Scheduling Architecture (Strictly No Cron)
When a campaign is created via `POST /api/campaigns/schedule`:
1. PostgreSQL stores the campaign and initial `Email` records with `SCHEDULED` status inside a database transaction.
2. Initial send timestamps are spaced out by `delayMs` for each recipient.
3. For every email, a BullMQ delayed job is enqueued with `delay = Math.max(0, scheduledAt - Date.now())`.
4. Job IDs use a deterministic format `email-{emailId}`.

### 2. Restart Persistence
Redis volumes (`redis_data`) persist all BullMQ delayed jobs. When the backend or worker restarts:
- BullMQ automatically resumes pending delayed timers directly from Redis.
- Jobs execute strictly at their specified timestamp without duplicating or dropping jobs.

### 3. Distributed Rate Limiting & Next Hour Rescheduling
Before sending an email, the worker invokes `RateLimitService`:
- Increments Redis atomic counter `email-rate:{senderId}:{YYYYMMDDHH}` using `INCR`.
- If `count > limit`:
  - Reschedules BullMQ job for `nextHourStart` (`YYYY-MM-DD (HH+1):00:00`).
  - Sets DB status to `RATE_LIMITED` then `SCHEDULED`.
  - Dispatches a real Slack notification via `@slack/web-api` (guaranteed max 1 notice per hour window using Redis `NX` lock).

### 4. Idempotency Guarantee
To prevent duplicate emails in distributed systems:
1. Deterministic job IDs (`email-{emailId}`) prevent duplicate job creation in Redis.
2. Worker checks PostgreSQL status before sending: if status is `SENT`, it exits cleanly.
3. Database `bullJobId` constraint guarantees unique mapping.

---

## 🧪 Testing

```bash
# Run unit & integration tests
npm --prefix backend test
```

---

## 🎬 Step-by-Step Demo Scenario

1. Open `http://localhost:5173` and log in via Google OAuth or Dev Mode.
2. Click **Connect Slack** or **Dev Connect** to link a workspace.
3. Click **+ Compose New Email**.
4. Upload a CSV file containing 10 recipient email addresses.
5. Verify the badge: `10 valid email addresses detected`.
6. Set **Delay = 2000ms** and **Hourly Limit = 5**.
7. Click **Schedule Emails**.
8. Open **Bull Board** at `http://localhost:5000/admin/queues` to observe delayed jobs.
9. Check worker terminal logs to see Ethereal SMTP preview links.
10. Stop and restart the backend server; observe pending jobs resume cleanly without duplication.
#   E m a i l - s c h  
 