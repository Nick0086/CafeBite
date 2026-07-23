---
name: backend-api-development
user-invocable: true
description: |
  **BACKEND API DEVELOPMENT SKILL** — Create complete, production-ready REST APIs following the MANDATORY module-based folder structure. USE FOR: Creating new API endpoints; building controllers, services, repositories, validators; adding request validation; refactoring code to match patterns; reviewing backend code for compliance. ALL new code MUST go in `backend/src/modules/{module}/` — the old flat `backend/controllers/`, `backend/services/`, `backend/repositories/` structure is LEGACY. Provides copy-paste templates, folder structure, module patterns, pre-coding checklists, authorization patterns, and troubleshooting guides.
triggers:
  - "Create a new API for"
  - "Build a controller for"
  - "Write validators for"
  - "Set up a service to"
  - "Add new backend feature"
  - "Create REST API endpoint"
  - "Fix this controller"
  - "Add validation to"
  - "Backend API development"
  - "Follow our patterns"
  - "Create a new module"
  - "Backend folder structure"
  - "Where should I put this file"
  - "Organize backend code"
applyTo: []  # Available on demand; not file-specific
---

# Backend API Development Skill

## ⚠️ MANDATORY: New Module-Based Structure

> [!CAUTION]
> **ALL new backend code MUST follow the module-based folder structure.**
> The old flat structure (`backend/controllers/`, `backend/services/`, `backend/repositories/`, `backend/validators/`, `backend/routes/`) is **LEGACY** — it exists only for backward compatibility.
> **DO NOT** create new files in those legacy folders. All new features go in `backend/src/modules/{module}/`.

### Legacy (❌ DO NOT use for new code)
```
backend/
├── controllers/feature.controller.js
├── services/feature.service.js
├── repositories/feature.repository.js
├── validators/feature.validators.js
└── routes/feature.routes.js
```

### New Standard (✅ ALWAYS use this)
```
backend/src/modules/{module}/
├── {module}.routes.js
├── {module}.controller.js
├── {module}.service.js
├── {module}.repository.js
└── {module}.validator.js
```

---

## Activation

This skill activates when you ask for:
- Creating new REST API endpoints or backend modules
- Building controllers, services, repositories, or validators
- Setting up request validation for APIs
- Organizing or restructuring backend code
- Understanding where backend files should go
- Refactoring backend code to match patterns

---

## Pre-Coding Checklist

Before implementing, answer these questions:

- [ ] What is the HTTP method? (GET/POST/PUT/DELETE)
- [ ] What is the endpoint path? (e.g., `/api/features/:id`)
- [ ] What request parameters are needed? (body, query, path)
- [ ] What is the expected response format?
- [ ] Does this require authentication?
- [ ] Does this require role-based authorization?
- [ ] What database tables will be affected?
- [ ] Is this operation atomic (single query) or complex (multiple steps)?

### Reference Examples

👉 **Gold standard (new module structure)**: `release-notes` module — *Full-featured, complex module*
- `backend/src/modules/release-notes/release-notes.routes.js`
- `backend/src/modules/release-notes/release-notes.controller.js`
- `backend/src/modules/release-notes/release-notes.service.js`
- `backend/src/modules/release-notes/release-notes.repository.js`
- `backend/src/modules/release-notes/release-notes.validator.js`
- **Frontend**: `frontend/src/services/releaseNotesService.js`

> **Why this module?** It demonstrates **all** best practices in the new structure: complete 5-layer architecture, `withTransaction` for multi-step ops, `HttpError` throws in service, `handleError` in controllers, CREATE TABLE schema comments in repository, thorough validators for every endpoint, and RESTful route naming. **Use it as your copy-paste starting point for any new module.**

👉 **Clean simple reference**: `service-provider` module — *Minimal, zero-legacy-import module*
- `backend/src/modules/service-provider/service-provider.routes.js`
- `backend/src/modules/service-provider/service-provider.controller.js`
- `backend/src/modules/service-provider/service-provider.service.js`
- `backend/src/modules/service-provider/service-provider.repository.js`
- `backend/src/modules/service-provider/service-provider.validator.js`
- **Frontend**: `frontend/src/services/serviceProviderService.js`

> **Why this module?** Cleanest simple module — **zero legacy imports**, pure new structure, all imports are from `../../utils/` and `../../../middlewares/`. Great starting point for straightforward CRUD modules. Also shows the matching frontend service file.

👉 **Complex real-time module**: `gsm-smart-meter` module — *MQTT + Socket + Sub-features*
- `backend/src/modules/gsm-smart-meter/gsm-smart-meter.routes.js`
- `backend/src/modules/gsm-smart-meter/gsm-smart-meter.controller.js`
- `backend/src/modules/gsm-smart-meter/gsm-smart-meter.service.js`
- `backend/src/modules/gsm-smart-meter/gsm-smart-meter.repository.js`
- `backend/src/modules/gsm-smart-meter/gsm-smart-meter.validator.js`
- `backend/src/mqtt/gsm-smart-meter/gsm-smart-meter.mqtt.js`
- `backend/src/socket/gsm-smart-meter/gsm-smart-meter.socket.js`
- **Frontend**: `frontend/src/services/gsm-smart-meter/gsmSmartMeterService.js` (plus `dashboardService.js`, `modemService.js`, `meterRegistrationService.js`, `scriptDecodeIdService.js`)

> **Why this module?** It demonstrates **all** patterns for real-time communication: MQTT client initialization via `initSmartMeterMqttBridge(io)`, Socket.IO event handlers, sharing business logic between HTTP and MQTT via the service layer, sub-features (dashboard, modem, command-buffer, script-decode-id, meter-registration), and complex validators for 41+ endpoints. **Use it when building modules that need MQTT or Socket.IO.**

---

## Architecture Overview

Our backend uses **strict 3-tier layered architecture** with a **module-based folder structure**.

### Request Flow

```
Client Request
   ↓
server.js (starts HTTP server)
   ↓
app.js (Express app — middleware, routes, error handlers)
   ↓
Middleware (auth → validation → rate-limit)
   ↓
src/routes/index.js (central route aggregator)
   ↓
src/modules/{module}/{module}.routes.js
   ↓
src/modules/{module}/{module}.controller.js
   ↓
src/modules/{module}/{module}.service.js
   ↓
src/modules/{module}/{module}.repository.js
   ↓
Database
```

### Complete Folder Structure

```
backend/
├── app.js                              # Express app — middleware, routes, error handlers. No side effects.
├── server.js                           # Production entrypoint — boots DB, cache, workers, starts HTTP server.
├── worker.js                           # (Optional) Standalone worker process entrypoint.
│
├── package.json
├── .env                                # Environment variables (gitignored).
├── .env.example                        # Committed template of required env vars.
│
├── db/                                 # Database schema migrations.
│   └── migrations/
│       └── <primary-db>/
│
├── scripts/                            # One-off utility / admin / seed scripts.
├── tests/                              # Test suites (unit/, integration/, e2e/).
│
└── src/
    ├── config/                         # Infrastructure config (db.js, socket.js, cors.js)
    ├── errors/                         # Custom error classes + global error handler
    │   ├── AppError.js
    │   ├── error-codes.js
    │   ├── error-handler.middleware.js
    │   └── logger.js
    ├── middleware/                      # Express middleware (auth, validate, rate-limit)
    ├── providers/                      # Third-party SDK wrappers (<service>.provider.js)
    ├── utils/                          # Shared utilities (queryHelper.js, etc.)
    ├── jobs/                           # Background job queues & workers
    ├── cronjobs/                       # Scheduled recurring jobs
    ├── mqtt/                           # MQTT client handlers (per module)
    │   └── {module}/
    │       └── {module}.mqtt.js        # Client init, subscriptions, message handlers
    ├── socket/                         # Socket.IO event handlers (per module)
    │   └── {module}/
    │       └── {module}.socket.js      # Event registration, emitters
    │
    ├── routes/
    │   └── index.js                    # Central route aggregator — mounts all module routes
    │
    └── modules/                        # ★ ALL NEW FEATURES GO HERE ★
        └── {module}/
            ├── {module}.routes.js
            ├── {module}.controller.js
            ├── {module}.service.js
            ├── {module}.repository.js
            └── {module}.validator.js   # (Optional)
```

### Key Rule: `app.js` vs `server.js`

| File | Purpose |
|------|---------|
| `app.js` | Express app setup only — middleware, route mounting, error handlers. **No side effects.** Importable by tests. |
| `server.js` | Production entrypoint — initializes all infrastructure (DB, cache, workers, sockets), then starts HTTP server. |

**`app.js` must NEVER start servers, connect to databases, boot workers, or create side effects on import.**

---

## The 5 Layers You'll Create

| Layer | File | Responsibility |
|-------|------|----------------|
| **Validator** | `src/modules/{module}/{module}.validator.js` | Input validation rules (express-validator) |
| **Repository** | `src/modules/{module}/{module}.repository.js` | Database queries with schema docs |
| **Service** | `src/modules/{module}/{module}.service.js` | Business logic, validation, transactions |
| **Controller** | `src/modules/{module}/{module}.controller.js` | HTTP handling, auth, error handling |
| **Route** | `src/modules/{module}/{module}.routes.js` | Middleware chain, endpoint definitions |

### Module Patterns

| Pattern | When to Use |
|---------|-------------|
| **Simple Module** | Self-contained feature, no sub-features |
| **Module with Sub-Features** | Feature has distinct child domains sharing the parent's domain |
| **Deeply Nested** | Sub-features themselves have sub-features (max 3 levels) |

#### Simple Module
```
modules/{module}/
├── {module}.routes.js
├── {module}.controller.js
├── {module}.service.js
├── {module}.repository.js
└── {module}.validator.js
```

#### Module with Sub-Features
```
modules/{module}/
├── {module}.routes.js
├── {module}.controller.js
├── {module}.service.js
├── {module}.repository.js
└── {sub-feature}/
    ├── {sub-feature}.service.js
    └── {sub-feature}.repository.js
```

### Layer Responsibilities

| Layer | Does | Does NOT |
|-------|------|----------|
| **Routes** | Define endpoints, apply middleware, delegate to controller | Contain logic |
| **Controller** | Handle HTTP req/res, extract params, call service | Contain business logic |
| **Service** | Business logic, orchestration, throw errors | Access `req`/`res` |
| **Repository** | Database queries, return raw data | Contain business logic |

---

## Real-time Communication Patterns (MQTT & Socket.IO)

> [!TIP]
> **Reference the `gsm-smart-meter` module** for a complete working example of MQTT + Socket.IO integration with the module-based architecture.

When a module needs MQTT or Socket.IO, add these folders **outside** the module:

```
backend/src/
├── mqtt/{module}/              # MQTT client handlers
│   └── {module}.mqtt.js       # Client init, subscriptions, message handlers
├── socket/{module}/            # Socket.IO event handlers  
│   └── {module}.socket.js     # Event registration, emitters
└── modules/{module}/           # HTTP REST module (as normal)
```

### MQTT Pattern — Lazy Single-Client Init

**NEVER** auto-connect on module import. Use a single `initXxxBridge(io)` function:

```javascript
// src/mqtt/gsm-smart-meter/gsm-smart-meter.mqtt.js
import { createMqttClient } from '../../../config/mqtt-gsm.js';
import { getIOInstance } from '../../../app.js';
import { updateSmartMeterTableJson } from '../../modules/gsm-smart-meter/gsm-smart-meter.repository.js';
import { onTriggerGSMSmartMeterTableCreate } from '../../modules/gsm-smart-meter/gsm-smart-meter.service.js';

let client = null;
let initialized = false;

export const initSmartMeterMqttBridge = (io) => {
    if (initialized) return;

    client = createMqttClient(`gsmSmartMeter.mqtt_${Date.now()}`);

    client.on("connect", () => {
        client.subscribe("amrgums/smdlms4g/26314/website/createtable/pub");
        client.subscribe("amreums/smdlms4g/26314/app/config/pub");
    });

    client.on("message", async (topic, message) => {
        if (topic === "amrgums/smdlms4g/26314/website/createtable/pub") {
            const payload = JSON.parse(message.toString());
            // Delegate to service/repository — NEVER inline SQL or business logic
            updateSmartMeterTableJson(payload);
        }
        if (topic === "amreums/smdlms4g/26314/app/config/pub") {
            const payload = JSON.parse(message.toString());
            const socketId = payload?.socketId;
            if (socketId && io) {
                io.to(socketId).emit('receiveCMDFromSmartMeterProducer', payload);
            }
            getIOInstance().emit('mqttsmartmeterautoconfig', payload);
        }
    });

    initialized = true;
};

export { client };  // live binding — service & socket import this for .publish()
```

**Key Rules:**
- **Naming convention**: `init{Module}MqttBridge(io)` — always takes `io` as parameter
- **Single client pattern** — one `client` variable, no duplicate clients or subscriptions
- **Live binding export** — `export { client }` lets service/socket import it; it's `null` until `init` runs, then becomes the active client
- **Delegate to service** — MQTT handlers call service functions, never repository directly (except simple DB updates)
- **No side effects on import** — `client` is `null` until `app.js` calls `initSmartMeterMqttBridge(io)`
- **Register in `app.js`** after Socket.IO setup: `initSmartMeterMqttBridge(io);`

### Socket.IO Pattern

```javascript
// src/socket/gsm-smart-meter/gsm-smart-meter.socket.js
import { client } from "../../../mqtt/gsm-smart-meter/gsm-smart-meter.mqtt.js";
import * as commandBufferService from '../../../modules/gsm-smart-meter/command-buffer/command-buffer.service.js';

export const initSmartMeterSocket = (io) => {
    io.on("connection", (socket) => {
        socket.on("sendCMDToSmartMeterConsumer", async (data) => {
            // Business logic in service
            const result = await commandBufferService.insertCommandAtTrigger({ payload: data, addedBy: 2 });
            // Publish via shared MQTT client (live binding)
            client.publish("amreums/smdlms4g/26314/app/config/sub", JSON.stringify(result.payload));
        });
    });
};
```

**Key Rules:**
- **Naming convention**: `init{Module}Socket(io)` — always takes `io` as parameter
- **Import MQTT `client`** as live binding for `.publish()` calls
- **Delegate to service** — Socket handlers call service functions, never repository directly
- **Register in `app.js`** before MQTT init: `initSmartMeterSocket(io);`

### Avoiding Circular Dependencies

Common pitfall: MQTT → Service → MQTT (for client)

**Solution:** MQTT exports `client` as live binding. Service imports it. Both modules load before any function runs. The `initXxxBridge()` function sets `client` after all imports resolve.

```
MQTT module          Service module
    ↓ exports           ↓ exports
  client (null)     onTriggerGSMSmartMeterTableCreate
    ↑ imported        ↑ imported by MQTT
  (live binding)
```

### Layer Boundaries with Real-time

| Source | Can Call |
|--------|----------|
| HTTP Controller | Service only |
| MQTT Handler | Service + Repository (simple updates only) |
| Socket Handler | Service + MQTT client (for publish) |
| Service | Repository + MQTT client (for publish) |
| Repository | Database only |

**NEVER** let MQTT or Socket handlers contain SQL or business logic. Always delegate to Service.

---

## 5-Minute Implementation Guide

### Step 1: Validator (5 min)
**File**: `backend/src/modules/{module}/{module}.validator.js`

```javascript
import { body, query, param } from "express-validator";

export const create{{Feature}}Validator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ max: 255 }).withMessage("Max 255 chars")
        .trim(),
    body("status")
        .optional()
        .isIn(["ACTIVE", "INACTIVE"]).withMessage("Invalid status"),
];

export const get{{Feature}}Validator = [
    param("{{featureId}}")
        .notEmpty().withMessage("ID required")
        .isUUID().withMessage("Invalid UUID format"),
];

export const list{{Features}}Validator = [
    query("page").optional().isInt({ min: 1 }).withMessage("Page >= 1"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit 1-100"),
];
```

**Key Rules:**
- One validator array per endpoint
- Use `.notEmpty()`, `.isLength()`, `.isIn()`, `.isUUID()`, `.custom()`
- Include clear error messages
- Trim whitespace with `.trim()`

---

### Step 2: Repository (10 min)
**File**: `backend/src/modules/{module}/{module}.repository.js`

```javascript
/*
    Database Schema
    ===============
    CREATE TABLE {{features}} (
        sr_no INT AUTO_INCREMENT PRIMARY KEY,
        unique_id VARCHAR(255) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(255),
        updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
        updated_by VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'
    );
*/

import query, { queryWithTransaction } from "../../utils/queryHelper.js";

export const getFeatureById = async (featureId, connection = null) => {
    const sql = `SELECT * FROM features WHERE unique_id = ?`;
    return connection
        ? await queryWithTransaction(connection, sql, [featureId])
        : await query(sql, [featureId]);
}

export const getAllFeatures = async ({ search = '', status = [], page = 1, limit = 50 } = {}, connection = null) => {
    let sql = `SELECT * FROM features WHERE 1=1`;
    let params = [];
    if (search) { sql += ` AND name LIKE ?`; params.push(`%${search}%`); }
    if (status.length > 0) { sql += ` AND status IN (${status.map(() => '?').join(',')})`; params.push(...status); }
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);
    return connection ? await queryWithTransaction(connection, sql, params) : await query(sql, params);
}

export const createFeature = async (data, connection = null) => {
    const { uniqueId, name, status, createdBy } = data;
    const sql = `INSERT INTO features (unique_id, name, status, created_by) VALUES (?, ?, ?, ?)`;
    return connection ? await queryWithTransaction(connection, sql, [uniqueId, name, status, createdBy]) : await query(sql, [uniqueId, name, status, createdBy]);
}
```

**Key Rules:**
- Include CREATE TABLE schema in comments at top
- Parameterized queries with `?` placeholders
- Support `connection` parameter for transactions
- Return raw database results (affectedRows, insertId, etc.)
- No error handling (errors propagate to service)
- **Import paths use `../../utils/` since file is inside `src/modules/{module}/`**

---

### Step 3: Service (10 min)
**File**: `backend/src/modules/{module}/{module}.service.js`

```javascript
import * as featureRepository from "./feature.repository.js";
import { v4 as uuidv4 } from "uuid";
import { HttpError } from "../../utils/errorHelper.js";
import { withTransaction } from "../../utils/queryHelper.js";

export const getFeatureById = async (featureId) => {
    const feature = await featureRepository.getFeatureById(featureId);
    if (!feature) throw new HttpError("Feature not found", 404);
    return feature;
}

export const createFeature = async (data, userId, userName) => {
    const featureData = {
        uniqueId: uuidv4(),
        name: data.name.trim(),
        status: data.status || "ACTIVE",
        createdBy: userId,
    };
    const result = await featureRepository.createFeature(featureData);
    if (result.affectedRows === 0) throw new HttpError("Failed to create feature", 500);
    return featureData;
}

// For multi-step operations, use transaction:
export const createFeatureWithRelated = async (data, userId) => {
    return await withTransaction(async (connection) => {
        const r1 = await featureRepository.createFeature(data, connection);
        if (r1.affectedRows === 0) throw new HttpError("Failed", 500);
        return data;
    })
}
```

**Key Rules:**
- All functions async
- Throw `HttpError(message, statusCode)` — never return errors
- Check `affectedRows` after database operations
- Use `withTransaction()` for multi-step operations
- **Import repository from same folder: `./feature.repository.js`**
- **Import utils from `../../utils/`**

---

### Step 4: Controller (5 min)
**File**: `backend/src/modules/{module}/{module}.controller.js`

```javascript
import * as featureService from "./feature.service.js";
import { handleError } from "../../utils/common.js";

const getCurrentUser = (user) => ({
    userId: user.UNIQUE_ID,
    userName: `${user.FIRST_NAME} ${user.LAST_NAME}`
});

export const getFeatureById = async (req, res) => {
    try {
        const { featureId } = req.params;
        const result = await featureService.getFeatureById(featureId);
        return res.status(200).json({ success: true, message: "Feature fetched successfully", data: result });
    } catch (error) {
        return handleError("feature.controller.js", "getFeatureById", res, error);
    }
}

export const createFeature = async (req, res) => {
    try {
        const { roles } = req;
        if (roles !== process.env.SUPER_ADMIN_ROLE) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        const { userId, userName } = getCurrentUser(req.decoded);
        await featureService.createFeature(req.body, userId, userName);
        return res.status(201).json({ success: true, message: "Feature created successfully" });
    } catch (error) {
        return handleError("feature.controller.js", "createFeature", res, error);
    }
}
```

**Key Rules:**
- Try-catch wrapper on every function
- Authorization checks immediately after try
- **Import service from same folder: `./feature.service.js`**
- **Import utils from `../../utils/`**

---

### Step 5: Route (2 min)
**File**: `backend/src/modules/{module}/{module}.routes.js`

```javascript
import { Router } from "express";
import * as featureController from "./feature.controller.js";
import { authenticate, authenticateSuperAdmin } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createFeatureValidator, getFeatureValidator } from "./feature.validator.js";

const router = Router();

// ✅ Routes use RESTful resource paths — NOT controller function names
router.get("/", authenticate, featureController.fetchAllFeatures);
router.get("/:featureId", authenticate, getFeatureValidator, validate, featureController.fetchFeatureById);
router.post("/", authenticate, authenticateSuperAdmin, createFeatureValidator, validate, featureController.createFeature);
router.put("/:featureId", authenticate, authenticateSuperAdmin, featureController.updateFeature);
router.delete("/:featureId", authenticate, authenticateSuperAdmin, featureController.removeFeature);

export default router;
```

Then register in `backend/src/routes/index.js` (central route aggregator):
```javascript
import featureRoutes from "../modules/feature/feature.routes.js";
router.use("/features", featureRoutes);
```

The central route aggregator is mounted in `app.js`:
```javascript
import apiRoutes from "./src/routes/index.js";
app.use("/api", apiRoutes);
```

**Key Rules for imports inside modules:**
- Same module files: `./feature.service.js`, `./feature.repository.js`
- Middleware: `../../middleware/auth.middleware.js` or `../../../middlewares/auth.middlewares.js`
- Utils: `../../utils/queryHelper.js` or `../../../utils/queryHelper.js`
- Validator from same module: `./feature.validator.js`

---

## ⚠️ Frontend Service Sync (MANDATORY)

> [!CAUTION]
> **When you add or change backend routes, you MUST also update the corresponding frontend service file in `frontend/src/services/`.** Backend and frontend API paths must always stay in sync.

### How it works

Every backend module has a matching frontend service file that calls its API endpoints:

| Backend Module | Frontend Service File |
|----------------|----------------------|
| `src/modules/release-notes/` | `frontend/src/services/releaseNotesService.js` |
| `src/modules/service-provider/` | `frontend/src/services/serviceProviderService.js` |
| `src/modules/consumer-comment/` | `frontend/src/services/commentsService.js` |
| `src/modules/web-tab/` | `frontend/src/services/webTabsService.js` |
| `src/modules/user-filter/` | `frontend/src/services/userFilterService.js` |
| `src/modules/gsm-smart-meter/` (+ sub-features) | `frontend/src/services/gsm-smart-meter/gsmSmartMeterService.js`, `dashboardService.js`, `modemService.js`, `meterRegistrationService.js`, `scriptDecodeIdService.js` |

### Frontend Service Pattern

```javascript
// frontend/src/services/featureService.js
import { api, handleApiError } from "@/utils/api";

export const createFeature = async (data) => {
    try {
        const response = await api.post("/features", data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const fetchFeatureById = async (featureId) => {
    try {
        const response = await api.get(`/features/${featureId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};
```

**Key Rules:**
- API paths in frontend MUST match the backend route mount path (e.g., backend `/service-providers` → frontend `api.get("/service-providers/...")`)
- All service functions use `try/catch` with `throw handleApiError(error)`
- Import `api` and `handleApiError` from `@/utils/api`
- If you add a new endpoint in backend, add the corresponding function in the frontend service file
- If you rename a route path, **update both** backend and frontend

---

## ⚠️ Import Rules: Module vs Legacy Code

> [!IMPORTANT]
> **Not all code has been migrated to the new module structure yet.** Core shared systems like **roles**, **users**, **permissions**, **authentication**, and **authorization** are still in the legacy flat folders. These will be migrated last. Until then, new modules MUST import from legacy code when needed.

### Import Priority Order

1. **Same module** → Use `./` relative imports (e.g., `./feature.service.js`)
2. **Another new module** → Use `../other-module/other-module.service.js` (if it exists in `src/modules/`)
3. **Shared utils/middleware** → Use `../../utils/` or `../../middleware/` or `../../../utils/` or `../../../middlewares/`
4. **Legacy code (NOT yet migrated)** → Import directly from legacy folders

### What is still in legacy (DO NOT recreate, just import):

| Legacy Resource | Import From | Used For |
|----------------|-------------|----------|
| User repository | `../../../repositories/user.repository.js` | User lookups |
| Auth middleware | `../../../middlewares/auth.middlewares.js` | `authenticate`, `authenticateSuperAdmin` |
| Roles/Permissions | `../../../services/*.service.js` | Role checks, permission handling |
| Redis service | `../../../services/redis/redis.service.js` | Caching |
| Config files | `../../../config/*.js` | DB, Redis, etc. |

### ✅ Correct: New module importing from legacy
```javascript
// In backend/src/modules/release-notes/release-notes.service.js
import { getUserById } from "../../../repositories/user.repository.js";  // ✅ Legacy — not migrated yet
import RedisService from "../../../services/redis/redis.service.js";     // ✅ Legacy — not migrated yet
import { HttpError } from "../../utils/errorHelper.js";                  // ✅ Shared utils
import * as releaseNoteRepository from "./release-notes.repository.js";  // ✅ Same module
```

### ❌ Wrong: Recreating legacy functionality in new module
```javascript
// DON'T create a new user repository inside your module!
// DON'T duplicate auth middleware!
// DON'T copy permission logic into your module!
```

### Before You Import: Quick Checklist

- [ ] Does the function already exist in `src/modules/`? → Import from there
- [ ] Does it exist in legacy `repositories/`, `services/`, `middlewares/`? → Import from legacy with `../../../` path
- [ ] Does it exist in `src/utils/` or `src/middleware/`? → Import from `../../utils/` or `../../middleware/`
- [ ] None of the above? → Create it in your module

---

## ⚠️ Legacy-to-Module Migration: Import Recheck (MANDATORY)

> [!CAUTION]
> **When legacy code is moved into the new `src/modules/` structure, you MUST find and update EVERY import across the entire codebase that referenced the old legacy path.** Stale legacy imports will cause runtime crashes. This is non-negotiable.

### Why This Matters

When a file like `backend/repositories/consumer.repository.js` is migrated to `backend/src/modules/consumer/consumer.repository.js`, **every other file** that used to import from the old path will break. A single missed import means a production crash.

### Migration Import Checklist

When you move legacy code into a new module:

1. **Search the ENTIRE codebase** for all imports referencing the old legacy path
   ```bash
   # Example: migrating consumer.repository.js from legacy to module
   grep -rn "consumer.repository" backend/ --include="*.js"
   ```
2. **Update every found import** to point to the new module path
   ```javascript
   // ❌ OLD — legacy path (now broken after migration)
   import { getConsumerById } from "../../../repositories/consumer.repository.js";

   // ✅ NEW — updated to point to migrated module
   import { getConsumerById } from "../consumer/consumer.repository.js";
   ```
3. **Recheck all imports INSIDE the newly created module** — relative paths change when files move from `backend/repositories/` to `backend/src/modules/{module}/`
   ```javascript
   // ❌ OLD path from legacy location
   import query from "../../utils/queryHelper.js";

   // ✅ NEW path from inside src/modules/{module}/
   import query from "../../utils/queryHelper.js";  // Verify depth is correct!
   ```
4. **Verify no circular dependencies** were introduced by the migration
5. **Run the application** and confirm no `MODULE_NOT_FOUND` or `ERR_MODULE_NOT_FOUND` errors appear at startup

### Quick Search Commands

```bash
# Find all files importing from a legacy path before migration
grep -rn "from.*repositories/feature" backend/ --include="*.js"
grep -rn "from.*services/feature" backend/ --include="*.js"
grep -rn "from.*controllers/feature" backend/ --include="*.js"

# After migration, run again — result should be ZERO matches for the old path
grep -rn "from.*repositories/feature" backend/ --include="*.js"
# Expected: no results (all updated to new module path)
```

### ✅ Correct Migration Flow
```
1. Create new module folder:  src/modules/feature/
2. Move legacy files into module (rename to match convention)
3. Search entire codebase for old import paths
4. Update ALL found imports to new module paths
5. Recheck all imports inside the new module (relative paths changed)
6. Start the server — confirm zero import errors
7. Test all affected endpoints
```

### ❌ Common Migration Mistakes
```javascript
// Moved the file but forgot to update imports in other modules
import { getData } from "../../../repositories/feature.repository.js";  // ❌ File no longer exists here!

// Updated some imports but missed files in legacy controllers/services
// Always search the FULL backend/ directory, not just src/modules/

// Assumed relative paths stayed the same after moving
import query from "../utils/queryHelper.js";  // ❌ Wrong depth — was correct in legacy, broken in module
```

> [!IMPORTANT]
> **Every migration MUST end with a full-text search confirming zero remaining references to the old legacy path.** If any old import path still appears in the codebase, the migration is incomplete.

---

## Config Pattern — Lazy Singleton

```javascript
// src/config/<service>.js
let instance = null;
export function init(config) { /* create connection */ }
export function get() { /* return instance, auto-init from env if needed */ }
export function destroy() { /* gracefully close connection */ }
```

---

## Error Classes (`src/errors/AppError.js`)

| Class | Status | Use When |
|-------|--------|----------|
| `AppError` (base) | varies | Base class |
| `ValidationError` | 400 | Input validation failures |
| `AuthenticationError` | 401 | Missing / expired token |
| `AuthorizationError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Duplicate entries |
| `BusinessError` | 422 | Business rule violations |
| `DatabaseError` | 500 | Wraps raw DB errors |
| `ExternalServiceError` | 502 | Third-party API failures |

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Module folders | kebab-case, singular | `user/`, `order/`, `attachment-list/` |
| Layer files | `<module>.<layer>.js` | `todo.service.js`, `user.repository.js` |
| Provider files | `<name>.provider.js` | `s3.provider.js` |
| Middleware files | `<name>.middleware.js` | `auth.middleware.js` |
| Variables & functions | camelCase, verb prefix | `fetchUserById`, `createOrder` |
| Database columns | snake_case | `first_name`, `created_at` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE_URL` |
| Route paths | kebab-case, RESTful nouns | `/sync-files`, `/consumer-details` |
| Route params | camelCase | `/:featureId`, `/:consumerId` |

### ⚠️ Route Path Naming (MANDATORY)

Route paths MUST be **RESTful resource-based nouns in kebab-case**. They must **NEVER** mirror controller function names.

> [!IMPORTANT]
> Route paths describe **resources**, not **actions**. The HTTP method (GET/POST/PUT/DELETE) already conveys the action.
> Controller functions describe **what the code does**. These are two DIFFERENT naming concerns.

#### ✅ Correct Route Naming
```javascript
// Route path = RESTful resource noun (kebab-case)
// Controller function = descriptive action verb (camelCase)
router.get("/", controller.fetchAllConsumers);              // GET /api/consumers
router.get("/:consumerId", controller.fetchConsumerById);    // GET /api/consumers/:consumerId
router.post("/", controller.createConsumer);                 // POST /api/consumers
router.put("/:consumerId", controller.updateConsumer);       // PUT /api/consumers/:consumerId
router.delete("/:consumerId", controller.removeConsumer);    // DELETE /api/consumers/:consumerId
router.post("/sync-files", controller.syncFilesToDatabase);  // POST /api/attachments/sync-files
router.get("/modem-status", controller.fetchModemStatus);    // GET /api/gsm/modem-status
```

#### ❌ Wrong Route Naming
```javascript
// DON'T name routes after controller functions!
router.post("/syncFilesToDatabase", controller.syncFilesToDatabase);   // ❌ camelCase path = function name
router.post("/getAttachmentList", controller.getAttachmentList);       // ❌ GET action in POST route name
router.get("/getAllConsumers", controller.getAllConsumers);             // ❌ function name as route
router.post("/createConsumer", controller.createConsumer);             // ❌ verb in route (HTTP method is the verb)
router.get("/getConsumerById/:id", controller.getConsumerById);        // ❌ redundant verb
```

### ⚠️ Function Naming (MANDATORY)

All function names must be **professional, descriptive camelCase** with a clear **verb prefix** indicating the action.

| Verb Prefix | Use For | Example |
|-------------|---------|----------|
| `fetch` | Reading/getting data | `fetchConsumerById`, `fetchAllModems` |
| `create` | Creating new records | `createConsumer`, `createModemEntry` |
| `update` | Modifying existing records | `updateConsumerDetails`, `updateModemStatus` |
| `remove` / `delete` | Deleting records | `removeConsumer`, `deleteAttachment` |
| `sync` | Synchronizing data | `syncFilesToDatabase` |
| `validate` | Validation logic | `validateConsumerData` |
| `process` | Complex operations | `processModemReboot` |
| `generate` | Creating derived data | `generateReport`, `generateUniqueId` |
| `check` | Boolean checks | `checkUserPermission`, `checkModemAssignment` |
| `handle` | Event/error handling | `handleError`, `handleWebhook` |

#### ✅ Correct Function Names
```javascript
// Controller
export const fetchConsumerById = async (req, res) => { ... }
export const createConsumer = async (req, res) => { ... }
export const updateConsumerDetails = async (req, res) => { ... }
export const removeConsumer = async (req, res) => { ... }

// Service
export const fetchConsumerById = async (consumerId) => { ... }
export const validateConsumerData = (data) => { ... }
export const processModemReboot = async (modemId, userId) => { ... }

// Repository
export const findConsumerById = async (consumerId, connection = null) => { ... }
export const insertConsumer = async (data, connection = null) => { ... }
export const updateConsumerById = async (consumerId, data, connection = null) => { ... }
```

#### ❌ Wrong Function Names
```javascript
export const data = async (req, res) => { ... }               // ❌ No verb, not descriptive
export const consumer = async (req, res) => { ... }            // ❌ Just a noun
export const getData = async (req, res) => { ... }             // ❌ Too vague
export const x = async (req, res) => { ... }                   // ❌ Single letter
export const consumer_details = async (req, res) => { ... }    // ❌ snake_case
export const GETCONSUMER = async (req, res) => { ... }         // ❌ ALL CAPS
```

### Function Names Across Layers

Function names should be **consistent but contextually appropriate** across layers:

| Layer | Naming Style | Example |
|-------|-------------|----------|
| **Controller** | Action verb + Resource | `fetchConsumerById`, `createConsumer` |
| **Service** | Same as controller OR business-specific | `fetchConsumerById`, `validateAndCreateConsumer` |
| **Repository** | DB operation verb + Resource | `findConsumerById`, `insertConsumer`, `updateConsumerById` |

---

## Providers (`src/providers/`)

Thin wrappers around external SDKs. No business logic.

```
providers/<service-name>/<service-name>.provider.js
```

---

## Common Patterns

### ✅ Correct: RESTful Routes + Validators
```javascript
router.post("/", authenticate, createValidator, validate, controller.createFeature);
router.get("/modem-status", authenticate, controller.fetchModemStatus);
router.post("/sync-files", authenticate, syncValidator, validate, controller.syncFilesToDatabase);
```

### ❌ Wrong: Function Names as Routes
```javascript
router.post("/createFeature", authenticate, controller.createFeature);     // ❌ verb in path
router.get("/getModemStatus", authenticate, controller.getModemStatus);     // ❌ camelCase path
router.post("/syncFilesToDatabase", authenticate, controller.syncFilesToDatabase); // ❌ function = path
```

### ✅ Correct: Service Throws Errors
```javascript
if (!feature) throw new HttpError("Not found", 404);
```

### ❌ Wrong: Service Returns Errors
```javascript
if (!feature) return { error: "Not found" }; // Wrong!
```

### ✅ Correct: Transaction for Multi-Step
```javascript
return await withTransaction(async (connection) => {
    const r1 = await repo.create(data1, connection);
    const r2 = await repo.create(data2, connection);
    return { r1, r2 };
})
```

---

## HTTP Status Codes

| Code | Use Case |
|------|----------|
| **200** | GET success |
| **201** | POST/Create success |
| **400** | Validation error |
| **403** | Unauthorized/Insufficient role |
| **404** | Resource not found |
| **500** | Server error |

---

## API Response Format

```javascript
// Success
{ success: true, data: {...}, message: "..." }

// Error
{ success: false, message: "Human-readable message", error: { code: "MACHINE_CODE", message: "Detail", details: [...] } }
```

---

## Testing Setup

```javascript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('GET /<module>/items', () => {
    it('returns 200', async () => {
        const res = await request(app).get('/<module>/items');
        expect(res.status).toBe(200);
    });
});
```

## Testing Checklist

- [ ] GET with valid ID → 200
- [ ] GET with invalid ID → 404
- [ ] GET without auth → 401
- [ ] POST with missing fields → 400
- [ ] POST with valid data → 201
- [ ] PUT/DELETE on non-existent → 404
- [ ] Response format: `{ success, message, data }`

---

## Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| Validation not working | Add validators to route + ensure `validate` after validators |
| Not receiving request data | Extract from `req.body`, `req.query`, or `req.params` |
| Database not updating | Check `affectedRows` and throw error if 0 |
| Auth always failing | Check `req.roles` set by middleware + env variable spelling |
| Error status ignored | Ensure service throws `HttpError` with statusCode |
| Wrong import path | Inside modules use `./` for same module, `../../` for utils/middleware, `../../../` for legacy |
| Frontend API 404 | Backend route path changed but frontend service file not updated — keep them in sync |
| Missing function in legacy | Check if it exists in `repositories/`, `services/`, `middlewares/` — import from there, do NOT recreate |

---

## Quick Reference

| Question | Answer |
|----------|--------|
| Where do new features go? | `src/modules/<module>/` |
| Where do DB queries go? | `<module>.repository.js` |
| Where does business logic go? | `<module>.service.js` |
| Where do I register routes? | `src/routes/index.js` |
| Where do MQTT handlers go? | `src/mqtt/<module>/<module>.mqtt.js` |
| Where do Socket handlers go? | `src/socket/<module>/<module>.socket.js` |
| Where do third-party wrappers go? | `src/providers/<service>/` |
| Where do background jobs go? | `src/jobs/` |
| Where do shared utils go? | `src/utils/` |
| Can I add to `backend/controllers/`? | **NO — legacy only** |
| Can I add to `backend/services/`? | **NO — legacy only** |
| Max nesting depth? | 3 levels |

---

## Adding a New Module — Checklist

1. Create `src/modules/<module-name>/` folder (singular, kebab-case)
2. Create: `<module>.validator.js`, `<module>.repository.js`, `<module>.service.js`, `<module>.controller.js`, `<module>.routes.js`
3. **If MQTT needed:** Create `src/mqtt/<module>/<module>.mqtt.js` with `init{Module}MqttBridge(io)` pattern
4. **If Socket needed:** Create `src/socket/<module>/<module>.socket.js` with `init{Module}Socket(io)` pattern
5. Register routes in `src/routes/index.js`
6. Register MQTT/Socket init in `app.js` (Socket first, then MQTT)
7. **Create/update frontend service file** in `frontend/src/services/<module>Service.js` with matching API paths
8. Check imports: use module-based imports where available, legacy imports for roles/users/permissions
9. Add DB migration in `backend/db/migrations/<db>/`
10. Add tests in `backend/tests/`

---

## References

📂 **Folder structure**: See `backend-structure-template` skill  
📖 **Patterns guide**: `backend/BACKEND_CODING_PATTERNS.md`  
🏆 **Gold standard (complex)**: `release-notes` module (`backend/src/modules/release-notes/`)  
🏆 **Gold standard (simple)**: `service-provider` module (`backend/src/modules/service-provider/`)  
🏆 **Gold standard (real-time)**: `gsm-smart-meter` module (`backend/src/modules/gsm-smart-meter/`, `backend/src/mqtt/gsm-smart-meter/`, `backend/src/socket/gsm-smart-meter/`)  
🛠️ **Error helper**: `backend/utils/errorHelper.js`  
🔄 **Query helper**: `backend/utils/queryHelper.js`  
📡 **MQTT handlers**: `backend/src/mqtt/` (per-module, lazy init pattern)  
🔌 **Socket handlers**: `backend/src/socket/` (per-module, shared MQTT client)  
📡 **Frontend services**: `frontend/src/services/` (must stay in sync with backend routes)

---

## Summary

> [!IMPORTANT]
> **STICK TO THIS STRUCTURE.** The old flat `backend/controllers/`, `backend/services/`, `backend/repositories/` folders are LEGACY. All new code MUST go in `backend/src/modules/{module}/`.

1. **Create module folder** — `backend/src/modules/{module}/` (singular, kebab-case)
2. **Create validators first** — Define what you accept
3. **Create repository** — Write SQL queries with schema docs
4. **Create service** — Add business logic and error handling
5. **Create controller** — Handle HTTP requests and authorization
6. **Create route** — Wire middleware chain and endpoints
7. **Register route** — Add to `backend/src/routes/index.js`
8. **If real-time needed:** Create `src/mqtt/{module}/` and `src/socket/{module}/` with `initXxxBridge(io)` / `initXxxSocket(io)` patterns
9. **Register MQTT/Socket** in `app.js` (Socket first, then MQTT)
10. **Sync frontend** — Create/update `frontend/src/services/<module>Service.js` with matching API paths
11. **Verify imports** — Use module imports first, fall back to legacy for roles/users/permissions

**Use this order. Follow the module-based folder structure. NEVER create new files in legacy flat folders.**
