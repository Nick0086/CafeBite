-- @up
CREATE TABLE IF NOT EXISTS template_category_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_category_id CHAR(36) NOT NULL,
    section_background_color VARCHAR(7),
    title_color VARCHAR(7),
    card_title_color VARCHAR(7),
    card_background_color VARCHAR(7),
    description_color VARCHAR(7),
    button_label_color VARCHAR(7),
    button_background_color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_category_id) REFERENCES template_categories(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS template_category_settings;
