-- @up
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status INT DEFAULT 1,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS categories;
