# 08 - API Conventions

> RESTful route naming, HTTP methods, status codes, response format, and API design patterns.

---

## Route Naming Rules

### RESTful Resource Nouns

Routes describe **resources**, not actions. The HTTP method conveys the action.

```javascript
// CORRECT - RESTful nouns
router.get("/", controller.fetchAllCategories);           // GET /categories
router.get("/:categoryId", controller.fetchCategoryById); // GET /categories/:id
router.post("/", controller.createCategory);              // POST /categories
router.put("/:categoryId", controller.updateCategory);    // PUT /categories/:id
router.delete("/:categoryId", controller.removeCategory); // DELETE /categories/:id

// WRONG - action verbs in path
router.post("/createCategory", controller.createCategory);     // ❌ verb in path
router.get("/getAllCategories", controller.fetchAllCategories); // ❌ function name as path
router.get("/getCategoryById/:id", controller.fetchById);      // ❌ redundant verb
```

### kebab-case Paths

```javascript
// CORRECT
router.use('/menu-items', menuItemRoutes);    // kebab-case
router.use('/customer-menu', customerMenuRoutes);

// WRONG
router.use('/menuItems', menuItemRoutes);     // camelCase
router.use('/menu_items', menuItemRoutes);    // snake_case
```

---

## HTTP Methods

| Method | Use For | Idempotent | Response |
|--------|---------|-----------|----------|
| `GET` | Read/fetch data | Yes | 200 + data |
| `POST` | Create new resource | No | 201 + created data |
| `PUT` | Update existing resource | Yes | 200 + updated data |
| `DELETE` | Remove resource | Yes | 200 + success message |
| `PATCH` | Partial update | Yes | 200 + updated data |

---

## HTTP Status Codes

| Code | Meaning | Use When |
|------|---------|----------|
| `200` | OK | GET success, PUT success, DELETE success |
| `201` | Created | POST success (resource created) |
| `400` | Bad Request | Validation error, invalid input, duplicate |
| `401` | Unauthorized | Missing/invalid token, wrong password |
| `402` | Payment Required | Session not active (project-specific) |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `405` | Method Not Allowed | Subscription expired (project-specific) |
| `409` | Conflict | Duplicate resource |
| `422` | Unprocessable | Business rule violation |
| `500` | Internal Server Error | Unexpected error, DB failure |

---

## Response Format

### Success: GET (Fetch Data)

```json
{
    "success": true,
    "message": "Categories fetched successfully",
    "categories": [
        { "unique_id": "CAT_123", "name": "Starters", "status": 1 }
    ],
    "status": "success"
}
```

### Success: POST (Create)

```json
{
    "status": "success",
    "message": "Category added successfully",
    "data": {
        "categoryId": "CAT_1234567890"
    }
}
```

### Success: PUT (Update)

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

### Error: Validation

```json
{
    "success": false,
    "message": "Name is required; Status must be 0 or 1"
}
```

### Error: Not Found

```json
{
    "success": false,
    "code": "CATEGORY_NOT_FOUND",
    "message": "Category not found"
}
```

### Error: Auth

```json
{
    "code": "UNAUTHORIZED",
    "message": "Access token expired, no refresh token provided"
}
```

---

## Route Registration

All modules are registered in `src/routes/index.js`:

```javascript
import { Router } from 'express';
import categoryRoutes from '../modules/category/category.routes.js';
import menuItemRoutes from '../modules/menu-item/menu-item.routes.js';

const router = Router();

router.use('/category', categoryRoutes);    // → /v1/category
router.use('/menu', menuItemRoutes);        // → /v1/menu

export default router;
```

Mounted in `app.js`:

```javascript
app.use('/v1', apiRoutes);
```

---

## Route Patterns

### Pattern 1: Simple CRUD

```javascript
const router = Router();

router.get("/", authMiddleware, subscriptionMiddleware, controller.fetchAll);
router.post("/", authMiddleware, subscriptionMiddleware, createValidator, validate, controller.create);
router.put("/:id", authMiddleware, subscriptionMiddleware, updateValidator, validate, controller.update);

export default router;
```

### Pattern 2: Nested Resources

```javascript
// Feedback with comments
const router = Router();

// Feedback CRUD
router.post("/", authMiddleware, createFeedbackValidator, validate, controller.createFeedback);
router.get("/:feedback_id", authMiddleware, controller.fetchFeedbackById);

// Comments under feedback
router.post("/:feedback_id/comments", authMiddleware, addCommentValidator, validate, controller.createComment);
router.put("/:feedback_id/comments/:comment_id", authMiddleware, updateCommentValidator, validate, controller.updateComment);
router.delete("/:feedback_id/comments/:comment_id", authMiddleware, deleteCommentValidator, validate, controller.deleteComment);
```

### Pattern 3: Admin + Client Routes

```javascript
const router = Router();

// Admin routes (prefix with /admin)
router.get('/admin', authMiddleware, controller.fetchAllFeedback);
router.get('/admin/stats', authMiddleware, controller.fetchStats);
router.put('/admin/:id/status', authMiddleware, controller.updateStatus);

// Client routes
router.get('/', authMiddleware, controller.fetchClientFeedback);
router.post('/', authMiddleware, createValidator, validate, controller.createFeedback);
```

### Pattern 4: Public Endpoints

```javascript
// No authMiddleware
const router = Router();

router.get("/template/:userId/:tableId", getMenuByTableValidator, validate, controller.fetchMenuByTableId);
router.get("/category/:userId", getMenuCategoryValidator, validate, controller.fetchCategories);
```

---

## Route Params

| Source | Access | Example |
|--------|--------|---------|
| URL path | `req.params` | `/categories/:categoryId` → `req.params.categoryId` |
| Query string | `req.query` | `/items?page=1&limit=10` → `req.query.page` |
| Request body | `req.body` | POST body JSON → `req.body.name` |
| Headers | `req.headers` | `Authorization` → `req.headers['authorization']` |
| User (auth) | `req.user` | Set by authMiddleware → `req.user.unique_id` |
| Cookies | `req.cookies` | `req.cookies.accessToken` |
| Files | `req.file` / `req.files` | Set by Multer |

---

## Validator + Validate Pattern

```javascript
// Validator defines rules
export const createCategoryValidator = [
    body("name")
        .notEmpty().withMessage("Category name is required")
        .isLength({ max: 255 }).withMessage("Max 255 characters")
        .trim(),
    body("status")
        .optional()
        .isInt({ min: 0, max: 1 }).withMessage("Status must be 0 or 1"),
];

// Route applies validator THEN validate middleware
router.post("/",
    authMiddleware,
    subscriptionMiddleware,
    createCategoryValidator,    // ← defines rules
    validate,                   // ← checks results, returns 400 if errors
    controller.createCategory   // ← only reached if valid
);
```

---

## Controller Function Naming

| Action | Function Name | Example |
|--------|--------------|---------|
| Fetch all | `fetchAll{Resources}` | `fetchAllCategories` |
| Fetch one | `fetch{Resource}ById` | `fetchCategoryById` |
| Create | `create{Resource}` | `createCategory` |
| Update | `update{Resource}` | `updateCategory` |
| Delete | `remove{Resource}` / `delete{Resource}` | `removeCategory` |
| Custom action | `verb{Resource}` | `syncFilesToDatabase` |

---

## API Versioning

All routes are under `/v1/`:

```
GET  /v1/category
POST /v1/category
PUT  /v1/category/:categoryId
GET  /v1/menu
POST /v1/auth/user/check
```

---

## Real Examples from Codebase

### Category Module

```javascript
// Routes
router.get("/", authMiddleware, subscriptionMiddleware, categoryController.fetchAllCategories);
router.post("/", authMiddleware, subscriptionMiddleware, createCategoryValidator, validate, categoryController.createCategory);
router.put("/:categoryId", authMiddleware, subscriptionMiddleware, updateCategoryValidator, validate, categoryController.updateCategory);
```

### Feedback Module (Nested)

```javascript
// Routes
router.post('/', authMiddleware, createFeedbackValidator, validate, feedbackController.createFeedback);
router.get('/', authMiddleware, getClientFeedbackValidator, validate, feedbackController.fetchClientFeedback);
router.get('/:feedback_id', authMiddleware, feedbackController.fetchFeedbackById);
router.post('/:feedback_id/comments', authMiddleware, addCommentValidator, validate, feedbackController.createComment);
router.put('/:feedback_id/comments/:comment_id', authMiddleware, updateCommentValidator, validate, feedbackController.updateComment);
```

### Customer Menu (Public)

```javascript
// Routes - no authMiddleware
router.get("/template/:userId/:tableId", getMenuByTableValidator, validate, customerMenuController.fetchMenuByTableId);
router.get("/category/:userId", getMenuCategoryValidator, validate, customerMenuController.fetchMenuCategories);
```
