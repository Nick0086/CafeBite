-- @up
CREATE TABLE IF NOT EXISTS template_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    template_id CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    position INT DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS template_categories;
