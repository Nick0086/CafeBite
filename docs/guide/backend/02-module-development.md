# 02 - Module Development

> Step-by-step guide to create a new feature module. Use the `category` module as your copy-paste starting point.

---

## Pre-Coding Checklist

Before you write any code, answer these:

- [ ] What is the module name? (singular, kebab-case: `order-item`, not `orderItems`)
- [ ] What HTTP methods? (GET / POST / PUT / DELETE)
- [ ] What are the endpoint paths? (RESTful nouns: `/orders`, not `/getOrders`)
- [ ] What request parameters? (body, query, path params)
- [ ] What is the expected response format?
- [ ] Does this require authentication? (`authMiddleware`)
- [ ] Does this require subscription check? (`subscriptionMiddleware`)
- [ ] What database tables will be affected?
- [ ] Is this operation atomic or multi-step (needs transaction)?

---

## Step 1: Create the Module Folder

```bash
mkdir -p backend/src/modules/{module-name}
```

Example:
```bash
mkdir -p backend/src/modules/order
```

---

## Step 2: Validator (5 min)

**File**: `src/modules/{module}/{module}.validator.js`

Validators define what input your endpoints accept. One array per endpoint.

### Template

```javascript
import { body, param, query } from "express-validator";

export const create{{Feature}}Validator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ max: 255 }).withMessage("Max 255 characters")
        .trim(),
    body("status")
        .optional()
        .isIn(["ACTIVE", "INACTIVE"]).withMessage("Invalid status"),
];

export const update{{Feature}}Validator = [
    param("{{feature}}Id")
        .notEmpty().withMessage("ID is required")
        .trim(),
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ max: 255 }).withMessage("Max 255 characters")
        .trim(),
    body("status")
        .notEmpty().withMessage("Status is required")
        .isInt({ min: 0, max: 1 }).withMessage("Status must be 0 or 1"),
];
```

### Real Example: `category.validator.js`

```javascript
import { body, param } from "express-validator";

export const createCategoryValidator = [
    body("name")
        .notEmpty().withMessage("Category name is required")
        .isLength({ max: 255 }).withMessage("Max 255 characters")
        .trim()
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
        .isInt({ min: 0, max: 1 }).withMessage("Status must be 0 or 1")
];
```

### Common Validator Patterns

| Validation | Code |
|-----------|------|
| Required string | `body("name").notEmpty().withMessage("...").trim()` |
| Max length | `.isLength({ max: 255 }).withMessage("...")` |
| Email format | `body("email").isEmail().withMessage("...").normalizeEmail()` |
| Number range | `body("price").isFloat({ min: 0 }).withMessage("...")` |
| Enum values | `body("status").isIn(["A", "B"]).withMessage("...")` |
| UUID format | `param("id").isUUID().withMessage("...")` |
| Optional field | `body("description").optional().trim()` |
| Min/max int | `body("page").isInt({ min: 1, max: 100 }).withMessage("...")` |

---

## Step 3: Repository (10 min)

**File**: `src/modules/{module}/{module}.repository.js`

Repositories contain ONLY database queries. They return raw results.

### Template

```javascript
/*
    Database Schema
    ===============
    CREATE TABLE {{features}} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unique_id CHAR(36) NOT NULL UNIQUE,
        client_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        status INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
    );
*/

import query from "../../utils/query.utils.js";

export const findAll{{Features}} = async (clientId, connection = null) => {
    const sql = `SELECT * FROM {{features}} WHERE client_id = ?`;
    return await query(sql, [clientId], connection);
};

export const find{{Feature}}ById = async (clientId, {{feature}}Id, connection = null) => {
    const sql = `SELECT * FROM {{features}} WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [clientId, {{feature}}Id], connection);
};

export const create{{Feature}} = async ({{feature}}Id, clientId, name, status, connection = null) => {
    const sql = `INSERT INTO {{features}} (unique_id, client_id, name, status) VALUES (?, ?, ?, ?)`;
    return await query(sql, [{{feature}}Id, clientId, name, status], connection);
};

export const update{{Feature}} = async (clientId, {{feature}}Id, name, status, connection = null) => {
    const sql = `UPDATE {{features}} SET name = ?, status = ? WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [name, status, clientId, {{feature}}Id], connection);
};
```

### Real Example: `category.repository.js`

```javascript
/*
    Database Schema
    ===============
    CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unique_id CHAR(36) NOT NULL UNIQUE,
        client_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        status INT DEFAULT 1,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
    );
*/

import query from "../../utils/query.utils.js";

export const findAllCategories = async (userId, connection = null) => {
    const sql = `
        SELECT categories.*, COUNT(menu_items.id) AS menu_item_count
        FROM categories
        LEFT JOIN menu_items ON categories.unique_id = menu_items.category_id
        WHERE categories.client_id = ?
        GROUP BY categories.id
    `;
    return await query(sql, [userId], connection);
};

export const findCategoryByName = async (userId, name, categoryId, connection = null) => {
    let sql = 'SELECT COUNT(*) AS total FROM categories WHERE client_id = ? AND name = ?';
    let values = [userId, name.trim()];
    if (categoryId) {
        sql += ' AND unique_id != ?';
        values.push(categoryId);
    }
    return await query(sql, values, connection);
};

export const createCategory = async (categoryId, userId, name, status, position, connection = null) => {
    const sql = `INSERT INTO categories (unique_id, client_id, name, status, position) VALUES (?, ?, ?, ?, ?)`;
    return await query(sql, [categoryId, userId, name.trim(), status, position], connection);
};
```

### Repository Rules

1. **Always include CREATE TABLE schema** in comments at the top
2. **Always accept `connection = null`** as last parameter (for transactions)
3. **Use `?` placeholders** - never string interpolation for values
4. **Return raw results** - no error handling, no business logic
5. **Import `query` from `../../utils/query.utils.js`**

---

## Step 4: Service (10 min)

**File**: `src/modules/{module}/{module}.service.js`

Services contain ALL business logic. They throw `HttpError` on failures.

### Template

```javascript
import * as {{module}}Repository from "./{{module}}.repository.js";
import { createUniqueId } from "../../utils/utils.js";
import { HttpError } from "../../utils/errorHelper.js";

export const fetchAll{{Features}} = async (clientId) => {
    const results = await {{module}}Repository.findAll{{Features}}(clientId);
    return {
        success: true,
        message: results?.length > 0 ? "{{Features}} fetched successfully" : "No {{features}} found.",
        {{features}}: results || [],
        status: "success"
    };
};

export const create{{Feature}} = async (clientId, name) => {
    // Input validation (belt-and-suspenders with validator)
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new HttpError("Name is required", 400);
    }

    // Business rule: check duplicates
    const [existing] = await {{module}}Repository.find{{Feature}}ByName(clientId, name);
    if (existing?.total > 0) {
        throw new HttpError(`{{Feature}} ${name} already exists`, 400);
    }

    // Create
    const {{feature}}Id = createUniqueId('{{PREFIX}}');
    const result = await {{module}}Repository.create{{Feature}}({{feature}}Id, clientId, name.trim(), 1);

    if (result?.affectedRows > 0) {
        return { status: "success", message: `{{Feature}} created`, data: { {{feature}}Id } };
    }
    throw new HttpError("Failed to create {{feature}}", 500);
};
```

### Real Example: `category.service.js`

```javascript
import * as categoryRepository from "./category.repository.js";
import { createUniqueId } from "../../utils/utils.js";
import { HttpError } from "../../utils/errorHelper.js";

export const fetchAllCategories = async (userId) => {
    const categories = await categoryRepository.findAllCategories(userId);
    return {
        success: true,
        message: categories?.length > 0 ? "Categories fetched successfully" : "No categories found.",
        categories: categories || [],
        status: "success"
    };
};

export const createCategory = async (userId, name) => {
    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        throw new HttpError("Category name must be a non-empty string and less than 255 characters", 400);
    }

    const [categoryExists] = await categoryRepository.findCategoryByName(userId, name);
    if (categoryExists?.total > 0) {
        throw new HttpError(`Category ${name} already exists`, 400);
    }

    const [categoryCountResult] = await categoryRepository.countCategories(userId);
    const position = (parseInt(categoryCountResult?.total || 0) || 0) + 1;
    const categoryId = createUniqueId('CAT');

    const result = await categoryRepository.createCategory(categoryId, userId, name, 1, position);
    if (result?.affectedRows > 0) {
        return { status: "success", message: `Category ${name} added successfully`, data: { categoryId } };
    }
    throw new HttpError(`Failed to add category ${name}`, 500);
};
```

### Service Rules

1. **All functions async**
2. **Throw `HttpError(message, statusCode, code)`** - never return errors
3. **Check `affectedRows`** after INSERT/UPDATE/DELETE
4. **Use `withTransaction()`** for multi-step operations
5. **Import repository from same folder**: `./category.repository.js`
6. **Import utils from `../../utils/`**

### Transaction Pattern

```javascript
import { withTransaction } from "../../utils/query.utils.js";

export const createOrderWithItems = async (clientId, orderData, items) => {
    return await withTransaction(async (connection) => {
        const orderId = createUniqueId('ORD');
        const orderResult = await orderRepository.createOrder(orderId, clientId, orderData, connection);
        if (orderResult.affectedRows === 0) throw new HttpError("Failed to create order", 500);

        for (const item of items) {
            await orderItemRepository.createOrderItem(orderId, item, connection);
        }
        return { orderId };
    });
};
```

---

## Step 5: Controller (5 min)

**File**: `src/modules/{module}/{module}.controller.js`

Controllers handle HTTP req/res. They extract data from `req`, call service, return JSON.

### Template

```javascript
import * as {{module}}Service from "./{{module}}.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const fetchAll{{Features}} = asyncHandler(async (req, res) => {
    const { unique_id: clientId } = req.user;
    const response = await {{module}}Service.fetchAll{{Features}}(clientId);
    return res.status(200).json(response);
});

export const create{{Feature}} = asyncHandler(async (req, res) => {
    const { unique_id: clientId } = req.user;
    const { name } = req.body;
    const response = await {{module}}Service.create{{Feature}}(clientId, name);
    return res.status(201).json(response);
});

export const update{{Feature}} = asyncHandler(async (req, res) => {
    const { unique_id: clientId } = req.user;
    const { name, status } = req.body;
    const { {{feature}}Id } = req.params;
    const response = await {{module}}Service.update{{Feature}}(clientId, {{feature}}Id, name, status);
    return res.status(200).json(response);
});
```

### Real Example: `category.controller.js`

```javascript
import * as categoryService from "./category.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const fetchAllCategories = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const response = await categoryService.fetchAllCategories(userId);
    return res.status(200).json(response);
});

export const createCategory = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const { name } = req.body;
    const response = await categoryService.createCategory(userId, name);
    return res.status(201).json(response);
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const { name, status } = req.body;
    const { categoryId } = req.params;
    const response = await categoryService.updateCategory(userId, categoryId, name, status);
    return res.status(200).json(response);
});
```

### Controller Rules

1. **Always wrap with `asyncHandler`** - catches errors and passes to global error handler
2. **Extract user from `req.user`** - set by `authMiddleware`
3. **Extract data from `req.body`, `req.params`, `req.query`**
4. **Call service, return JSON** - no business logic here
5. **Use correct HTTP status codes**: 200 (GET/PUT success), 201 (POST success)

---

## Step 6: Routes (2 min)

**File**: `src/modules/{module}/{module}.routes.js`

Routes wire middleware chains and endpoint definitions.

### Template

```javascript
import { Router } from "express";
import * as {{module}}Controller from "./{{module}}.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { subscriptionMiddleware } from "../../middleware/subcription.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { create{{Feature}}Validator, update{{Feature}}Validator } from "./{{module}}.validator.js";

const router = Router();

router.get("/", authMiddleware, subscriptionMiddleware, {{module}}Controller.fetchAll{{Features}});
router.post("/", authMiddleware, subscriptionMiddleware, create{{Feature}}Validator, validate, {{module}}Controller.create{{Feature}});
router.put("/:{{feature}}Id", authMiddleware, subscriptionMiddleware, update{{Feature}}Validator, validate, {{module}}Controller.update{{Feature}});

export default router;
```

### Real Example: `category.routes.js`

```javascript
import { Router } from "express";
import * as categoryController from "./category.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { subscriptionMiddleware } from "../../middleware/subcription.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createCategoryValidator, updateCategoryValidator } from "./category.validator.js";

const router = Router();

router.get("/", authMiddleware, subscriptionMiddleware, categoryController.fetchAllCategories);
router.post("/", authMiddleware, subscriptionMiddleware, createCategoryValidator, validate, categoryController.createCategory);
router.put("/:categoryId", authMiddleware, subscriptionMiddleware, updateCategoryValidator, validate, categoryController.updateCategory);

export default router;
```

### Middleware Chain Patterns

| Scenario | Chain |
|----------|-------|
| Public endpoint | `validator → validate → controller` |
| Auth required | `authMiddleware → validator → validate → controller` |
| Auth + subscription | `authMiddleware → subscriptionMiddleware → validator → validate → controller` |
| No validation needed | `authMiddleware → controller` |

---

## Step 7: Register Routes

Add to `src/routes/index.js`:

```javascript
import {{module}}Routes from '../modules/{{module}}/{{module}}.routes.js';

router.use('/{{module-path}}', {{module}}Routes);
```

Example:
```javascript
import orderRoutes from '../modules/order/order.routes.js';
router.use('/orders', orderRoutes);
```

---

## Step 8: Database Migration

Create `src/db/migrations/0XX_create_{{table}}_table.sql`:

```sql
-- @up
CREATE TABLE {{table}} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE {{table}};
```

Run:
```bash
npm run migrate:up
```

---

## Step 9: Verify

- [ ] All 5 files created in `src/modules/{module}/`
- [ ] Routes registered in `src/routes/index.js`
- [ ] Migration created and run
- [ ] Import paths correct (`../../utils/`, `../../middleware/`)
- [ ] Server starts without errors: `npm run dev`
- [ ] Test endpoints with curl/Postman

---

## Module Patterns Reference

### Simple CRUD (like `category`)

```
modules/{module}/
├── {module}.routes.js
├── {module}.controller.js
├── {module}.service.js
├── {module}.repository.js
└── {module}.validator.js
```

### With File Uploads (like `menu-item`)

Controller adds Multer setup:
```javascript
import multer from "multer";
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });
```

Service handles image processing with Sharp + MinIO upload.

### Multi-Table / Nested Resources (like `feedback`)

Repository has queries for multiple related tables.
Service orchestrates across tables.
Routes define nested paths: `/:feedback_id/comments/:comment_id`

### Public Endpoints (like `customer-menu`)

No `authMiddleware`. Subscription check done in service layer instead of middleware.
