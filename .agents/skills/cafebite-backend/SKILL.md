---
name: cafebite-backend
description: >
  CafeBite backend development standards. ALWAYS use this skill for any backend task —
  creating modules, controllers, services, repositories, validators, routes, middleware,
  error handling, database queries, or API design. Covers the 5-layer architecture,
  module folder structure, import rules, naming conventions, auth/subscription middleware,
  RESTful API design, and agent execution checklist. Trigger on: "create module",
  "add endpoint", "add controller", "add service", "add repository", "add validator",
  "add route", "backend task", "API endpoint", "fix controller", "fix service",
  or any Express/backend work in CafeBite.
---

# CafeBite Backend Development Skill

Every AI agent working on CafeBite backend MUST follow this skill before writing code.

## Quick Reference Index

| Topic | Section |
|-------|---------|
| 5-layer architecture | [→ Architecture](#architecture) |
| Module folder structure | [→ Module Structure](#module-structure) |
| Import rules | [→ Import Rules](#import-rules) |
| Naming conventions | [→ Naming](#naming-conventions) |
| Error handling | [→ Errors](#error-handling) |
| Auth & subscription | [→ Middleware](#middleware) |
| Database patterns | [→ Database](#database-patterns) |
| API response format | [→ Response](#response-format) |
| Agent checklist | [→ Checklist](#agent-execution-checklist) |

For detailed patterns and examples, see `references/` files:
- `references/folder-structure.md` — complete folder tree
- `references/module-development.md` — step-by-step module creation
- `references/code-patterns.md` — layer responsibilities, anti-patterns
- `references/middleware.md` — auth, subscription, validation
- `references/database.md` — query patterns, transactions, migrations
- `references/error-handling.md` — HttpError, error codes, flow
- `references/authentication.md` — JWT, sessions, cookies
- `references/api-conventions.md` — RESTful routes, status codes
- `references/testing.md` — test patterns, checklist
- `references/troubleshooting.md` — common errors and fixes

---

## Architecture

### 5-Layer Request Flow

```
Client Request
    ↓
app.js (CORS, JSON, cookies, rate-limit)
    ↓
src/routes/index.js (mounts /v1/*)
    ↓
{module}.routes.js (middleware chain)
    ↓
{module}.controller.js (HTTP handling, calls service)
    ↓
{module}.service.js (business logic, throws HttpError)
    ↓
{module}.repository.js (raw SQL queries)
    ↓
MySQL2 (via query.utils.js)
```

### Layer Responsibilities

| Layer | Does | Does NOT |
|-------|------|----------|
| **Routes** | Define endpoints, apply middleware, delegate to controller | Contain logic |
| **Controller** | Handle HTTP req/res, extract params, call service | Contain business logic |
| **Service** | Business logic, orchestration, throw HttpError | Access req/res |
| **Repository** | Database queries, return raw data | Contain business logic |
| **Validator** | Input validation rules (express-validator) | Contain business logic |

---

## Module Structure

### Mandatory Folder Layout

Every feature module MUST follow this structure:

```
src/modules/{module}/
├── {module}.routes.js        # Express Router, middleware chain
├── {module}.controller.js    # HTTP handling, asyncHandler wrapper
├── {module}.service.js       # Business logic, throws HttpError
├── {module}.repository.js    # Raw SQL, returns raw results
└── {module}.validator.js     # express-validator rules
```

### Module Naming

- Folder: kebab-case, singular (`category/`, `menu-item/`, `order-item/`)
- Files: `{module}.{layer}.js` (`category.service.js`, `menu-item.controller.js`)

### Reference Modules

| Module | Use When | Why |
|--------|----------|-----|
| **category** | Simple CRUD | Cleanest minimal module, 5 files |
| **menu-item** | CRUD with file uploads | Shows Multer + Sharp + MinIO |
| **feedback** | Multi-table, nested resources | Pagination, filtering, images |
| **customer-menu** | Public endpoints (no auth) | Subscription check in service |

---

## Import Rules

### Inside a Module (src/modules/{module}/)

```javascript
// Same module → ./
import * as categoryService from "./category.service.js";

// Utils → ../../utils/
import query from "../../utils/query.utils.js";
import { HttpError } from "../../utils/errorHelper.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createUniqueId } from "../../utils/utils.js";

// Middleware → ../../middleware/
import { authMiddleware } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

// Providers → ../../providers/
import { uploadObject } from "../../providers/minio/minio.provider.js";

// Another module → ../{other-module}/
import { checkSubscriptionStatus } from "../subscription/subscription.service.js";
```

### Import Path Depth

```
src/modules/{module}/{module}.controller.js
  → ./                           → same module folder
  → ../../utils/                 → src/utils/
  → ../../middleware/            → src/middleware/
  → ../../providers/             → src/providers/
  → ../{other-module}/           → src/modules/{other-module}/
```

---

## Naming Conventions

### Files and Folders

| Type | Convention | Example |
|------|-----------|---------|
| Module folders | kebab-case, singular | `category/`, `menu-item/` |
| Module files | `{module}.{layer}.js` | `category.service.js` |
| Provider files | `{service}.provider.js` | `minio.provider.js` |
| Middleware files | `{name}.middleware.js` | `auth.middleware.js` |

### Variables and Functions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `clientId`, `menuItemId` |
| Functions | camelCase, verb prefix | `fetchAllCategories`, `createOrder` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `COOKIE_OPTIONS` |
| Database columns | snake_case | `client_id`, `created_at` |

### Function Verb Prefixes

| Verb Prefix | Use For | Example |
|-------------|---------|---------|
| `fetch` | Reading/getting data | `fetchAllCategories`, `fetchUserById` |
| `create` | Creating new records | `createCategory`, `createOrder` |
| `update` | Modifying existing records | `updateCategory`, `updateStatus` |
| `find` | DB lookups (repository) | `findCategoryById`, `findAllOrders` |
| `check` | Boolean checks | `checkDuplicateName`, `checkPermission` |
| `validate` | Validation logic | `validateInput`, `validateOwnership` |
| `process` | Complex operations | `processImageUpload`, `processPayment` |
| `handle` | Event/error handling | `handleError`, `handleWebhook` |

### Route Paths (MANDATORY)

Route paths MUST be RESTful resource nouns in kebab-case. NEVER mirror controller function names.

```javascript
// CORRECT
router.get("/", controller.fetchAllCategories);           // GET /categories
router.get("/:categoryId", controller.fetchCategoryById); // GET /categories/:id
router.post("/", controller.createCategory);              // POST /categories
router.put("/:categoryId", controller.updateCategory);    // PUT /categories/:id

// WRONG
router.post("/createCategory", controller.createCategory);     // verb in path
router.get("/getAllCategories", controller.fetchAllCategories); // function name as path
```

---

## Error Handling

### HttpError Class

```javascript
import { HttpError } from "../../utils/errorHelper.js";

// Basic error
throw new HttpError("Category not found", 404);

// With error code
throw new HttpError("User not found", 404, "USER_NOT_FOUND");
```

### Error Flow

```
Service throws HttpError
    ↓
asyncHandler catches error → next(error)
    ↓
Global error handler in app.js
    ↓
JSON response: { success: false, code: "...", message: "..." }
```

### Controller Pattern (asyncHandler)

```javascript
import { asyncHandler } from "../../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const { name } = req.body;
    const response = await categoryService.createCategory(userId, name);
    return res.status(201).json(response);
});
```

### Service Pattern (throw HttpError)

```javascript
export const createCategory = async (userId, name) => {
    if (!name) throw new HttpError("Name is required", 400);

    const [exists] = await categoryRepository.findByName(userId, name);
    if (exists?.total > 0) throw new HttpError("Category already exists", 400);

    const result = await categoryRepository.create(...);
    if (result?.affectedRows === 0) throw new HttpError("Failed to create", 500);

    return { status: "success", message: "Created" };
};
```

### Repository Pattern (no error handling)

```javascript
export const createCategory = async (categoryId, userId, name, connection = null) => {
    const sql = `INSERT INTO categories (unique_id, client_id, name) VALUES (?, ?, ?)`;
    return await query(sql, [categoryId, userId, name], connection);
};
```

---

## Middleware

### Middleware Chain Patterns

| Scenario | Chain |
|----------|-------|
| Public endpoint | `validator → validate → controller` |
| Auth required | `authMiddleware → validator → validate → controller` |
| Auth + subscription | `authMiddleware → subscriptionMiddleware → validator → validate → controller` |
| No validation needed | `authMiddleware → controller` |

### Middleware Order (MANDATORY)

```javascript
// CORRECT ORDER
router.post("/",
    authMiddleware,              // 1. Auth first (sets req.user)
    subscriptionMiddleware,      // 2. Subscription (needs req.user)
    createValidator,             // 3. Validator rules
    validate,                    // 4. Validate middleware
    controller.create            // 5. Controller
);
```

### authMiddleware

- Verifies JWT access token
- Auto-refreshes if expired using refresh token
- Sets `req.user` = decoded JWT payload

### subscriptionMiddleware

- Checks if client has active subscription
- Returns 405 if expired
- Requires `authMiddleware` to run first

### validate

- Checks express-validator results
- Returns 400 if validation fails
- Always use AFTER validator arrays and BEFORE controller

---

## Database Patterns

### Core Query Utility

```javascript
import query from "../../utils/query.utils.js";

// Simple query
const users = await query('SELECT * FROM users WHERE id = ?', [userId]);

// With connection (for transactions)
const result = await query('INSERT INTO orders ...', [data], connection);
```

### Transaction Pattern

```javascript
import { withTransaction } from "../../utils/query.utils.js";

export const createOrderWithItems = async (clientId, orderData, items) => {
    return await withTransaction(async (connection) => {
        const orderId = createUniqueId('ORD');
        const orderResult = await query(
            'INSERT INTO orders (unique_id, client_id, total) VALUES (?, ?, ?)',
            [orderId, clientId, orderData.total],
            connection
        );

        if (orderResult.affectedRows === 0) {
            throw new HttpError("Failed to create order", 500);
        }

        for (const item of items) {
            await query(
                'INSERT INTO order_items (order_id, item_name, price) VALUES (?, ?, ?)',
                [orderId, item.name, item.price],
                connection
            );
        }

        return { orderId };
    });
};
```

### Repository Rules

1. **Always include CREATE TABLE schema** in comments at top
2. **Always accept `connection = null`** as last parameter
3. **Use `?` placeholders** - never string interpolation
4. **Return raw results** - no error handling
5. **Import `query` from `../../utils/query.utils.js`**

---

## Response Format

### Success: GET

```json
{
    "success": true,
    "message": "Categories fetched successfully",
    "categories": [...],
    "status": "success"
}
```

### Success: POST

```json
{
    "status": "success",
    "message": "Category added successfully",
    "data": { "categoryId": "CAT_1234567890" }
}
```

### Success: PUT

```json
{
    "status": "success",
    "message": "Category updated successfully"
}
```

### Success: Paginated

```json
{
    "status": "success",
    "data": [...],
    "pagination": {
        "current_page": 1,
        "per_page": 10,
        "total": 45,
        "total_pages": 5
    }
}
```

### Error

```json
{
    "success": false,
    "code": "CATEGORY_NOT_FOUND",
    "message": "Category not found"
}
```

### HTTP Status Codes

| Code | Use When |
|------|----------|
| `200` | GET success, PUT success |
| `201` | POST success (resource created) |
| `400` | Validation error, invalid input, duplicate |
| `401` | Missing/invalid token, wrong password |
| `403` | Insufficient permissions |
| `404` | Resource doesn't exist |
| `405` | Subscription expired (project-specific) |
| `500` | Unexpected error, DB failure |

---

## Validator Pattern

```javascript
import { body, param, query } from "express-validator";

export const createCategoryValidator = [
    body("name")
        .notEmpty().withMessage("Category name is required")
        .isLength({ max: 255 }).withMessage("Max 255 characters")
        .trim(),
];

export const updateCategoryValidator = [
    param("categoryId")
        .notEmpty().withMessage("Category ID is required")
        .trim(),
    body("name")
        .notEmpty().withMessage("Category name is required")
        .isLength({ max: 255 }).withMessage("Max 255 characters")
        .trim(),
    body("status")
        .notEmpty().withMessage("Status is required")
        .isInt({ min: 0, max: 1 }).withMessage("Status must be 0 or 1"),
];
```

---

## Agent Execution Checklist

Before marking any backend task as done, verify every item:

### Structure
- [ ] Module folder created at `src/modules/{module-name}/` (singular, kebab-case)
- [ ] 5 files created: `validator.js`, `repository.js`, `service.js`, `controller.js`, `routes.js`
- [ ] Routes registered in `src/routes/index.js`
- [ ] Migration created in `src/db/migrations/` (if new table)

### Imports
- [ ] Same module imports use `./`
- [ ] Utils imports use `../../utils/`
- [ ] Middleware imports use `../../middleware/`
- [ ] Provider imports use `../../providers/`
- [ ] Other module imports use `../{other-module}/`

### Layer Responsibilities
- [ ] Controller uses `asyncHandler` wrapper
- [ ] Controller extracts user from `req.user`
- [ ] Controller calls service, returns JSON
- [ ] Service throws `HttpError` on failures
- [ ] Service checks `affectedRows` after INSERT/UPDATE/DELETE
- [ ] Repository returns raw results (no error handling)
- [ ] Repository includes CREATE TABLE schema in comments
- [ ] Repository accepts `connection = null` for transactions

### Naming
- [ ] Module folder is kebab-case, singular
- [ ] Files follow `{module}.{layer}.js` pattern
- [ ] Functions use verb prefixes (fetch, create, update, find, check, validate)
- [ ] Route paths are RESTful nouns (not function names)
- [ ] Route paths are kebab-case

### Middleware
- [ ] Correct middleware chain (auth → subscription → validator → validate → controller)
- [ ] `authMiddleware` on protected routes
- [ ] `subscriptionMiddleware` on subscription-gated routes
- [ ] `validate` after validator arrays
- [ ] Validator arrays before `validate`

### Error Handling
- [ ] Service throws `HttpError(message, statusCode, code)`
- [ ] Controller wrapped with `asyncHandler`
- [ ] No try-catch in controller (asyncHandler handles it)
- [ ] No error handling in repository

### Response Format
- [ ] GET returns `{ success: true, message, data, status }`
- [ ] POST returns `{ status: "success", message, data: { id } }`
- [ ] PUT returns `{ status: "success", message }`
- [ ] Error returns `{ success: false, code, message }`
- [ ] Correct HTTP status codes (200, 201, 400, 401, 403, 404, 500)

### Database
- [ ] Parameterized queries with `?` placeholders
- [ ] No string interpolation for values
- [ ] Transactions for multi-step operations
- [ ] `withTransaction()` used correctly

### Frontend Sync
- [ ] Frontend service file updated in `frontend/src/services/`
- [ ] API paths match between backend and frontend

---

## Common Anti-Patterns

### WRONG: Business Logic in Controller

```javascript
// BAD - controller has business logic
export const createCategory = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const { name } = req.body;

    // DON'T do this in controller!
    const [exists] = await query('SELECT COUNT(*) FROM categories WHERE name = ?', [name]);
    if (exists.total > 0) return res.status(400).json({ message: "Exists" });

    await query('INSERT INTO categories ...');
    return res.status(201).json({ message: "Created" });
});
```

### WRONG: Error Handling in Repository

```javascript
// BAD - repository catches errors
export const createCategory = async (data) => {
    try {
        return await query('INSERT INTO categories ...', [data]);
    } catch (error) {
        return { error: "Failed" };  // DON'T do this!
    }
};
```

### WRONG: Returning Errors from Service

```javascript
// BAD - service returns error instead of throwing
export const createCategory = async (userId, name) => {
    const result = await categoryRepository.create(userId, name);
    if (!result) {
        return { error: "Failed" };  // DON'T do this!
    }
    return { success: true };
};
```

### WRONG: Function Names as Routes

```javascript
// WRONG
router.post("/createCategory", controller.createCategory);     // verb in path
router.get("/getAllCategories", controller.fetchAllCategories); // function name as path
```

---

## References

- `references/folder-structure.md` — complete folder tree with explanations
- `references/module-development.md` — step-by-step module creation guide
- `references/code-patterns.md` — layer responsibilities, naming, anti-patterns
- `references/middleware.md` — auth, subscription, validation middleware
- `references/database.md` — query patterns, transactions, migrations
- `references/error-handling.md` — HttpError, error codes, flow
- `references/authentication.md` — JWT, sessions, cookies, OTP
- `references/api-conventions.md` — RESTful routes, status codes, response format
- `references/testing.md` — test structure, patterns, checklist
- `references/troubleshooting.md` — common errors and fixes
