-- @up
CREATE TABLE IF NOT EXISTS template_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    template_category_id CHAR(36) NOT NULL,
    menu_item_id CHAR(36) NOT NULL,
    position INT DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_category_id) REFERENCES template_categories(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS template_items;
