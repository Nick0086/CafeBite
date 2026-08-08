import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '025_create_structured_catalog.sql');

test('structured catalog migration creates reversible tenant-scoped resources', () => {
    const sql = fs.readFileSync(file, 'utf8');
    assert.ok(/CREATE TABLE IF NOT EXISTS menus/.test(sql));
    assert.ok(/CREATE TABLE IF NOT EXISTS menu_sections/.test(sql));
    assert.ok(/CREATE TABLE IF NOT EXISTS menu_categories/.test(sql));
    assert.ok(/CREATE TABLE IF NOT EXISTS menu_section_items/.test(sql));
    assert.ok(/FOREIGN KEY \(client_id\)/.test(sql));
    assert.ok(/DROP TABLE IF EXISTS menus/.test(sql));
});
