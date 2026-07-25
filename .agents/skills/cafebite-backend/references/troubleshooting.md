# 10 - Troubleshooting

> Common issues, error messages, and how to fix them.

---

## Startup Errors

### `Cannot find module '...'`

**Cause**: Wrong import path.

**Fix**: Check import depth from module location.

```javascript
// From src/modules/category/category.controller.js
// CORRECT
import query from "../../utils/query.utils.js";      // 2 levels up
import { authMiddleware } from "../../middleware/auth.middleware.js";

// WRONG
import query from "../utils/query.utils.js";          // 1 level up - wrong!
import query from "../../../utils/query.utils.js";    // 3 levels up - wrong!
```

**Quick Reference**:
```
src/modules/{module}/file.js
  → ../../utils/         (src/utils/)
  → ../../middleware/    (src/middleware/)
  → ../../providers/     (src/providers/)
  → ../other-module/     (src/modules/other-module/)
```

---

### `ECONNREFUSED` / Database Connection Failed

**Cause**: MySQL not running or wrong credentials.

**Fix**:
1. Check MySQL is running: `mysql -u root -p`
2. Verify `.env` credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=cafebite
   ```
3. Check database exists: `SHOW DATABASES;`

---

### `PORT already in use`

**Cause**: Another process using port 3002.

**Fix**:
```bash
# Find process
lsof -i :3002

# Kill it
kill -9 <PID>

# Or use different port
PORT=3003 npm run dev
```

---

## Runtime Errors

### `TypeError: Cannot read property 'unique_id' of undefined`

**Cause**: `req.user` is undefined - `authMiddleware` didn't run.

**Fix**: Add `authMiddleware` to route:
```javascript
// WRONG - missing authMiddleware
router.get("/", controller.fetchAll);

// CORRECT
router.get("/", authMiddleware, controller.fetchAll);
```

---

### `HttpError: Category not found` (404)

**Cause**: Record doesn't exist or `client_id` doesn't match.

**Fix**:
1. Check record exists in DB
2. Verify `client_id` matches `req.user.unique_id`
3. Check `unique_id` is correct (not `id`)

```javascript
// Repository should filter by client_id
const sql = `SELECT * FROM categories WHERE client_id = ? AND unique_id = ?`;
```

---

### `Cannot read property 'affectedRows' of undefined`

**Cause**: Query returned `undefined` instead of result object.

**Fix**: Check query is correct and table exists:
```javascript
// Add optional chaining
if (result?.affectedRows > 0) {
    return { status: "success" };
}
throw new HttpError("Failed", 500);
```

---

### Validation Not Working

**Cause**: Missing `validate` middleware after validator.

**Fix**:
```javascript
// WRONG - missing validate
router.post("/", authMiddleware, createValidator, controller.create);

// CORRECT
router.post("/", authMiddleware, createValidator, validate, controller.create);
```

---

### `TokenExpiredError: jwt expired`

**Cause**: Access token expired, no refresh token provided.

**Fix**:
1. Client should send refresh token in `user-data` header
2. Check refresh token exists in `client_sessions` table
3. Verify `REFRESH_TOKEN_EXPIRY` env variable

---

### `SUBSCRIPTION_EXPIRED` (405)

**Cause**: Client's subscription has expired.

**Fix**:
1. Check `client_subscriptions` table for active subscription
2. Verify `checkSubscriptionStatus()` logic
3. For testing, temporarily remove `subscriptionMiddleware` from route

---

## Database Errors

### `ER_DUP_ENTRY: Duplicate entry '...' for key '...'`

**Cause**: Trying to insert duplicate unique value.

**Fix**: Check for duplicates before insert:
```javascript
const [exists] = await categoryRepository.findCategoryByName(userId, name);
if (exists?.total > 0) {
    throw new HttpError("Category already exists", 400);
}
```

---

### `ER_BAD_FIELD_ERROR: Unknown column '...' in '...'`

**Cause**: Column doesn't exist in table.

**Fix**:
1. Check column name spelling
2. Run `DESCRIBE table_name;` to see actual columns
3. Run pending migrations: `npm run migrate:up`

---

### `ER_NO_REFERENCED_ROW_2: Cannot add or update a child row: a foreign key constraint fails`

**Cause**: Referenced record doesn't exist.

**Fix**: Check foreign key target exists:
```javascript
// Before creating menu item, check category exists
const [category] = await menuItemRepository.checkCategoryExists(categoryId, clientId);
if (!category) {
    throw new HttpError("Category not found", 400);
}
```

---

## File Upload Errors

### `IMAGE_UPLOAD_ERROR: Only JPEG And PNG files are allowed`

**Cause**: File type not in allowed list.

**Fix**: Check Multer config:
```javascript
const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG And PNG files are allowed'));
        }
        cb(null, true);
    }
});
```

---

### `File too large`

**Cause**: File exceeds `fileSize` limit.

**Fix**: Increase limit or compress image:
```javascript
const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
```

---

### MinIO Upload Failed

**Cause**: MinIO server not running or bucket doesn't exist.

**Fix**:
1. Check MinIO is running
2. Verify `.env` MinIO config:
   ```env
   MINIO_ENDPOINT=localhost
   MINIO_PORT=9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   MINIO_BUCKET=cafebite
   ```
3. Bucket is auto-created on server start

---

## Migration Errors

### Migration fails halfway

**Cause**: SQL syntax error or constraint violation.

**Fix**:
1. Check error message for SQL issue
2. Fix migration file
3. Run `npm run migrate:up` again (failed migration won't be recorded)

---

### Need to re-run a migration

**Fix**:
```bash
npm run migrate:down     # Rollback last migration
# Fix migration file
npm run migrate:up       # Re-execute
```

---

### `Table already exists`

**Cause**: Migration ran before but wasn't recorded.

**Fix**:
1. Manually insert into migrations table:
   ```sql
   INSERT INTO migrations (name, executed_at) VALUES ('001_create_clients_table.sql', NOW());
   ```
2. Or drop table and re-run migration

---

## Auth Errors

### `UNAUTHORIZED: No tokens provided`

**Cause**: Missing `Authorization` header.

**Fix**: Client must send:
```javascript
headers: {
    'Authorization': 'Bearer <accessToken>',
    'user-data': '<refreshToken>'
}
```

---

### Cookies Not Being Set

**Cause**: `sameSite` or `secure` flag mismatch.

**Fix**: Check `NODE_ENV`:
```javascript
// Development
NODE_ENV=DEV  // secure: false, sameSite: true

// Production
NODE_ENV=production  // secure: true, sameSite: 'None'
```

---

## Common Debugging Steps

### 1. Check Server Logs

```bash
npm run dev
# Watch console for errors
```

### 2. Check Database

```sql
-- Check if record exists
SELECT * FROM categories WHERE unique_id = 'CAT_123';

-- Check table structure
DESCRIBE categories;

-- Check foreign keys
SHOW CREATE TABLE categories;
```

### 3. Check Request

```bash
# Use curl to test
curl -X GET http://localhost:3002/v1/category \
  -H "Authorization: <token>" \
  -H "user-data: <refresh>"
```

### 4. Check Environment

```bash
# Print env variables
node -e "console.log(process.env.DB_HOST)"
```

### 5. Check Import Paths

```bash
# Verify file exists
ls src/utils/query.utils.js

# Check import depth
# From src/modules/category/category.controller.js
# → ../../utils/query.utils.js (2 levels up)
```

---

## Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Import error | Check `../../` depth from module |
| 401 Unauthorized | Add `authMiddleware` to route |
| 404 Not Found | Check `client_id` filter in query |
| Validation not working | Add `validate` after validator |
| DB connection failed | Check `.env` and MySQL running |
| Port in use | `kill -9 <PID>` or change `PORT` |
| Migration failed | Fix SQL, run `npm run migrate:up` again |
| Subscription expired | Check `client_subscriptions` table |
| File upload failed | Check Multer config and file type |
| MinIO failed | Check MinIO server and `.env` config |
