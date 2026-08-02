-- @up
CREATE TABLE IF NOT EXISTS menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    archived_at TIMESTAMP NULL,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE,
    UNIQUE KEY uq_menus_client_slug (client_id, slug)
);

CREATE TABLE IF NOT EXISTS menu_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    menu_id CHAR(36) NOT NULL,
    parent_section_id CHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_section_id) REFERENCES menu_sections(unique_id) ON DELETE SET NULL,
    UNIQUE KEY uq_sections_menu_slug (menu_id, slug)
);

CREATE TABLE IF NOT EXISTS menu_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    menu_id CHAR(36) NOT NULL,
    parent_category_id CHAR(36) NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_category_id) REFERENCES menu_categories(unique_id) ON DELETE SET NULL,
    UNIQUE KEY uq_catalog_categories_menu_slug (menu_id, slug)
);

CREATE TABLE IF NOT EXISTS menu_section_items (
    section_id CHAR(36) NOT NULL,
    menu_item_id CHAR(36) NOT NULL,
    client_id CHAR(36) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    PRIMARY KEY (section_id, menu_item_id),
    FOREIGN KEY (section_id) REFERENCES menu_sections(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS menu_section_items;
DROP TABLE IF EXISTS menu_categories;
DROP TABLE IF EXISTS menu_sections;
DROP TABLE IF EXISTS menus;
