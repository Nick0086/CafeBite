# 04 - Middleware

> Auth, subscription, and validation middleware - how they work and when to use each.

---

## Middleware Overview

```
┌──────────────────────────────────────────────────────────────┐
│  Request enters app.js                                       │
│  → CORS, JSON parsing, cookie-parser, rate-limit             │
│  → /v1/* routes                                              │
│                                                              │
│  Module routes apply middleware chain:                       │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────┐      │
│  │ authMiddleware│→│ subscriptionMW   │→│ validator │→ ...  │
│  └─────────────┘  └──────────────────┘  └───────────┘      │
│                                                              │
│  → validate → controller                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## `authMiddleware`

**File**: `src/middleware/auth.middleware.js`

**Purpose**: Verifies JWT access token, auto-refreshes if expired using refresh token.

**Sets**: `req.user` = decoded JWT payload (`{ unique_id, first_name, last_name, email, ... }`)

### How It Works

```
1. Reads access token from: Authorization header
2. Reads refresh token from: user-data header
3. If access token valid → decode → set req.user → next()
4. If access token expired:
   a. Check refresh token exists
   b. Verify refresh token in DB (client_sessions table)
   c. Generate new access token
   d. Set new access token in cookie
   e. Set req.user → next()
5. If both invalid → clear cookies → 401
```

### Cookie Options

```javascript
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'DEV' ? false : true,
    sameSite: process.env.NODE_ENV === 'DEV' ? true : 'None',
    path: '/',
};
```

### Usage

```javascript
// Protected route - requires authentication
router.get("/", authMiddleware, controller.fetchAll);

// With subscription check
router.get("/", authMiddleware, subscriptionMiddleware, controller.fetchAll);
```

### What `req.user` Contains

After `authMiddleware` runs, `req.user` contains:

```javascript
{
    unique_id: "CLI_1234567890",
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    mobile: "9876543210",
    // ... other client fields from JWT payload
}
```

---

## `subscriptionMiddleware`

**File**: `src/middleware/subcription.middleware.js`

**Purpose**: Checks if the authenticated client has an active subscription. Returns 405 if expired.

**Requires**: `authMiddleware` to run first (needs `req.user.unique_id`)

### How It Works

```
1. Gets clientId from req.user.unique_id
2. Calls checkSubscriptionStatus(clientId) from subscription service
3. If subscribed → next()
4. If not subscribed → 405 { code: 'SUBSCRIPTION_EXPIRED', message: '...' }
```

### Usage

```javascript
// Auth + subscription required
router.get("/", authMiddleware, subscriptionMiddleware, controller.fetchAll);
router.post("/", authMiddleware, subscriptionMiddleware, createValidator, validate, controller.create);
router.put("/:id", authMiddleware, subscriptionMiddleware, updateValidator, validate, controller.update);
```

### When to Use

| Scenario | Middleware |
|----------|-----------|
| Public endpoint (customer menu) | None |
| Auth only (feedback, profile) | `authMiddleware` |
| Auth + subscription (category, menu-item, table, template) | `authMiddleware → subscriptionMiddleware` |

---

## `validate`

**File**: `src/middleware/validate.middleware.js`

**Purpose**: Checks express-validator results. Returns 400 if validation fails.

### How It Works

```javascript
import { validationResult } from 'express-validator';

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array().map(e => e.msg).join('; ')
        });
    }
    next();
};
```

### Usage

Always use AFTER validator arrays and BEFORE the controller:

```javascript
router.post("/",
    authMiddleware,
    subscriptionMiddleware,
    createCategoryValidator,    // ← validator array (express-validator rules)
    validate,                   // ← checks results, returns 400 if errors
    categoryController.create   // ← only reached if validation passes
);
```

---

## Middleware Chain Patterns

### Pattern 1: Public Endpoint (No Auth)

```javascript
// Example: customer-menu module
router.get("/template/:userId/:tableId", getMenuByTableValidator, validate, controller.fetchMenuByTableId);
```

```
Request → validator → validate → controller
```

### Pattern 2: Auth Required

```javascript
// Example: feedback module
router.get("/", authMiddleware, controller.fetchClientFeedback);
```

```
Request → authMiddleware → controller
```

### Pattern 3: Auth + Subscription

```javascript
// Example: category module
router.get("/", authMiddleware, subscriptionMiddleware, controller.fetchAllCategories);
```

```
Request → authMiddleware → subscriptionMiddleware → controller
```

### Pattern 4: Auth + Subscription + Validation

```javascript
// Example: category module (POST)
router.post("/", authMiddleware, subscriptionMiddleware, createCategoryValidator, validate, controller.createCategory);
```

```
Request → authMiddleware → subscriptionMiddleware → validator → validate → controller
```

### Pattern 5: Auth + Validation (No Subscription)

```javascript
// Example: feedback module (POST)
router.post("/", authMiddleware, createFeedbackValidator, validate, controller.createFeedback);
```

```
Request → authMiddleware → validator → validate → controller
```

---

## Middleware Order Matters

```javascript
// CORRECT ORDER
router.post("/",
    authMiddleware,              // 1. Auth first (sets req.user)
    subscriptionMiddleware,      // 2. Subscription (needs req.user)
    createValidator,             // 3. Validator rules (defines what to check)
    validate,                    // 4. Validate middleware (checks results)
    controller.create            // 5. Controller (only reached if all pass)
);

// WRONG ORDER
router.post("/",
    createValidator,             // ❌ Validator before auth
    authMiddleware,              // ❌ Auth after validator
    validate,
    controller.create
);
```

---

## Creating Custom Middleware

### Template

```javascript
export const myCustomMiddleware = async (req, res, next) => {
    try {
        // Get data from req (set by previous middleware)
        const clientId = req.user?.unique_id;

        if (!clientId) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user' });
        }

        // Do your check
        const isValid = await checkSomething(clientId);

        if (!isValid) {
            return res.status(403).json({ code: 'FORBIDDEN', message: 'Not allowed' });
        }

        next();
    } catch (error) {
        console.error('Middleware error:', error);
        return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Server error' });
    }
};
```

### Example: Role-Based Middleware

```javascript
export const adminOnly = async (req, res, next) => {
    const clientId = req.user?.unique_id;

    if (clientId !== process.env.SUPER_ADMIN_ID) {
        return res.status(403).json({ code: 'FORBIDDEN', message: 'Admin access required' });
    }

    next();
};

// Usage
router.get("/admin", authMiddleware, adminOnly, controller.fetchAll);
```

---

## Middleware File Location

| Type | Location |
|------|----------|
| Global middleware (auth, validate) | `src/middleware/` |
| Module-specific middleware | Inside module folder or `src/middleware/` |

**Rule**: If middleware is used by multiple modules, put it in `src/middleware/`. If it's specific to one module, it can live inside the module folder.
