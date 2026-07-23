-- @up
CREATE TABLE client_feedback_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    feedback_id CHAR(36) NOT NULL,
    image_url TEXT NOT NULL,
    original_filename VARCHAR(255),
    file_size_bytes INT DEFAULT NULL,
    file_type VARCHAR(50) DEFAULT NULL,
    uploaded_by ENUM('client', 'admin') DEFAULT 'client',
    
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_feedback_images_feedback_id (feedback_id),
    INDEX idx_feedback_images_uploaded_at (uploaded_at),
    
    FOREIGN KEY (feedback_id) REFERENCES client_feedback(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS client_feedback_images;
