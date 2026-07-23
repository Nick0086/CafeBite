-- @up
CREATE TABLE template_styling (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id CHAR(36) NOT NULL,
    border_radius VARCHAR(10) DEFAULT '8px',
    shadow VARCHAR(50) DEFAULT '0 2px 4px rgba(0,0,0,0.1)',
    font_family VARCHAR(100) DEFAULT 'system-ui',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS template_styling;
