# Backend Development Guide

> **CafeBite** - Node.js / Express / MySQL2 Backend API

---

## Quick Start

```bash
cd backend
npm install
npm run dev          # starts with nodemon + .env
npm run migrate:up   # run pending DB migrations
```

---

## Table of Contents

| # | Guide | What You'll Learn |
|---|-------|-------------------|
| 01 | [Folder Structure](./01-folder-structure.md) | Where every file lives and why |
| 02 | [Module Development](./02-module-development.md) | Step-by-step: create a new feature module |
| 03 | [Code Patterns](./03-code-patterns.md) | Layer responsibilities, naming conventions, import rules |
| 04 | [Middleware](./04-middleware.md) | Auth, subscription, validation middleware usage |
| 05 | [Database](./05-database.md) | Query patterns, transactions, migrations, providers |
| 06 | [Error Handling](./06-error-handling.md) | HttpError, error codes, response format |
| 07 | [Authentication](./07-authentication.md) | JWT dual-token flow, sessions, cookie management |
| 08 | [API Conventions](./08-api-conventions.md) | RESTful routes, HTTP status codes, response format |
| 09 | [Testing](./09-testing.md) | Test structure, patterns, checklist |
| 10 | [Troubleshooting](./10-troubleshooting.md) | Common issues and fixes |

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT REQUEST                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  app.js  (Express app - CORS, JSON, cookies, rate-limit)       │
│  (no side effects, importable by tests)                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  src/routes/index.js  (central route aggregator, mounts /v1)   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  src/modules/{module}/{module}.routes.js                        │
│  Middleware chain: authMiddleware → subscriptionMiddleware      │
│                    → validator → validate → controller          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  {module}.controller.js   →  handles HTTP req/res              │
│  {module}.service.js      →  business logic, throws HttpError  │
│  {module}.repository.js   →  raw SQL queries via query()       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  MySQL2 (via src/config/db.js connection pool)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Modules

| Module | Route Path | Auth | Subscription | Description |
|--------|-----------|------|-------------|-------------|
| `auth` | `/v1/auth` | Partial | No | Login, OTP, password reset, sessions |
| `client` | `/v1/client` | Yes | No | Registration, profile |
| `common` | `/v1/common` | No | No | Countries, states, cities, currencies |
| `category` | `/v1/category` | Yes | Yes | Menu category CRUD |
| `menu-item` | `/v1/menu` | Yes | Yes | Menu item CRUD with image upload |
| `template` | `/v1/template` | Yes | Yes | Customer-facing menu templates |
| `table` | `/v1/tables` | Yes | Yes | Restaurant tables + QR codes |
| `customer-menu` | `/v1/customer-menu` | No | No | Public menu viewing |
| `feedback` | `/v1/feedback` | Yes | No | Feedback tickets, comments, images |
| `subscription` | `/v1/subscription` | Yes | No | Razorpay payments, status, history |

---

## Reference Modules

Use these as copy-paste starting points:

| Module | Use When | Why |
|--------|----------|-----|
| **`category`** | Simple CRUD | Cleanest minimal module, 5 files, subscription gated |
| **`menu-item`** | CRUD with file uploads | Shows Multer + Sharp + MinIO integration |
| **`auth`** | Complex auth flows | JWT, OTP, password reset, session management |
| **`feedback`** | Multi-table, admin + client routes | Shows pagination, filtering, image uploads, nested resources |
| **`customer-menu`** | Public endpoints (no auth) | Shows subscription check in service layer instead of middleware |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Framework | Express 4.x |
| Database | MySQL2 (raw SQL, no ORM) |
| Validation | express-validator |
| Auth | JWT (jsonwebtoken) + bcrypt |
| File Storage | MinIO / S3 (AWS SDK v3) |
| Image Processing | Sharp |
| Email | Nodemailer (Gmail SMTP) |
| SMS | Twilio |
| Payments | Razorpay |
| Deployment | Vercel (serverless) |
| Timezone | moment-timezone (Asia/Kolkata) |

---

## Key Rules

1. **All new code goes in `src/modules/{module}/`** - never in legacy flat folders
2. **Every module has 5 files**: routes, controller, service, repository, validator
3. **Services throw `HttpError`** - controllers use `asyncHandler` to catch
4. **Repository files include CREATE TABLE schema** in comments at top
5. **Route paths are RESTful nouns** - never mirror controller function names
6. **Parameterized queries only** - use `?` placeholders, never string interpolation
7. **Frontend service files must stay in sync** with backend route paths
