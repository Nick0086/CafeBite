import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "025_create_structured_catalog.sql");

test("structured catalog migration creates reversible tenant-scoped resources", () => {
    const sql = fs.readFileSync(file, "utf8");
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS menus/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS menu_sections/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS menu_categories/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS menu_section_items/);
    expect(sql).toMatch(/FOREIGN KEY \(client_id\)/g);
    expect(sql).toMatch(/DROP TABLE IF EXISTS menus/);
});
