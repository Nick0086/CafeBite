-- @up
CREATE TABLE IF NOT EXISTS template_global_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id CHAR(36) NOT NULL,
    background_color VARCHAR(7) DEFAULT '#f4f5f7',
    section_background_color VARCHAR(7) DEFAULT '#ffffff',
    title_color VARCHAR(7) DEFAULT '#1e2939',
    card_title_color VARCHAR(7) DEFAULT '#1e2939',
    card_background_color VARCHAR(7) DEFAULT '#ffffff',
    description_color VARCHAR(7) DEFAULT '#4a5565',
    button_label_color VARCHAR(7) DEFAULT '#ffffff',
    button_background_color VARCHAR(7) DEFAULT '#615FFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS template_global_settings;
