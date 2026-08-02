const fs = require("node:fs");
const path = require("node:path");

const migrationPath = path.join(__dirname, "024_add_template_client_scope_index.sql");

test("template client-scope migration has reversible up and down operations", () => {
    const migration = fs.readFileSync(migrationPath, "utf8");

    expect(migration).toContain("CREATE INDEX idx_templates_client_unique_id ON templates (client_id, unique_id)");
    expect(migration).toContain("DROP INDEX idx_templates_client_unique_id ON templates");
});
