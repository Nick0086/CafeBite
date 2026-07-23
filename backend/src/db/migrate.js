#!/usr/bin/env node

import promisePool from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

const ensureMigrationsTable = async () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await promisePool.query(sql);
};

const getExecutedMigrations = async () => {
    const [rows] = await promisePool.query('SELECT name FROM migrations ORDER BY name');
    return rows.map(row => row.name);
};

const getMigrationFiles = async () => {
    try {
        const files = await fs.readdir(MIGRATIONS_DIR);
        return files
            .filter(file => file.endsWith('.sql'))
            .sort();
    } catch (error) {
        console.error('Error reading migrations directory:', error);
        return [];
    }
};

const executeMigration = async (filename, direction = 'up') => {
    const filepath = path.join(MIGRATIONS_DIR, filename);
    const content = await fs.readFile(filepath, 'utf-8');
    
    const sections = content.split(/--\s*@?(up|down)\s*$/im);
    
    let sql;
    if (direction === 'up') {
        const upIndex = sections.findIndex(s => s.toLowerCase().trim() === 'up');
        sql = upIndex !== -1 ? sections[upIndex + 1] : content;
    } else {
        const downIndex = sections.findIndex(s => s.toLowerCase().trim() === 'down');
        sql = downIndex !== -1 ? sections[downIndex + 1] : null;
    }
    
    if (!sql || !sql.trim()) {
        console.log(`  ⚠ No ${direction} migration found in ${filename}`);
        return;
    }
    
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const statement of statements) {
        if (statement.length > 0) {
            await promisePool.query(statement);
        }
    }
};

const runMigrations = async (direction = 'up') => {
    try {
        await ensureMigrationsTable();
        const executed = await getExecutedMigrations();
        const files = await getMigrationFiles();
        
        if (direction === 'up') {
            const pending = files.filter(f => !executed.includes(f.replace('.sql', '')));
            
            if (pending.length === 0) {
                console.log('✓ No pending migrations');
                return;
            }
            
            console.log(`Running ${pending.length} migration(s)...\n`);
            
            for (const file of pending) {
                const name = file.replace('.sql', '');
                console.log(`  → ${name}`);
                await executeMigration(file, 'up');
                await promisePool.query('INSERT INTO migrations (name) VALUES (?)', [name]);
            }
            
            console.log('\n✓ Migrations completed successfully');
        } else {
            if (executed.length === 0) {
                console.log('✓ No migrations to rollback');
                return;
            }
            
            const lastMigration = executed[executed.length - 1];
            const file = `${lastMigration}.sql`;
            
            console.log(`Rolling back: ${lastMigration}\n`);
            await executeMigration(file, 'down');
            await promisePool.query('DELETE FROM migrations WHERE name = ?', [lastMigration]);
            
            console.log('\n✓ Rollback completed successfully');
        }
    } catch (error) {
        console.error('\n✗ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await promisePool.end();
    }
};

const command = process.argv[2];

if (command === 'up') {
    runMigrations('up');
} else if (command === 'down') {
    runMigrations('down');
} else if (command === 'status') {
    (async () => {
        try {
            await ensureMigrationsTable();
            const executed = await getExecutedMigrations();
            const files = await getMigrationFiles();
            
            console.log('\nMigration Status:\n');
            console.log('Executed:');
            executed.forEach(m => console.log(`  ✓ ${m}`));
            
            const pending = files.filter(f => !executed.includes(f.replace('.sql', '')));
            console.log('\nPending:');
            pending.forEach(f => console.log(`  ○ ${f.replace('.sql', '')}`));
            
            console.log(`\nTotal: ${executed.length} executed, ${pending.length} pending\n`);
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            await promisePool.end();
        }
    })();
} else {
    console.log('\nUsage:');
    console.log('  npm run migrate up       - Run all pending migrations');
    console.log('  npm run migrate down     - Rollback last migration');
    console.log('  npm run migrate status   - Show migration status\n');
    process.exit(1);
}
