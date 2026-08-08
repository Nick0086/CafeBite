import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationPath = path.join(__dirname, '024_add_template_client_scope_index.sql');

test('template client-scope migration has reversible up and down operations', () => {
    const migration = fs.readFileSync(migrationPath, 'utf8');

    assert.ok(migration.includes('CREATE INDEX idx_templates_client_unique_id ON templates (client_id, unique_id)'));
    assert.ok(migration.includes('DROP INDEX idx_templates_client_unique_id ON templates'));
});
