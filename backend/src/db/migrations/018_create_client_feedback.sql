-- @up
CREATE TABLE client_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    type ENUM('complaint', 'bug', 'suggestion', 'billing', 'feature_request') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    status ENUM('open', 'in_progress', 'resolved', 'closed', 'cancelled') DEFAULT 'open',
    assigned_to_admin_id INT DEFAULT NULL,
    resolved_at TIMESTAMP NULL,
    client_satisfaction_rating TINYINT DEFAULT NULL CHECK (client_satisfaction_rating BETWEEN 1 AND 5),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_client_feedback_client_id (client_id),
    INDEX idx_client_feedback_status (status),
    INDEX idx_client_feedback_type (type),
    INDEX idx_client_feedback_created_at (created_at),
    INDEX idx_client_feedback_assigned_admin (assigned_to_admin_id),
    
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS client_feedback;
