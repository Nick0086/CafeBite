-- @up
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id CHAR(36) NOT NULL, 
    token CHAR(36) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id)
);

-- @down
DROP TABLE IF EXISTS password_reset_tokens;
