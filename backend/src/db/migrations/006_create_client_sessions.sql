-- @up
CREATE TABLE IF NOT EXISTS client_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id CHAR(36) NOT NULL UNIQUE, 
    client_id CHAR(36) NOT NULL,
    user_agent TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    login_type VARCHAR(45) NOT NULL,
    login_id VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    refresh_token TEXT NOT NULL,
    is_revoke INT DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id)
);

-- @down
DROP TABLE IF EXISTS client_sessions;
