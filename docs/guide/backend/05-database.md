# 05 - Database

> Query patterns, transactions, migrations, and provider usage.

---

## Database Setup

**Config**: `src/config/db.js`

```javascript
import mysql from 'mysql2';

const pool = mysql.createPool({
    port: process.env.NODE_ENV === 'production' ? process.env.DB_PORT_PROD : process.env.DB_PORT,
    host: process.env.NODE_ENV === 'production' ? process.env.DB_HOST_PROD : process.env.DB_HOST,
    user: process.env.NODE_ENV === 'production' ? process.env.DB_USER_PROD : process.env.DB_USER,
    password: process.env.NODE_ENV === 'production' ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD,
    database: process.env.NODE_ENV === 'production' ? process.env.DB_NAME_PROD : process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    supportBigNumbers: true,
    bigNumberStrings: true,
});

const promisePool = pool.promise();
export default promisePool;
```

---

## Core Query Utility

**File**: `src/utils/query.utils.js`

### `query()` - Basic Query

```javascript
import query from "../../utils/query.utils.js";

// Simple query
const users = await query('SELECT * FROM users WHERE id = ?', [userId]);

// With connection (for transactions)
const result = await query('INSERT INTO orders ...', [data], connection);
```

**Features**:
- Auto-reconnect on `ECONNRESET` (3 retries, 1s delay)
- Returns raw rows array
- Accepts optional `connection` parameter for transactions

### `withTransaction()` - Multi-Step Operations

```javascript
import { withTransaction } from "../../utils/query.utils.js";

export const createOrderWithItems = async (clientId, orderData, items) => {
    return await withTransaction(async (connection) => {
        // All queries use the same connection
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
        // Auto-commit on success, auto-rollback on error
    });
};
```

---

## Repository Patterns

### Pattern 1: Simple CRUD

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
*/

import query from "../../utils/query.utils.js";

// FIND ALL
export const findAllCategories = async (clientId, connection = null) => {
    const sql = `SELECT * FROM categories WHERE client_id = ?`;
    return await query(sql, [clientId], connection);
};

// FIND BY ID
export const findCategoryById = async (clientId, categoryId, connection = null) => {
    const sql = `SELECT * FROM categories WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [clientId, categoryId], connection);
};

// CREATE
export const createCategory = async (categoryId, clientId, name, status, connection = null) => {
    const sql = `INSERT INTO categories (unique_id, client_id, name, status) VALUES (?, ?, ?, ?)`;
    return await query(sql, [categoryId, clientId, name, status], connection);
};

// UPDATE
export const updateCategory = async (clientId, categoryId, name, status, connection = null) => {
    const sql = `UPDATE categories SET name = ?, status = ? WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [name, status, clientId, categoryId], connection);
};

// DELETE
export const deleteCategory = async (clientId, categoryId, connection = null) => {
    const sql = `DELETE FROM categories WHERE client_id = ? AND unique_id = ?`;
    return await query(sql, [clientId, categoryId], connection);
};
```

### Pattern 2: Duplicate Check

```javascript
export const findCategoryByName = async (userId, name, excludeId = null, connection = null) => {
    let sql = 'SELECT COUNT(*) AS total FROM categories WHERE client_id = ? AND name = ?';
    let values = [userId, name.trim()];

    if (excludeId) {
        sql += ' AND unique_id != ?';
        values.push(excludeId);
    }

    return await query(sql, values, connection);
};

// Usage in service:
const [exists] = await categoryRepository.findCategoryByName(userId, name);
if (exists?.total > 0) {
    throw new HttpError("Category already exists", 400);
}
```

### Pattern 3: Dynamic WHERE Clause

```javascript
export const findWithFilters = async (clientId, filters, connection = null) => {
    const { status, type, search, page = 1, limit = 10 } = filters;

    let whereClause = 'WHERE client_id = ?';
    let params = [clientId];

    if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
    }
    if (type) {
        whereClause += ' AND type = ?';
        params.push(type);
    }
    if (search) {
        whereClause += ' AND (title LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    const offset = (page - 1) * limit;
    const sql = `SELECT * FROM items ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return await query(sql, params, connection);
};
```

### Pattern 4: JOIN Queries

```javascript
export const findAllMenuItems = async (clientId, connection = null) => {
    const sql = `
        SELECT menu_items.*, categories.name AS category_name
        FROM menu_items
        JOIN categories ON menu_items.category_id = categories.unique_id
        WHERE menu_items.client_id = ?
    `;
    return await query(sql, [clientId], connection);
};
```

### Pattern 5: Aggregation with COUNT

```javascript
export const findAllCategoriesWithItemCount = async (clientId, connection = null) => {
    const sql = `
        SELECT
            categories.*,
            COUNT(menu_items.id) AS menu_item_count
        FROM categories
        LEFT JOIN menu_items ON categories.unique_id = menu_items.category_id
        WHERE categories.client_id = ?
        GROUP BY categories.id
    `;
    return await query(sql, [clientId], connection);
};
```

### Pattern 6: Dynamic UPDATE Fields

```javascript
export const updateFeedbackById = async (feedbackId, clientId, updateFields, updateParams, connection = null) => {
    const sql = `UPDATE client_feedback SET ${updateFields.join(', ')}, updated_at = NOW() WHERE unique_id = ? AND client_id = ?`;
    return await query(sql, [...updateParams, feedbackId, clientId], connection);
};

// Usage in service:
let updateFields = [];
let updateParams = [];

if (type) { updateFields.push('type = ?'); updateParams.push(type); }
if (title) { updateFields.push('title = ?'); updateParams.push(title); }
if (description) { updateFields.push('description = ?'); updateParams.push(description); }

const result = await feedbackRepository.updateFeedbackById(feedbackId, clientId, updateFields, updateParams);
```

### Pattern 7: Statistics / Aggregation

```javascript
export const findFeedbackStats = async (clientId, isAdmin, connection = null) => {
    const clientCondition = isAdmin ? "" : 'WHERE client_id = ?';
    const value = isAdmin ? [] : [clientId];

    const sql = `
        SELECT
            COUNT(*) as total_feedback,
            SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
            SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
            AVG(client_satisfaction_rating) as avg_rating,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as last_30_days
        FROM client_feedback ${clientCondition}
    `;
    return await query(sql, value, connection);
};
```

---

## Repository Rules

1. **Always include CREATE TABLE schema** in comments at the top of the file
2. **Always accept `connection = null`** as the last parameter (for transactions)
3. **Use `?` placeholders** - never string interpolation for values
4. **Return raw results** - no error handling, no business logic
5. **Import `query` from `../../utils/query.utils.js`**
6. **Function names**: `find*`, `create*`, `update*`, `delete*`, `count*`

---

## Migration System

### Creating a Migration

Create `src/db/migrations/0XX_create_table_name.sql`:

```sql
-- @up
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE orders;
```

### Running Migrations

```bash
npm run migrate:up       # Run all pending migrations
npm run migrate:down     # Rollback last migration
npm run migrate:status   # Check migration status
```

### Migration Rules

1. **Never modify an executed migration** - create a new one
2. **Always include both `-- @up` and `-- @down`** sections
3. **Use sequential numbering**: `001_`, `002_`, etc.
4. **Test locally** before deploying
5. **One logical change per file**

---

## Providers

### MinIO / S3 (File Storage)

**File**: `src/providers/minio/minio.provider.js`

```javascript
import { uploadObject, getSignedUrl, deleteObject } from "../../providers/minio/minio.provider.js";

// Upload
const key = `menuItem/${clientId}/${fileName}`;
const result = await uploadObject(buffer, key, mimetype);

// Get signed URL (for viewing)
const url = await getSignedUrl(key, 86400); // expires in 86400 seconds

// Delete
await deleteObject(key);
```

### Nodemailer (Email)

**File**: `src/providers/nodemailer/nodemailer.provider.js`

```javascript
import { sendOtpEmail } from "../../providers/nodemailer/nodemailer.provider.js";

await sendOtpEmail({
    toEmail: "user@example.com",
    otp: "123456",
    type: "otp" // or "reset"
});
```

### Twilio (SMS / WhatsApp)

**File**: `src/providers/twilio/twilio.provider.js`

```javascript
import { sendSMS } from "../../providers/twilio/twilio.provider.js";

await sendSMS({
    to: "+1234567890",
    body: "Your OTP is 123456"
});
```

---

## Common SQL Patterns

### Check if Record Exists

```javascript
const sql = 'SELECT 1 FROM categories WHERE unique_id = ? AND client_id = ?';
const result = await query(sql, [categoryId, clientId]);
if (result.length === 0) {
    throw new HttpError("Not found", 404);
}
```

### Count Records

```javascript
const sql = 'SELECT COUNT(*) AS total FROM categories WHERE client_id = ?';
const [result] = await query(sql, [clientId]);
const count = parseInt(result?.total || 0);
```

### Get Next Position

```javascript
const [countResult] = await query('SELECT COUNT(*) AS total FROM categories WHERE client_id = ?', [clientId]);
const position = (parseInt(countResult?.total || 0) || 0) + 1;
```

### JSON Column

```javascript
// Store JSON
const imageDetails = { path: "key", fileName: "name.jpg" };
await query('INSERT INTO items (image_details) VALUES (?)', [JSON.stringify(imageDetails)]);

// Retrieve JSON (mysql2 auto-parses JSON columns)
const items = await query('SELECT * FROM items WHERE id = ?', [id]);
console.log(items[0].image_details.path); // "key"
```
