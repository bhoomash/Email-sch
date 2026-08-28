# 🚀 BUILD COMPLETE PROJECT — REACHINBOX FULL-STACK EMAIL JOB SCHEDULER

You are a senior full-stack engineer and system architect.

Build a complete, production-style full-stack application based on the following hiring assignment.

The application is a miniature version of an email scheduling system similar to ReachInbox.

Do NOT create a toy/demo CRUD application.

The implementation must demonstrate:

- Production-quality backend architecture
- Persistent email scheduling
- BullMQ + Redis
- PostgreSQL
- Prisma ORM
- Elasticsearch
- Ethereal SMTP
- Configurable concurrency
- Configurable per-sender hourly rate limiting
- Minimum delay between emails
- Idempotent email processing
- Restart-safe scheduling
- Google OAuth
- Slack OAuth
- Real Slack notifications when rate limits are reached
- Bull Board queue monitoring
- React + TypeScript dashboard
- Tailwind CSS
- Docker Compose
- Proper error handling
- Validation
- Logging
- Tests
- Complete README

Do NOT use cron jobs anywhere.

---

# 1. PROJECT GOAL

Create an application called:

ReachInbox Email Scheduler

The system must allow an authenticated user to:

1. Login using Google OAuth.
2. View a dashboard.
3. Connect a Slack workspace.
4. Compose an email campaign.
5. Upload a CSV containing recipient email addresses.
6. Configure:
   - Subject
   - Body
   - Start time
   - Delay between emails
   - Hourly email limit
7. Schedule the campaign.
8. View scheduled emails.
9. View sent emails.
10. Search emails using Elasticsearch.
11. Receive a real Slack notification when an hourly sender limit is reached.
12. Monitor BullMQ using Bull Board.

The backend must continue processing scheduled jobs correctly after restarting.

---

# 2. MANDATORY TECHNOLOGY STACK

## Backend

Use:

- Node.js
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- BullMQ
- Redis
- Elasticsearch
- Nodemailer
- Ethereal Email
- Passport.js or another proper Google OAuth implementation
- Slack OAuth
- Zod for validation
- Pino or Winston for logging

Do not use JavaScript for backend source files.

All backend source files must use `.ts`.

---

# 3. FRONTEND

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- Zod
- TanStack Query if useful
- Lucide React icons

Build reusable components.

Do not put everything inside one huge component.

---

# 4. INFRASTRUCTURE

Use Docker Compose for:

- PostgreSQL
- Redis
- Elasticsearch

The application itself can run locally using npm scripts, but Docker support should be clean and documented.

Docker services:

```text
postgres
redis
elasticsearch
```

Use persistent Docker volumes.

---

# 5. FINAL PROJECT STRUCTURE

Create this structure:

```text
reachinbox-email-scheduler/
│
├── README.md
├── docker-compose.yml
├── .gitignore
├── .env.example
├── package.json
├── docker/
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       │
│       ├── config/
│       │   ├── env.ts
│       │   ├── database.ts
│       │   ├── redis.ts
│       │   └── elasticsearch.ts
│       │
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── email.controller.ts
│       │   ├── campaign.controller.ts
│       │   ├── slack.controller.ts
│       │   └── health.controller.ts
│       │
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── email.routes.ts
│       │   ├── campaign.routes.ts
│       │   ├── slack.routes.ts
│       │   └── health.routes.ts
│       │
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── email.service.ts
│       │   ├── campaign.service.ts
│       │   ├── scheduler.service.ts
│       │   ├── rate-limit.service.ts
│       │   ├── slack.service.ts
│       │   ├── search.service.ts
│       │   └── smtp.service.ts
│       │
│       ├── queues/
│       │   ├── email.queue.ts
│       │   ├── email.worker.ts
│       │   └── queue.types.ts
│       │
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── error.middleware.ts
│       │   └── not-found.middleware.ts
│       │
│       ├── validators/
│       │   ├── email.validator.ts
│       │   ├── campaign.validator.ts
│       │   └── auth.validator.ts
│       │
│       ├── utils/
│       │   ├── logger.ts
│       │   ├── csv.parser.ts
│       │   ├── errors.ts
│       │   └── idempotency.ts
│       │
│       └── types/
│           └── express.d.ts
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    │
    └── src/
        ├── main.tsx
        ├── App.tsx
        │
        ├── pages/
        │   ├── Login.tsx
        │   └── Dashboard.tsx
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Header.tsx
        │   │   └── DashboardLayout.tsx
        │   │
        │   ├── email/
        │   │   ├── ComposeEmailModal.tsx
        │   │   ├── ScheduledEmailsTable.tsx
        │   │   ├── SentEmailsTable.tsx
        │   │   └── EmailStatusBadge.tsx
        │   │
        │   ├── slack/
        │   │   └── SlackConnection.tsx
        │   │
        │   └── ui/
        │       ├── Button.tsx
        │       ├── Input.tsx
        │       ├── Modal.tsx
        │       ├── Table.tsx
        │       ├── Spinner.tsx
        │       ├── EmptyState.tsx
        │       └── Toast.tsx
        │
        ├── services/
        │   └── api.ts
        │
        ├── hooks/
        │   ├── useAuth.ts
        │   ├── useEmails.ts
        │   └── useCampaigns.ts
        │
        ├── types/
        │   ├── auth.ts
        │   ├── email.ts
        │   └── campaign.ts
        │
        └── utils/
            └── csv.ts
```

Adapt this structure if necessary, but preserve clean separation of concerns.

---

# 6. POSTGRESQL DATABASE

Use PostgreSQL with Prisma.

Database name:

```text
reachinbox
```

Environment:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reachinbox
```

Create these models.

## User

Fields:

```text
id
googleId
name
email
avatar
createdAt
updatedAt
```

Requirements:

- `id` UUID
- `googleId` unique
- `email` unique

---

## Sender

Fields:

```text
id
userId
email
smtpHost
smtpPort
smtpUser
smtpPassword
createdAt
updatedAt
```

Relations:

```text
User 1 -> many Sender
Sender 1 -> many Email
```

The SMTP credentials should be configurable.

Do not expose SMTP passwords through APIs.

---

## Campaign

Fields:

```text
id
userId
senderId
subject
body
startTime
delayMs
hourlyLimit
createdAt
updatedAt
```

Relations:

```text
User 1 -> many Campaign
Sender 1 -> many Campaign
Campaign 1 -> many Email
```

---

## Email

Fields:

```text
id
campaignId
senderId
recipient
subject
body
scheduledAt
sentAt
status
attempts
bullJobId
messageId
errorMessage
createdAt
updatedAt
```

Status enum:

```text
SCHEDULED
PROCESSING
SENT
FAILED
RATE_LIMITED
```

Important:

```text
bullJobId
```

must be unique.

Use this for idempotency.

---

## SlackConnection

Fields:

```text
id
userId
accessToken
teamId
teamName
createdAt
updatedAt
```

One user can have one active Slack connection.

Never expose `accessToken` to the frontend.

---

# 7. DATABASE INDEXES

Create indexes for:

```text
Email.recipient
Email.status
Email.scheduledAt
Email.sentAt
Email.senderId
Email.campaignId
Campaign.userId
Sender.userId
```

Use proper PostgreSQL indexes.

---

# 8. ENVIRONMENT VARIABLES

Create:

```env
NODE_ENV=development

PORT=5000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reachinbox

REDIS_HOST=localhost
REDIS_PORT=6379

ELASTICSEARCH_URL=http://localhost:9200

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

FRONTEND_URL=http://localhost:5173

SESSION_SECRET=

ETHEREAL_HOST=smtp.ethereal.email
ETHEREAL_PORT=587
ETHEREAL_USER=
ETHEREAL_PASSWORD=

WORKER_CONCURRENCY=10

MIN_SEND_DELAY_MS=2000

MAX_EMAILS_PER_HOUR_PER_SENDER=50

SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=http://localhost:5000/api/slack/callback

LOG_LEVEL=info
```

Never hardcode secrets.

Create `.env.example` containing all variables but no real credentials.

---

# 9. GOOGLE AUTHENTICATION

Implement REAL Google OAuth.

Do NOT create fake login.

Flow:

```text
Frontend
   ↓
Login with Google
   ↓
Backend /api/auth/google
   ↓
Google OAuth
   ↓
/api/auth/google/callback
   ↓
Find/create user
   ↓
Create secure session
   ↓
Redirect to frontend dashboard
```

After authentication the frontend must display:

```text
Name
Email
Avatar
Logout
```

Implement:

```http
GET /api/auth/google
GET /api/auth/google/callback
GET /api/auth/me
POST /api/auth/logout
```

Protect dashboard APIs using authentication middleware.

Do not send Google client secret to frontend.

---

# 10. SESSION / AUTH SECURITY

Use secure HTTP-only cookies.

Do not store authentication tokens in localStorage if avoidable.

Configure:

```text
httpOnly
secure in production
sameSite
```

Implement authentication middleware.

Unauthenticated requests to protected APIs should return:

```json
{
  "success": false,
  "message": "Authentication required"
}
```

with HTTP 401.

---

# 11. EMAIL SCHEDULING API

Implement:

```http
POST /api/campaigns/schedule
```

Request should support:

```json
{
  "senderId": "uuid",
  "subject": "Welcome",
  "body": "Hello!",
  "startTime": "2026-08-28T15:00:00.000Z",
  "delayMs": 2000,
  "hourlyLimit": 50,
  "recipients": [
    "one@example.com",
    "two@example.com"
  ]
}
```

Also support CSV upload through a multipart endpoint if appropriate.

Validate:

- valid sender
- valid email addresses
- non-empty subject
- non-empty body
- start time
- delay >= configured minimum
- hourly limit > 0

---

# 12. CSV UPLOAD

Frontend must allow:

```text
Upload CSV
```

Example:

```csv
email
john@example.com
alice@example.com
bob@example.com
```

Also handle CSVs where email is in another column.

Detect email addresses intelligently.

Remove:

- duplicates
- empty values
- invalid addresses

Display:

```text
127 email addresses detected
```

before scheduling.

Do not trust frontend validation.

Backend must validate again.

Limit upload size.

---

# 13. BULLMQ ARCHITECTURE

Use:

```text
BullMQ
Redis
```

Create:

```text
emailQueue
emailWorker
```

Do NOT use:

```text
node-cron
cron
agenda
setInterval as scheduler
setTimeout as scheduler
```

Scheduling must be based on BullMQ delayed jobs.

---

# 14. BULLMQ JOB DESIGN

Each email should have its own BullMQ job.

Job data:

```typescript
{
  emailId: string;
  campaignId: string;
  senderId: string;
}
```

Use deterministic job IDs:

```text
email-{emailId}
```

This is critical for idempotency.

Do not create duplicate jobs for the same email.

---

# 15. SCHEDULING ALGORITHM

When a campaign is scheduled:

For recipients:

```text
recipient 1
recipient 2
recipient 3
...
```

calculate initial scheduled times.

Example:

```text
startTime = 15:00:00
delay = 2000ms
```

Then:

```text
email 1 -> 15:00:00
email 2 -> 15:00:02
email 3 -> 15:00:04
email 4 -> 15:00:06
```

But hourly limits must ALSO be enforced by the worker.

Do not depend only on the initial calculation.

---

# 16. MULTIPLE SENDERS

The application must support multiple senders.

Each sender can have a different:

```text
email
SMTP configuration
hourly limit
```

Rate limiting should preferably be per sender.

Example:

```text
sender-A → 50/hour
sender-B → 50/hour
```

Sender A reaching its limit must NOT block sender B.

---

# 17. WORKER CONCURRENCY

Worker concurrency must be configurable:

```env
WORKER_CONCURRENCY=10
```

Use BullMQ worker concurrency.

Example concept:

```text
10 jobs can be processed concurrently.
```

Do not assume one worker only.

Design the code so multiple worker instances can safely run.

---

# 18. MINIMUM DELAY BETWEEN EMAILS

Support:

```env
MIN_SEND_DELAY_MS=2000
```

Default:

```text
2 seconds
```

The actual delay should be enforced safely even when multiple workers are running.

Do NOT rely only on:

```typescript
await sleep(2000)
```

because that is not safe for distributed workers.

Use Redis-backed coordination / rate control.

Document this design in README.

---

# 19. HOURLY RATE LIMIT

Implement per-sender hourly limits.

Environment default:

```env
MAX_EMAILS_PER_HOUR_PER_SENDER=50
```

The campaign may specify an hourly limit, but enforce reasonable configured maximums.

Use Redis.

Example Redis key:

```text
email-rate:{senderId}:{YYYYMMDDHH}
```

The increment operation must be atomic.

Do NOT use:

```typescript
let count = 0;
```

in memory.

Multiple workers must share the same rate-limit state.

---

# 20. RATE LIMIT ALGORITHM

Before sending an email:

1. Determine sender.
2. Determine current hour window.
3. Atomically check/increment Redis counter.
4. If under limit:
   - reserve send slot
   - send email
5. If limit reached:
   - do NOT fail permanently
   - calculate next hour
   - reschedule BullMQ job
   - update email status
   - send Slack notification

Use Redis Lua script or another atomic approach where appropriate.

Avoid race conditions.

---

# 21. NEXT AVAILABLE HOUR

If:

```text
hourly limit = 50
```

and 50 emails already sent in the current hour:

The next email should be rescheduled to:

```text
next hour window
```

Example:

```text
Current:
14:00 - 14:59 → full

Next:
15:00
```

Preserve ordering as much as practical.

Do not drop the email.

Do not permanently fail it.

---

# 22. SLACK NOTIFICATION

Implement REAL Slack OAuth.

Frontend button:

```text
Connect Slack
```

Flow:

```text
Dashboard
   ↓
Connect Slack
   ↓
Backend
   ↓
Slack OAuth
   ↓
User authorizes workspace
   ↓
Slack callback
   ↓
Backend stores token
```

Implement:

```http
GET /api/slack/connect
GET /api/slack/callback
GET /api/slack/status
DELETE /api/slack/disconnect
```

Store:

```text
accessToken
teamId
teamName
userId
```

Never expose access tokens.

---

# 23. SLACK RATE LIMIT NOTIFICATION

When a sender hits its hourly limit, immediately send a real Slack message.

Example:

```text
⚠️ Email Rate Limit Reached

Sender: outreach@example.com
Hourly Limit: 50
Current Window: 14:00 - 15:00
Additional emails have been rescheduled for the next available hour.
```

This must be an actual Slack API call.

Do NOT just:

```text
console.log()
```

If Slack is not connected:

```text
Do nothing
```

Do not crash.

If Slack is connected later:

```text
notifications should work without redeploying.
```

Avoid duplicate notifications for the same sender/hour window.

Use a Redis notification key such as:

```text
slack-rate-limit-notified:{senderId}:{hourWindow}
```

with atomic set semantics.

---

# 24. ETHEREAL EMAIL

Use Nodemailer with Ethereal SMTP.

Configuration:

```env
ETHEREAL_HOST=smtp.ethereal.email
ETHEREAL_PORT=587
ETHEREAL_USER=
ETHEREAL_PASSWORD=
```

Create a reusable SMTP service.

Do not create a new SMTP connection unnecessarily for every email.

Use Nodemailer transport pooling if appropriate.

After sending:

```text
messageId
```

must be stored in PostgreSQL.

Also log Ethereal preview URL when available.

---

# 25. EMAIL WORKER FLOW

Worker should roughly perform:

```text
BullMQ job
   ↓
Load email from PostgreSQL
   ↓
Check current status
   ↓
If SENT → return safely
   ↓
Acquire distributed processing/idempotency protection
   ↓
Check hourly rate limit
   ↓
If rate limited:
      reschedule job
      update status
      notify Slack
      return
   ↓
Send through Ethereal
   ↓
Save messageId
   ↓
Set status SENT
   ↓
Set sentAt
   ↓
Index in Elasticsearch
```

If sending fails:

```text
attempt++
```

Use BullMQ retry/backoff.

Do not immediately permanently fail transient SMTP errors.

---

# 26. IDEMPOTENCY

This is mandatory.

The same email must never intentionally be sent twice.

Use multiple protection layers:

1. Unique `Email.bullJobId`.
2. Deterministic BullMQ job ID.
3. PostgreSQL status.
4. Worker checks status before processing.
5. Distributed lock where appropriate.
6. Avoid creating duplicate scheduling jobs.

Important:

SMTP sending and DB transactions cannot be perfectly atomic.

Document this distributed-system limitation honestly in README.

Implement the strongest practical idempotency possible for this assignment.

---

# 27. SERVER RESTART REQUIREMENT

This is one of the most important requirements.

Scenario:

```text
10 emails scheduled
```

Then:

```text
server stopped
```

Then:

```text
server started
```

Expected:

```text
future jobs remain in Redis/BullMQ
```

and are eventually processed.

Do NOT rebuild all jobs from scratch blindly on startup.

Do NOT duplicate existing jobs.

Redis must use persistent storage in Docker.

PostgreSQL must use a persistent volume.

BullMQ delayed jobs must survive backend restart.

---

# 28. STARTUP RECOVERY

On backend startup:

1. Connect to PostgreSQL.
2. Connect to Redis.
3. Connect to Elasticsearch.
4. Initialize BullMQ.
5. Start worker.
6. Verify queue health.
7. Do NOT blindly recreate all jobs.

Optionally implement a safe reconciliation process for database records in:

```text
SCHEDULED
PROCESSING
RATE_LIMITED
```

But reconciliation must be idempotent.

Never create duplicate jobs.

---

# 29. ELASTICSEARCH

All scheduled and sent emails must be searchable.

Create an Elasticsearch index:

```text
emails
```

Index fields:

```text
id
campaignId
senderId
recipient
subject
body
status
scheduledAt
sentAt
createdAt
```

Use appropriate mappings.

At minimum support searching:

```text
recipient
subject
body
status
```

Example:

```http
GET /api/emails/search?q=john
```

Return matching emails.

Do not make Elasticsearch the source of truth.

PostgreSQL remains the source of truth.

Elasticsearch is the search index.

---

# 30. ELASTICSEARCH INDEXING FLOW

When email is created:

```text
PostgreSQL
   ↓
Elasticsearch index
```

When status changes:

```text
SCHEDULED → SENT
```

update Elasticsearch.

If Elasticsearch is temporarily unavailable:

- email sending must NOT fail because of search indexing
- log the indexing failure
- provide a safe retry/reconciliation strategy

Database is authoritative.

---

# 31. BULL BOARD

Expose Bull Board.

Route:

```text
/admin/queues
```

Use Bull Board with BullMQ adapter.

Show:

```text
Waiting
Active
Completed
Failed
Delayed
```

Protect Bull Board behind authentication in production.

For local development, allow access after authentication or document the development configuration.

---

# 32. HEALTH API

Implement:

```http
GET /api/health
```

Return health of:

```text
API
PostgreSQL
Redis
Elasticsearch
BullMQ
```

Example:

```json
{
  "status": "ok",
  "services": {
    "database": "up",
    "redis": "up",
    "elasticsearch": "up",
    "queue": "up"
  }
}
```

Return an appropriate non-2xx status if critical dependencies are unavailable.

---

# 33. EMAIL APIs

Implement:

```http
GET /api/emails/scheduled
```

Return authenticated user's scheduled emails.

Support pagination.

Example:

```text
?page=1&limit=20
```

---

Implement:

```http
GET /api/emails/sent
```

Return sent/failed emails.

Support pagination.

---

Implement:

```http
GET /api/emails/search?q=
```

Use Elasticsearch.

---

Implement:

```http
GET /api/emails/:id
```

Return one email.

Never allow one user to access another user's email.

---

# 34. CAMPAIGN APIs

Implement:

```http
POST /api/campaigns/schedule
GET /api/campaigns
GET /api/campaigns/:id
```

Optionally:

```http
DELETE /api/campaigns/:id
```

Only allow deletion/cancellation where it is safe.

Do not delete already-sent emails accidentally.

---

# 35. SENDER APIs

Implement:

```http
GET /api/senders
POST /api/senders
DELETE /api/senders/:id
```

Allow multiple Ethereal senders.

Validate ownership.

---

# 36. FRONTEND LOGIN PAGE

Create a polished login page inspired by the provided Figma.

Use:

```text
ReachInbox
```

Branding.

Main CTA:

```text
Continue with Google
```

Do not create fake email/password authentication.

Use the actual Google OAuth backend route.

---

# 37. DASHBOARD UI

After login:

```text
┌─────────────────────────────────────────────────────────────┐
│ ReachInbox                                User   Avatar      │
│ Email Scheduler                               Logout        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Scheduled Emails       Sent Emails                          │
│                                                             │
│                                      + Compose New Email     │
│                                                             │
│ Search emails...                                           │
│                                                             │
│ Email       Subject       Time              Status           │
│ ----------------------------------------------------------- │
│ john@...    Welcome       Aug 28 3:00 PM    Scheduled        │
│ alex@...    Welcome       Aug 28 3:02 PM    Scheduled        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Follow the provided Figma design as closely as practical.

Figma:

```text
https://www.figma.com/design/kOTwGlESjijCYnMgtHfvfU/Outbox-Labs-Assignment?node-id=59-4050&p=f&m=dev
```

If Figma cannot be accessed programmatically, reproduce the visible design language from the assignment:

- clean
- professional
- minimal
- modern
- good spacing
- clear tables
- clear typography
- responsive
- no unnecessary animations

---

# 38. HEADER

Show:

```text
User name
User email
Avatar
Logout
```

Add:

```text
Slack: Connected / Not Connected
```

with:

```text
Connect Slack
```

or:

```text
Disconnect Slack
```

---

# 39. COMPOSE EMAIL MODAL

Create:

```text
Compose New Email
```

Fields:

```text
Sender
Subject
Body
CSV Upload
Start Time
Delay Between Emails
Hourly Limit
```

Display:

```text
127 email addresses detected
```

After upload.

Button:

```text
Schedule Emails
```

Show loading state while scheduling.

Prevent double submission.

---

# 40. EMAIL BODY

Use a textarea.

Allow normal text.

Do not implement dangerous arbitrary HTML execution.

If HTML emails are supported, sanitize content properly.

Plain text is acceptable.

---

# 41. SCHEDULED EMAIL TABLE

Columns:

```text
Email
Subject
Scheduled Time
Status
```

Statuses:

```text
Scheduled
Processing
Rate Limited
```

Use clear badges.

Include:

```text
Loading state
Empty state
Error state
Pagination
```

---

# 42. SENT EMAIL TABLE

Columns:

```text
Email
Subject
Sent Time
Status
```

Status:

```text
Sent
Failed
```

Include:

```text
Loading
Empty
Error
Pagination
```

---

# 43. SEARCH

Add dashboard search.

Search should use backend Elasticsearch endpoint:

```http
GET /api/emails/search?q=
```

Search:

```text
recipient
subject
body
status
```

Debounce frontend search requests.

Show:

```text
Searching...
```

and:

```text
No results found
```

---

# 44. FRONTEND ERROR HANDLING

Handle:

```text
401
400
404
409
429
500
```

Show friendly toast/error messages.

Do not show raw stack traces to users.

Example:

```text
Unable to schedule emails. Please try again.
```

---

# 45. FRONTEND RESPONSIVENESS

Support:

```text
Mobile
Tablet
Laptop
Desktop
```

Tables should be usable on mobile.

Modal should be responsive.

Header should adapt.

---

# 46. FRONTEND TYPESCRIPT

Avoid:

```typescript
any
```

unless absolutely unavoidable.

Create interfaces for:

```text
User
Sender
Campaign
Email
Pagination
API response
Slack status
```

Use proper typing for Axios responses.

---

# 47. API RESPONSE FORMAT

Use consistent response format.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Something went wrong",
  "code": "SOME_ERROR"
}
```

For validation:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

---

# 48. SECURITY

Implement:

- Helmet
- CORS
- HTTP-only cookies
- input validation
- request size limits
- CSV upload limits
- rate limiting for public APIs
- authorization checks
- secure secrets
- no sensitive data in logs

Never return:

```text
SMTP password
Slack access token
Google client secret
session secret
```

---

# 49. LOGGING

Use structured logging.

Log:

```text
server startup
worker startup
job received
job completed
job failed
rate limit reached
email sent
Slack notification sent
Elasticsearch indexing failure
database errors
```

Do NOT log:

```text
passwords
OAuth tokens
SMTP credentials
session secrets
```

---

# 50. RETRIES

BullMQ jobs should support retries for transient failures.

Example:

```text
attempts: 3
backoff: exponential
```

Use sensible values.

Permanent validation errors should not endlessly retry.

SMTP transient failures may retry.

Elasticsearch failures should not cause an email to be resent.

---

# 51. IMPORTANT DISTRIBUTED SYSTEM BEHAVIOR

Design carefully for:

```text
Multiple workers
Multiple backend instances
Concurrent jobs
Server restart
Redis restart
Database restart
Elasticsearch unavailable
SMTP failure
Slack unavailable
Rate limit reached
Duplicate scheduling request
```

The system should fail gracefully.

---

# 52. 1000+ EMAIL LOAD

The system must conceptually support:

```text
1000+ emails scheduled for the same time
```

Do not create:

```text
one massive worker job
```

Create individual BullMQ jobs.

BullMQ controls execution.

Concurrency is configurable.

Rate limiting controls actual sending.

Example:

```env
WORKER_CONCURRENCY=10
MIN_SEND_DELAY_MS=2000
MAX_EMAILS_PER_HOUR_PER_SENDER=50
```

Explain in README that 1000 jobs can remain safely queued while workers process them according to concurrency and provider limits.

---

# 53. RATE LIMIT + DELAY INTERACTION

Correctly handle:

```text
Concurrency = 10
Delay = 2 seconds
Hourly limit = 50
Jobs = 1000
```

The system must not accidentally send 10 emails simultaneously and violate the intended minimum global/per-sender spacing.

Use Redis-backed coordination.

Document whether delay is:

```text
per sender
```

or:

```text
global
```

Prefer per-sender throttling because multiple senders are supported.

---

# 54. NO CRON

This is extremely important.

Search the entire project before completion and make sure there is NO:

```text
node-cron
cron
crontab
agenda
```

Do not implement scheduling using:

```text
setInterval
```

Do not implement the scheduler with an in-memory timer.

BullMQ delayed jobs are the scheduler.

---

# 55. DOCKER COMPOSE

Create:

```text
docker-compose.yml
```

with:

```text
PostgreSQL
Redis
Elasticsearch
```

PostgreSQL:

```text
5432
```

Redis:

```text
6379
```

Elasticsearch:

```text
9200
```

Use persistent volumes.

Configure Elasticsearch memory appropriately for local development.

---

# 56. NPM SCRIPTS

Root scripts should make development easy.

Example:

```text
npm run dev
npm run build
npm run test
npm run lint
npm run format
```

Backend:

```text
npm run dev
npm run build
npm run start
npm run worker
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
```

Frontend:

```text
npm run dev
npm run build
npm run preview
```

---

# 57. PRISMA MIGRATIONS

Use real Prisma migrations.

Do not rely on:

```text
prisma db push
```

as the only database setup mechanism.

README should explain:

```bash
npx prisma migrate dev
npx prisma generate
```

---

# 58. SEED DATA

Create a seed script that can optionally create development sender/user data.

Do not create fake Google authentication.

Seed data is only for development/testing.

---

# 59. TESTING

Add backend tests for at least:

### Unit tests

Test:

```text
CSV email parsing
email validation
rate limit calculation
next-hour calculation
idempotency logic
```

### Integration tests

Test:

```text
schedule campaign
database persistence
BullMQ job creation
email status transitions
```

### Rate limit test

Simulate:

```text
limit = 2
3 emails
```

Expected:

```text
2 send
1 reschedule
```

### Restart behavior test

Document a manual integration test:

```text
Schedule future email
Stop backend
Start backend
Verify email remains scheduled
Verify it eventually sends
```

---

# 60. README

Create a high-quality README.

Include:

# ReachInbox Email Scheduler

## Features

List all implemented features.

## Architecture

Include an ASCII architecture diagram.

## Tech Stack

List:

```text
React
TypeScript
Express
PostgreSQL
Prisma
Redis
BullMQ
Elasticsearch
Ethereal
Slack OAuth
Google OAuth
Docker
Bull Board
```

## Requirements

Explain:

```text
Node.js
Docker
Google OAuth credentials
Slack OAuth credentials
Ethereal credentials
```

## Installation

Example:

```bash
git clone ...
cd reachinbox-email-scheduler

docker compose up -d

cd backend
npm install
npx prisma generate
npx prisma migrate dev

cd ../frontend
npm install
```

## Environment Variables

Document every variable.

## Run

Backend:

```bash
npm run dev
```

Worker:

```bash
npm run worker
```

Frontend:

```bash
npm run dev
```

## Bull Board

Document:

```text
http://localhost:5000/admin/queues
```

## Elasticsearch

Document:

```text
http://localhost:9200
```

## Scheduling Architecture

Explain:

```text
API
 ↓
PostgreSQL
 ↓
BullMQ delayed job
 ↓
Redis
 ↓
Worker
 ↓
Rate limiter
 ↓
Ethereal
 ↓
PostgreSQL + Elasticsearch
```

## Restart Persistence

Explain exactly why scheduled jobs survive backend restart.

## Rate Limiting

Explain:

```text
Redis atomic counters
hour window
per sender
rescheduling
```

## Concurrency

Explain worker concurrency.

## Minimum Delay

Document:

```text
Default = 2 seconds
```

and explain implementation.

## Idempotency

Explain deterministic BullMQ job IDs and DB status.

## Slack Notifications

Explain real Slack OAuth and rate-limit notification behavior.

## Elasticsearch

Explain source of truth vs search index.

## No Cron

Explicitly state:

```text
No cron jobs are used.
BullMQ delayed jobs are responsible for scheduling.
```

## Failure Handling

Explain:

```text
SMTP failures
Redis failures
PostgreSQL failures
Elasticsearch failures
Slack failures
worker crashes
```

## Trade-offs

Explicitly discuss SMTP exactly-once limitations.

---

# 61. DEMO SCENARIO

Make the project easy to demonstrate.

README must contain this demo:

### Step 1

Login using Google.

### Step 2

Connect Slack.

### Step 3

Create a campaign.

Example:

```text
Subject:
ReachInbox Demo

Body:
Hello, this is a test email.

Delay:
2 seconds

Hourly limit:
5
```

Upload:

```text
10 recipients
```

### Step 4

Schedule.

### Step 5

Open:

```text
Scheduled Emails
```

### Step 6

Open Bull Board.

Show delayed jobs.

### Step 7

Wait for processing.

Show:

```text
Sent Emails
```

### Step 8

Open Ethereal preview.

### Step 9

Demonstrate restart.

Stop backend.

Start backend.

Show jobs still exist.

### Step 10

Demonstrate rate limit.

Set:

```env
MAX_EMAILS_PER_HOUR_PER_SENDER=2
```

Schedule:

```text
5 emails
```

Show:

```text
2 sent
3 rescheduled
```

Show Slack notification.

---

# 62. UI QUALITY

Do not build a generic ugly admin panel.

Use:

- clean typography
- consistent spacing
- subtle borders
- professional tables
- responsive layout
- accessible forms
- proper focus states
- loading skeletons/spinners
- empty states
- error states
- confirmation feedback

Avoid excessive animations.

Avoid unnecessary gradients.

Keep the interface close to the provided Figma.

---

# 63. ACCESSIBILITY

Implement:

- semantic HTML
- labels for form fields
- keyboard accessible modal
- visible focus states
- accessible buttons
- appropriate aria labels where required
- sufficient contrast

---

# 64. CODE QUALITY

Follow these rules:

- SOLID principles
- separation of concerns
- DRY
- small functions
- meaningful naming
- no giant controllers
- business logic belongs in services
- database access through Prisma
- queue logic separated from HTTP logic
- validation separated from controllers
- centralized error handling
- typed API responses
- no unnecessary duplication

Controllers should be thin.

Example:

```text
Controller
    ↓
Service
    ↓
Repository / Prisma
```

Queue:

```text
BullMQ Worker
    ↓
Service
    ↓
Prisma / SMTP / Redis / Elasticsearch
```

---

# 65. ERROR HANDLING

Create custom errors:

```text
AppError
ValidationError
NotFoundError
UnauthorizedError
ForbiddenError
ConflictError
```

Use centralized Express error middleware.

Never expose stack traces in production.

---

# 66. GRACEFUL SHUTDOWN

Implement graceful shutdown.

When receiving:

```text
SIGTERM
SIGINT
```

properly close:

```text
HTTP server
BullMQ worker
BullMQ queue
Redis connections
Prisma
Elasticsearch
```

Do not abruptly terminate active work if avoidable.

---

# 67. CONFIG VALIDATION

Validate environment variables at startup.

If a required environment variable is missing:

```text
fail fast
```

with a clear error.

Do not silently continue with undefined secrets.

---

# 68. API SECURITY / AUTHORIZATION

Every user-specific API must ensure:

```text
resource.userId === authenticatedUser.id
```

A user must never be able to:

```text
view another user's campaign
view another user's email
delete another user's sender
access another user's Slack connection
```

---

# 69. SEARCH SECURITY

Elasticsearch searches must be scoped to the authenticated user.

Do NOT expose a global search over all users' emails.

Store `userId` in Elasticsearch documents.

Every search must filter by:

```text
userId
```

---

# 70. DATABASE TRANSACTION

Campaign creation should use a PostgreSQL transaction.

Conceptually:

```text
BEGIN

create campaign

create email records

COMMIT
```

Only after successful DB transaction should jobs be added.

If queue creation fails after DB commit, implement safe reconciliation/retry logic rather than losing records.

Do not pretend PostgreSQL and Redis can participate in one ACID transaction.

Document this trade-off.

---

# 71. SCHEDULING FAILURE RECOVERY

Consider:

```text
DB commit succeeds
BullMQ add fails
```

The campaign must not silently disappear.

Implement a safe mechanism such as:

```text
campaign/email status
```

plus idempotent scheduling/reconciliation.

The reconciliation mechanism must NOT use cron.

If reconciliation is triggered at startup, it must only enqueue missing jobs and must use deterministic job IDs.

---

# 72. EMAIL STATUS LIFECYCLE

Use:

```text
SCHEDULED
    ↓
PROCESSING
    ↓
SENT
```

Failure:

```text
PROCESSING
    ↓
FAILED
```

Rate limit:

```text
SCHEDULED
    ↓
RATE_LIMITED
    ↓
SCHEDULED
```

Do not allow invalid transitions.

---

# 73. FRONTEND API CLIENT

Create a centralized Axios client:

```text
api.ts
```

Configure:

```text
baseURL
credentials
interceptors
```

Handle:

```text
401
```

by redirecting to login when appropriate.

---

# 74. FRONTEND DATA FETCHING

Prefer TanStack Query.

Use:

```text
useQuery
useMutation
```

for:

```text
current user
scheduled emails
sent emails
senders
Slack status
campaign scheduling
```

Invalidate queries after scheduling.

---

# 75. LOADING STATES

Every async operation must have a visible state.

Examples:

```text
Loading emails...
Scheduling...
Connecting Slack...
Logging out...
Uploading CSV...
```

Prevent duplicate actions while requests are active.

---

# 76. EMPTY STATES

Scheduled:

```text
No scheduled emails yet.
Create your first campaign to get started.
```

Sent:

```text
No sent emails yet.
```

Search:

```text
No emails matched your search.
```

---

# 77. CSV UX

After selecting a file:

```text
campaign.csv

127 valid email addresses
3 duplicates removed
2 invalid addresses ignored
```

Display this before scheduling.

---

# 78. PAGINATION

Backend pagination:

```text
page
limit
total
totalPages
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

Frontend should implement pagination controls.

---

# 79. EMAIL DETAIL

Optionally allow clicking an email to see:

```text
Recipient
Sender
Subject
Body
Status
Scheduled time
Sent time
Attempts
Error
Message ID
```

Do not expose sensitive SMTP information.

---

# 80. DO NOT OVERENGINEER

Do not introduce unnecessary:

```text
Kafka
RabbitMQ
Kubernetes
microservices
GraphQL
```

Keep it as a clean modular monolith.

BullMQ + Redis is sufficient for the assignment.

---

# 81. IMPLEMENTATION ORDER

Build in this order:

## Phase 1

Project initialization:

```text
monorepo
backend
frontend
TypeScript
ESLint
Prettier
```

## Phase 2

Infrastructure:

```text
PostgreSQL
Redis
Elasticsearch
Docker Compose
```

## Phase 3

Backend:

```text
Express
Prisma
database schema
migrations
health endpoint
```

## Phase 4

BullMQ:

```text
queue
worker
delayed jobs
persistence
```

## Phase 5

Email:

```text
Ethereal
Nodemailer
sending
status updates
```

## Phase 6

Rate limiting:

```text
Redis atomic counter
per sender
hour window
rescheduling
```

## Phase 7

Elasticsearch:

```text
indexing
search
user filtering
```

## Phase 8

Authentication:

```text
Google OAuth
session
protected APIs
```

## Phase 9

Slack:

```text
Slack OAuth
connection
notification
disconnect/reconnect
```

## Phase 10

Frontend:

```text
login
dashboard
compose
CSV
scheduled table
sent table
search
Slack UI
```

## Phase 11

Testing.

## Phase 12

README.

## Phase 13

Final verification.

---

# 82. FINAL VERIFICATION

Before declaring the project complete, run:

```text
npm install
npm run build
npm run lint
npm run test
```

Run:

```text
docker compose up -d
```

Verify:

```text
PostgreSQL works
Redis works
Elasticsearch works
Backend works
Worker works
Frontend works
Bull Board works
```

Test:

```text
Google OAuth
Slack OAuth
CSV upload
campaign scheduling
delayed jobs
Ethereal sending
rate limiting
concurrency
Elasticsearch search
restart persistence
idempotency
```

---

# 83. AUTOMATED PROJECT CHECK

Search the entire repository for prohibited scheduler implementations.

There must be ZERO usage of:

```text
node-cron
cron
crontab
agenda
```

Also ensure there is no scheduler implementation based on:

```text
setInterval
```

or a long-running in-memory scheduling loop.

BullMQ delayed jobs must be the scheduler.

---

# 84. IMPORTANT IMPLEMENTATION RULE

Do not stop after creating the architecture.

Actually implement the application.

Do not leave:

```text
TODO
```

for required features.

Do not use:

```text
mock Google login
mock Slack notification
mock email sending
mock rate limiting
mock BullMQ
```

The required integrations must actually work.

If credentials are unavailable during development, create clearly documented environment placeholders, but implement the real integration code.

---

# 85. FINAL DELIVERABLE

The final repository must contain:

```text
Working React frontend
Working Express backend
Working PostgreSQL database
Working Prisma schema/migrations
Working Redis
Working BullMQ queue
Working BullMQ worker
Working delayed scheduling
Working concurrency
Working distributed rate limiting
Working email delay
Working Ethereal SMTP
Working Elasticsearch indexing/search
Working Google OAuth
Working Slack OAuth
Working Slack notifications
Working Bull Board
Working restart persistence
Working idempotency
Docker Compose
Tests
README
.env.example
```

Do not merely provide snippets.

Build the complete runnable project.

After implementation, provide a final summary containing:

1. Files created/modified
2. How to start the project
3. Required environment variables
4. API endpoints
5. Architecture summary
6. Rate-limiting strategy
7. Idempotency strategy
8. Restart-persistence strategy
9. Elasticsearch strategy
10. Slack integration flow
11. Google OAuth flow
12. Test results
13. Any genuine limitations/trade-offs

The project must be clean enough to submit as a hiring assignment.