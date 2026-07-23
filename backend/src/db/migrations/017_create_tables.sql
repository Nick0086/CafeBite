-- @up
CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    template_id CHAR(36) NOT NULL,
    table_number VARCHAR(50) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS tables;
