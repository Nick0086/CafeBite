-- @up
CREATE TABLE feedback_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    feedback_id CHAR(36) NOT NULL,
    commented_by ENUM('client', 'admin') NOT NULL,
    admin_id INT DEFAULT NULL,
    comment TEXT NOT NULL,
    parent_comment_id INT DEFAULT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    
    commented_by_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_feedback_comments_feedback_id (feedback_id),
    INDEX idx_feedback_comments_parent (parent_comment_id),
    INDEX idx_feedback_comments_created_at (created_at),
    
    FOREIGN KEY (commented_by_id) REFERENCES clients(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (feedback_id) REFERENCES client_feedback(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES feedback_comments(id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS feedback_comments;
