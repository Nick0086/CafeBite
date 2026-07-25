# 06 - Error Handling

> HttpError class, error codes, response format, and error handling patterns.

---

## HttpError Class

**File**: `src/utils/errorHelper.js`

```javascript
export class HttpError extends Error {
    constructor(message, statusCode = 500, code = 'SERVER_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'HttpError';
    }
}
```

### Usage

```javascript
import { HttpError } from "../../utils/errorHelper.js";

// Basic error
throw new HttpError("Category not found", 404);

// With error code
throw new HttpError("User not found", 404, "USER_NOT_FOUND");

// With custom code
throw new HttpError("Invalid OTP", 401, "INVALID_OTP");
```

---

## Error Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Service throws HttpError                                   │
│  throw new HttpError("Not found", 404, "NOT_FOUND")        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  asyncHandler catches error → next(error)                   │
│  (req, res, next) => Promise.resolve(fn(...)).catch(next)  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Global error handler in app.js                             │
│  app.use((err, req, res, next) => { ... })                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  JSON response                                              │
│  { success: false, code: "NOT_FOUND", message: "..." }     │
└─────────────────────────────────────────────────────────────┘
```

---

## Global Error Handler

**File**: `app.js`

```javascript
app.use((err, req, res, next) => {
    const time = moment().tz('Asia/Kolkata').set({ second: 0 }).format('YYYY-MM-DD HH:mm:ss');
    console.log(`${time} :: Error in ${req.originalUrl}: `, err);

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

## asyncHandler

**File**: `src/utils/asyncHandler.js`

```javascript
export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

**Purpose**: Wraps async route handlers so thrown errors are caught and passed to the global error handler.

### Usage

```javascript
import { asyncHandler } from "../../utils/asyncHandler.js";

// CORRECT - errors caught by asyncHandler
export const fetchCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.fetchById(req.params.id);
    return res.status(200).json(category);
});

// WRONG - errors NOT caught
export const fetchCategory = async (req, res) => {
    const category = await categoryService.fetchById(req.params.id);
    return res.status(200).json(category);
};
```

---

## Error Response Format

### Standard Error Response

```json
{
    "success": false,
    "code": "CATEGORY_NOT_FOUND",
    "message": "Category not found"
}
```

### Validation Error Response

```json
{
    "success": false,
    "message": "Name is required; Status must be 0 or 1"
}
```

### Auth Error Response

```json
{
    "code": "UNAUTHORIZED",
    "message": "Access token expired, no refresh token provided"
}
```

---

## Common Error Codes

| Code | Status | Use When |
|------|--------|----------|
| `SERVER_ERROR` | 500 | Unexpected server error (default) |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `INVALID_CREDENTIALS` | 401 | Wrong password |
| `UNAUTHORIZED` | 401 | Missing/invalid token |
| `INVALID_OTP` | 401 | Wrong or expired OTP |
| `INVALID_TOKEN` | 401 | Invalid/expired reset token |
| `SUBSCRIPTION_EXPIRED` | 405 | Client subscription expired |
| `CATEGORY_NOT_FOUND` | 404 | Category doesn't exist |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `IMAGE_UPLOAD_ERROR` | 400 | File upload failed |
| `SESSION_CREATION_FAILED` | 500 | Couldn't create session |
| `OTP_STORE_FAILED` | 500 | Couldn't store OTP |
| `OTP_SEND_FAILED` | 500 | Couldn't send OTP |
| `EMAIL_SEND_FAILED` | 500 | Couldn't send email |

---

## Error Handling Patterns

### Pattern 1: Not Found

```javascript
export const fetchCategoryById = async (clientId, categoryId) => {
    const [category] = await categoryRepository.findCategoryById(clientId, categoryId);
    if (!category) {
        throw new HttpError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }
    return category;
};
```

### Pattern 2: Duplicate Check

```javascript
export const createCategory = async (clientId, name) => {
    const [exists] = await categoryRepository.findCategoryByName(clientId, name);
    if (exists?.total > 0) {
        throw new HttpError(`Category ${name} already exists`, 400);
    }
    // ... create
};
```

### Pattern 3: Failed Operation

```javascript
export const createCategory = async (clientId, name) => {
    const result = await categoryRepository.createCategory(categoryId, clientId, name, 1);
    if (result?.affectedRows === 0) {
        throw new HttpError("Failed to create category", 500);
    }
    return { status: "success", message: "Created" };
};
```

### Pattern 4: Permission Check

```javascript
export const updateCategory = async (clientId, categoryId, name) => {
    const [category] = await categoryRepository.findCategoryById(clientId, categoryId);
    if (!category) {
        throw new HttpError("Category not found or you don't have permission", 404);
    }
    // ... update
};
```

### Pattern 5: Invalid Input

```javascript
export const createCategory = async (clientId, name) => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
        throw new HttpError("Category name must be a non-empty string", 400);
    }
    if (name.length > 255) {
        throw new HttpError("Category name must be less than 255 characters", 400);
    }
    // ... create
};
```

### Pattern 6: Subscription Check

```javascript
export const fetchMenuByTableId = async (userId, tableId) => {
    const isSubscribed = await checkSubscriptionStatus(userId);
    if (!isSubscribed) {
        throw new HttpError("Client subscription expired", 405, 'SUBSCRIPTION_EXPIRED');
    }
    // ... fetch
};
```

---

## HTTP Status Codes

| Code | Meaning | Use When |
|------|---------|----------|
| `200` | OK | GET success, PUT success |
| `201` | Created | POST success (resource created) |
| `400` | Bad Request | Validation error, invalid input, duplicate |
| `401` | Unauthorized | Missing/invalid token, wrong password |
| `402` | Payment Required | Session not active (used in auth) |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `405` | Method Not Allowed | Subscription expired (project-specific) |
| `500` | Internal Server Error | Unexpected error, DB failure |

---

## Controller Error Handling

Controllers use `asyncHandler` to catch errors. No try-catch needed:

```javascript
// CORRECT - asyncHandler catches errors
export const createCategory = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const { name } = req.body;
    const response = await categoryService.createCategory(userId, name);
    return res.status(201).json(response);
});

// WRONG - manual try-catch (unnecessary with asyncHandler)
export const createCategory = async (req, res) => {
    try {
        const response = await categoryService.createCategory(userId, name);
        return res.status(201).json(response);
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
};
```

---

## Service Error Handling

Services throw `HttpError`. They do NOT catch errors:

```javascript
// CORRECT - throw HttpError
export const createCategory = async (userId, name) => {
    if (!name) throw new HttpError("Name is required", 400);

    const [exists] = await categoryRepository.findByName(userId, name);
    if (exists?.total > 0) throw new HttpError("Already exists", 400);

    const result = await categoryRepository.create(userId, name);
    if (result?.affectedRows === 0) throw new HttpError("Failed", 500);

    return { status: "success" };
};

// WRONG - return error object
export const createCategory = async (userId, name) => {
    const result = await categoryRepository.create(userId, name);
    if (!result) {
        return { error: "Failed" };  // DON'T DO THIS
    }
    return { success: true };
};
```

---

## Repository Error Handling

Repositories do NOT handle errors. They let errors propagate:

```javascript
// CORRECT - no error handling
export const createCategory = async (categoryId, userId, name, connection = null) => {
    const sql = `INSERT INTO categories (unique_id, client_id, name) VALUES (?, ?, ?)`;
    return await query(sql, [categoryId, userId, name], connection);
};

// WRONG - catches errors
export const createCategory = async (categoryId, userId, name) => {
    try {
        return await query('INSERT INTO categories ...');
    } catch (error) {
        console.error(error);
        return null;  // DON'T DO THIS
    }
};
```
