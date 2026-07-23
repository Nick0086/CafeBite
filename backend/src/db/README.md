# Database Migration System

This project uses a custom SQL-based migration system to manage database schema changes.

## Directory Structure

```
backend/src/db/
├── migrate.js              # Migration runner script
├── migrations/             # SQL migration files
│   ├── 001_create_clients_table.sql
│   ├── 002_create_categories_table.sql
│   └── ...
└── seeds/                  # SQL seed files
    └── 001_sample_data.sql
```

## Migration File Format

Each migration file contains both UP and DOWN operations:

```sql
-- @up
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- @down
DROP TABLE users;
```

## Commands

### Run all pending migrations
```bash
npm run migrate:up
```

### Rollback last migration
```bash
npm run migrate:down
```

### Check migration status
```bash
npm run migrate:status
```

### Alternative commands
```bash
npm run migrate up
npm run migrate down
npm run migrate status
```

## Creating a New Migration

1. Create a new file in `src/db/migrations/` with a sequential number:
   ```
   011_create_orders_table.sql
   ```

2. Add your SQL with `-- @up` and `-- @down` markers:
   ```sql
   -- @up
   CREATE TABLE orders (
       id INT AUTO_INCREMENT PRIMARY KEY,
       client_id VARCHAR(255) NOT NULL,
       total DECIMAL(10,2) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- @down
   DROP TABLE orders;
   ```

3. Run the migration:
   ```bash
   npm run migrate:up
   ```

## Creating Seed Data

1. Create a new file in `src/db/seeds/`:
   ```
   002_add_test_data.sql
   ```

2. Add your INSERT statements:
   ```sql
   INSERT INTO clients (unique_id, first_name, last_name, email)
   VALUES ('TEST001', 'Test', 'User', 'test@example.com');
   ```

3. Run the seed manually:
   ```bash
   mysql -u your_user -p your_database < src/db/seeds/002_add_test_data.sql
   ```

## How It Works

1. The migration system maintains a `migrations` table in your database
2. Each executed migration is recorded with its name and timestamp
3. When you run `migrate:up`, it:
   - Reads all `.sql` files from the migrations directory
   - Checks which ones haven't been executed yet
   - Runs the `-- @up` section of each pending migration
   - Records the migration in the database
4. When you run `migrate:down`, it:
   - Finds the last executed migration
   - Runs the `-- @down` section
   - Removes the record from the migrations table

## Best Practices

1. **Never modify an executed migration** - Create a new one instead
2. **Always include both UP and DOWN** operations for reversibility
3. **Use sequential numbering** to ensure correct execution order
4. **Test migrations locally** before deploying to production
5. **Backup your database** before running migrations in production
6. **Keep migrations atomic** - One logical change per file

## Current Migrations

All migrations match the actual database schema from `SQL/sql.sql`:

| # | File | Table |
|---|------|-------|
| 001 | `create_ucmt_tbl_country_master` | Country master data |
| 002 | `create_ucmt_tbl_state_master` | State master data |
| 003 | `create_ucmt_tbl_city_master` | City master data |
| 004 | `create_currencies` | Currency codes & symbols |
| 005 | `create_clients` | Client/restaurant accounts |
| 006 | `create_client_sessions` | Auth sessions + refresh tokens |
| 007 | `create_otps` | OTP verification codes |
| 008 | `create_password_reset_tokens` | Password reset tokens |
| 009 | `create_categories` | Menu categories |
| 010 | `create_menu_items` | Menu items |
| 011 | `create_templates` | Customer-facing menu templates |
| 012 | `create_template_global_settings` | Template global styling |
| 013 | `create_template_categories` | Template ↔ category mapping |
| 014 | `create_template_category_settings` | Per-category template styling |
| 015 | `create_template_items` | Template ↔ menu item mapping |
| 016 | `create_template_styling` | Template border/shadow/font |
| 017 | `create_tables` | Restaurant tables + QR codes |
| 018 | `create_client_feedback` | Customer feedback tickets |
| 019 | `create_feedback_comments` | Feedback comments (client/admin) |
| 020 | `create_client_feedback_images` | Feedback image attachments |
| 021 | `create_client_subscriptions` | Razorpay subscriptions |
| 022 | `create_client_subscription_history` | Payment history |

## Troubleshooting

### Migration fails halfway
If a migration fails, it will stop and show an error. The failed migration won't be recorded, so you can fix the issue and run `npm run migrate:up` again.

### Need to re-run a migration
1. Run `npm run migrate:down` to rollback
2. Fix your migration file
3. Run `npm run migrate:up` to re-execute

### Check what's been executed
Run `npm run migrate:status` to see all executed and pending migrations.
