-- @up
CREATE TABLE IF NOT EXISTS otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id CHAR(36) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    login_type VARCHAR(45) NOT NULL,
    login_id VARCHAR(45) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (session_id) REFERENCES client_sessions(session_id)
); 

-- @down
DROP TABLE IF EXISTS otps;
