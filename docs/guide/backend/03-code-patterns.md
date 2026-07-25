# 03 - Code Patterns

> Layer responsibilities, naming conventions, import rules, and architectural patterns used across all modules.

---

## The 5 Layers

```
┌─────────────────────────────────────────────────────────┐
│  ROUTES                                                  │
│  Define endpoints, apply middleware, delegate to ctrl   │
│  NO logic                                               │
├─────────────────────────────────────────────────────────┤
│  CONTROLLER                                              │
│  Handle HTTP req/res, extract params, call service      │
│  NO business logic                                      │
├─────────────────────────────────────────────────────────┤
│  SERVICE                                                 │
│  Business logic, orchestration, throw HttpError         │
│  NO access to req/res                                   │
├─────────────────────────────────────────────────────────┤
│  REPOSITORY                                              │
│  Database queries, return raw data                      │
│  NO business logic                                      │
├─────────────────────────────────────────────────────────┤
│  VALIDATOR                                               │
│  Input validation rules (express-validator)             │
│  Runs before controller                                 │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Does | Does NOT |
|-------|------|----------|
| **Routes** | Define endpoints, apply middleware chain, delegate to controller | Contain logic |
| **Controller** | Handle HTTP req/res, extract params, call service, return JSON | Contain business logic |
| **Service** | Business logic, validation, orchestration, throw errors | Access `req`/`res` |
| **Repository** | Database queries, return raw data | Contain business logic |
| **Validator** | Define input validation rules | Contain business logic |

---

## Request Flow

```
Client Request
   │
   ▼
app.js (CORS, JSON, cookies, rate-limit)
   │
   ▼
src/routes/index.js (mounts /v1/*)
   │
   ▼
{module}.routes.js (middleware chain)
   │
   ├── authMiddleware          → verifies JWT, sets req.user
   ├── subscriptionMiddleware  → checks active subscription
   ├── validator               → express-validator rules
   ├── validate                → checks validation results
   │
   ▼
{module}.controller.js
   │
   ├── extracts data from req.body, req.params, req.query
   ├── calls service function
   ├── returns JSON response
   │
   ▼
{module}.service.js
   │
   ├── business logic
   ├── calls repository
   ├── throws HttpError on failure
   │
   ▼
{module}.repository.js
   │
   ├── raw SQL queries
   ├── returns raw DB results
   │
   ▼
MySQL2 (via query.utils.js)
```

---

## Naming Conventions

### Files and Folders

| Type | Convention | Example |
|------|-----------|---------|
| Module folders | kebab-case, singular | `category/`, `menu-item/`, `order-item/` |
| Module files | `{module}.{layer}.js` | `category.service.js`, `menu-item.controller.js` |
| Provider files | `{service}.provider.js` | `minio.provider.js`, `twilio.provider.js` |
| Middleware files | `{name}.middleware.js` | `auth.middleware.js`, `validate.middleware.js` |

### Variables and Functions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `clientId`, `menuItemId`, `isActive` |
| Functions | camelCase, verb prefix | `fetchAllCategories`, `createOrder`, `updateStatus` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `COOKIE_OPTIONS` |
| Database columns | snake_case | `client_id`, `created_at`, `menu_item_count` |

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

### Route Paths

| Rule | Example |
|------|---------|
| RESTful resource nouns | `/categories`, `/menu-items`, `/orders` |
| kebab-case | `/menu-items`, not `/menuItems` |
| NEVER mirror function names | `/categories`, not `/getAllCategories` |
| HTTP method = action | `GET /categories` (not `POST /getCategories`) |

```javascript
// CORRECT
router.get("/", controller.fetchAllCategories);           // GET /categories
router.get("/:categoryId", controller.fetchCategoryById); // GET /categories/:id
router.post("/", controller.createCategory);              // POST /categories
router.put("/:categoryId", controller.updateCategory);    // PUT /categories/:id

// WRONG
router.post("/createCategory", controller.createCategory);     // verb in path
router.get("/getAllCategories", controller.fetchAllCategories); // function name as path
router.post("/getCategoryById/:id", controller.fetchById);     // GET action in POST
```

---

## Import Rules

### Inside a Module (`src/modules/{module}/`)

```javascript
// Same module files → ./
import * as categoryService from "./category.service.js";
import * as categoryRepository from "./category.repository.js";

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
  │
  ├── ./                           → same module folder
  ├── ../../utils/                 → src/utils/
  ├── ../../middleware/            → src/middleware/
  ├── ../../providers/             → src/providers/
  └── ../{other-module}/           → src/modules/{other-module}/
```

---

## Error Handling Pattern

### Service Throws

```javascript
// CORRECT - throw HttpError
export const createCategory = async (userId, name) => {
    if (!name) throw new HttpError("Name is required", 400);

    const [exists] = await categoryRepository.findByName(userId, name);
    if (exists?.total > 0) throw new HttpError("Category already exists", 400);

    const result = await categoryRepository.create(...);
    if (result?.affectedRows === 0) throw new HttpError("Failed to create", 500);

    return { status: "success", message: "Created" };
};
```

### Controller Catches via asyncHandler

```javascript
// asyncHandler wraps the function, catches errors → next()
export const createCategory = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const { name } = req.body;
    const response = await categoryService.createCategory(userId, name);
    return res.status(201).json(response);
});
```

### Global Error Handler (in `app.js`)

```javascript
app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    res.status(status).json({
        success: false,
        code,
        message: err.message || 'Internal server error'
    });
});
```

---

## Response Format

### Success Responses

```javascript
// GET - fetch data
{
    success: true,
    message: "Categories fetched successfully",
    categories: [...],
    status: "success"
}

// POST - create
{
    status: "success",
    message: "Category added successfully",
    data: { categoryId: "CAT_1234567890" }
}

// PUT - update
{
    status: "success",
    message: "Category updated successfully"
}
```

### Paginated Response

```javascript
{
    status: "success",
    data: [...],
    pagination: {
        current_page: 1,
        per_page: 10,
        total: 45,
        total_pages: 5
    }
}
```

### Error Response

```javascript
{
    success: false,
    code: "CATEGORY_NOT_FOUND",
    message: "Category not found"
}
```

---

## Database Query Patterns

### Basic Query

```javascript
import query from "../../utils/query.utils.js";

export const findAllCategories = async (userId, connection = null) => {
    const sql = `SELECT * FROM categories WHERE client_id = ?`;
    return await query(sql, [userId], connection);
};
```

### Transaction

```javascript
import { withTransaction } from "../../utils/query.utils.js";

export const createOrderWithItems = async (clientId, orderData, items) => {
    return await withTransaction(async (connection) => {
        const orderId = createUniqueId('ORD');
        await orderRepository.createOrder(orderId, clientId, orderData, connection);

        for (const item of items) {
            await orderItemRepository.createOrderItem(orderId, item, connection);
        }
        return { orderId };
    });
};
```

### Dynamic WHERE Clause

```javascript
export const findWithFilters = async (clientId, { status, type, search, page = 1, limit = 10 }) => {
    let whereClause = 'WHERE client_id = ?';
    let params = [clientId];

    if (status) { whereClause += ' AND status = ?'; params.push(status); }
    if (type) { whereClause += ' AND type = ?'; params.push(type); }
    if (search) { whereClause += ' AND name LIKE ?'; params.push(`%${search}%`); }

    const offset = (page - 1) * limit;
    const sql = `SELECT * FROM items ${whereClause} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return await query(sql, params);
};
```

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

### CORRECT: Service Throws, Controller Catches

```javascript
// Service throws
export const createCategory = async (userId, name) => {
    const result = await categoryRepository.create(userId, name);
    if (result?.affectedRows === 0) {
        throw new HttpError("Failed to create category", 500);
    }
    return { status: "success", message: "Created" };
};

// Controller wraps with asyncHandler
export const createCategory = asyncHandler(async (req, res) => {
    const response = await categoryService.createCategory(req.user.unique_id, req.body.name);
    return res.status(201).json(response);
});
```
