# 01 - Folder Structure

> Complete backend folder structure with explanations of where every file lives and why.

---

## Top-Level Structure

```
backend/
├── app.js                    # Express app setup (CORS, JSON, cookies, rate-limit, routes, error handler)
├── server.js                 # Production entrypoint (boots HTTP server, initializes MinIO)
├── package.json              # ESM project ("type": "module")
├── vercel.json               # Vercel serverless deployment config
├── .env                      # Environment variables (gitignored)
│
├── src/
│   ├── config/               # Infrastructure configs (DB, MinIO, Twilio, Nodemailer, Razorpay)
│   ├── db/                   # Database migrations & seeds
│   │   ├── migrate.js        # Custom SQL migration runner
│   │   ├── migrations/       # Numbered .sql migration files (001-022)
│   │   ├── seeds/            # Seed data (SQL + JS seeders)
│   │   └── README.md         # Migration system documentation
│   │
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.js          # JWT auth with auto refresh token rotation
│   │   ├── subcription.middleware.js   # Subscription status gate
│   │   └── validate.middleware.js      # express-validator result checker
│   │
│   ├── modules/              # ★ ALL FEATURE MODULES LIVE HERE ★
│   │   ├── auth/
│   │   ├── client/
│   │   ├── common/
│   │   ├── category/
│   │   ├── menu-item/
│   │   ├── template/
│   │   ├── table/
│   │   ├── customer-menu/
│   │   ├── feedback/
│   │   └── subscription/
│   │
│   ├── providers/            # External service wrappers (thin SDK adapters)
│   │   ├── minio/minio.provider.js
│   │   ├── nodemailer/nodemailer.provider.js
│   │   ├── razorpay/razorpay.provider.js
│   │   └── twilio/twilio.provider.js
│   │
│   ├── routes/
│   │   └── index.js          # Central route aggregator (mounts all modules under /v1)
│   │
│   └── utils/                # Shared utilities
│       ├── asyncHandler.js            # Promise wrapper for route handlers
│       ├── convertEmptyStringsToNull.js  # Input sanitizer
│       ├── errorHelper.js             # HttpError class
│       ├── executeWithRetry.utils.js  # SQL retry wrapper
│       ├── query.utils.js             # Core DB query + withTransaction
│       └── utils.js                   # createUniqueId + getCurrentTime
```

---

## Module Internal Structure

Every module follows the same 5-file pattern:

```
src/modules/{module}/
├── {module}.routes.js        # Express Router, endpoint definitions, middleware chain
├── {module}.controller.js    # HTTP request/response handling, calls service
├── {module}.service.js       # Business logic, orchestration, throws HttpError
├── {module}.repository.js    # Raw SQL queries, returns raw DB results
└── {module}.validator.js     # express-validator rules (arrays of body()/param() chains)
```

### Real Example: `category` Module

```
src/modules/category/
├── category.routes.js        # GET /, POST /, PUT /:categoryId
├── category.controller.js    # fetchAllCategories, createCategory, updateCategory
├── category.service.js       # Business logic: duplicate check, position calc
├── category.repository.js    # findAllCategories, createCategory, updateCategory
└── category.validator.js     # createCategoryValidator, updateCategoryValidator
```

---

## Key File Responsibilities

### `app.js` vs `server.js`

| File | Purpose | Side Effects |
|------|---------|-------------|
| `app.js` | Express app setup only - middleware, route mounting, error handlers | **None** - importable by tests |
| `server.js` | Production entrypoint - starts HTTP server, initializes MinIO bucket | **Yes** - boots server |

```javascript
// app.js - NO side effects, safe to import
import express from 'express';
import apiRoutes from './src/routes/index.js';

const app = express();
app.use(express.json());
app.use('/v1', apiRoutes);
app.use((err, req, res, next) => { /* error handler */ });

export default app;
```

```javascript
// server.js - boots everything
import app from './app.js';
import { ensureBucketExists } from './src/config/minioConfig.js';

const PORT = process.env.PORT || 3002;
ensureBucketExists();
app.listen(PORT);
```

---

### `src/routes/index.js` (Central Route Aggregator)

All module routes are mounted here under `/v1`:

```javascript
import { Router } from 'express';
import categoryRoutes from '../modules/category/category.routes.js';
import menuItemRoutes from '../modules/menu-item/menu-item.routes.js';
// ... other imports

const router = Router();

router.use('/category', categoryRoutes);   // → /v1/category
router.use('/menu', menuItemRoutes);       // → /v1/menu
// ... other mounts

export default router;
```

**When adding a new module**, you MUST register it here.

---

## Config Files

| File | Service | Notes |
|------|---------|-------|
| `src/config/db.js` | MySQL2 | Connection pool (limit 10), env-aware (dev vs prod) |
| `src/config/minioConfig.js` | MinIO/S3 | AWS SDK v3, auto-creates bucket on startup |
| `src/config/nodemailer.js` | Gmail SMTP | Nodemailer transport |
| `src/config/razorpay.js` | Razorpay | Payment client (currently disabled) |
| `src/config/twilio.js` | Twilio | SMS + WhatsApp clients |

---

## Provider Files

Providers are thin wrappers around external SDKs. No business logic.

```
src/providers/
├── minio/minio.provider.js           # uploadObject, getSignedUrl, deleteObject
├── nodemailer/nodemailer.provider.js # sendOtpEmail, sendPasswordResetEmail
├── razorpay/razorpay.provider.js     # verifyPayment (disabled)
└── twilio/twilio.provider.js         # sendSMS, sendWhatsApp
```

**Rule**: Providers accept raw data, call the SDK, return the result. They do NOT contain business logic or throw `HttpError`.

---

## Utils

| File | Exports | Purpose |
|------|---------|---------|
| `asyncHandler.js` | `asyncHandler` | Wraps async route handlers, catches errors → `next()` |
| `errorHelper.js` | `HttpError` | Error class with `statusCode` and `code` |
| `query.utils.js` | `query` (default), `withTransaction` | Core DB abstraction with auto-reconnect |
| `utils.js` | `createUniqueId`, `getCurrentTime` | ID generation (prefix + timestamp) and IST time |
| `convertEmptyStringsToNull.js` | `convertEmptyStringsToNull` | Input sanitizer for form data |
| `executeWithRetry.utils.js` | `executeWithRetry` | SQL retry (3 attempts, 500ms delay) |

---

## Import Rules

### Inside a Module

```javascript
// Same module files
import * as categoryService from "./category.service.js";

// Utils (2 levels up from src/modules/{module}/)
import query from "../../utils/query.utils.js";
import { HttpError } from "../../utils/errorHelper.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Middleware (2 levels up)
import { authMiddleware } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

// Providers (2 levels up)
import { uploadObject } from "../../providers/minio/minio.provider.js";

// Another module
import { checkSubscriptionStatus } from "../subscription/subscription.service.js";
```

### Import Path Depth Reference

```
src/modules/{module}/{module}.controller.js
  → ../../utils/          (src/utils/)
  → ../../middleware/     (src/middleware/)
  → ../../providers/      (src/providers/)
  → ../other-module/      (src/modules/other-module/)
  → ./                    (same module folder)
```

---

## Adding a New Module Checklist

1. Create `src/modules/{module-name}/` folder (singular, kebab-case)
2. Create 5 files: `validator.js`, `repository.js`, `service.js`, `controller.js`, `routes.js`
3. Register routes in `src/routes/index.js`
4. Add DB migration in `src/db/migrations/`
5. Verify all import paths use correct depth (`../../` for utils/middleware/providers)
