-- @up
CREATE TABLE IF NOT EXISTS admin_lead_recordings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    lead_id CHAR(36) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_key VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    duration INT DEFAULT NULL,
    transcript LONGTEXT,
    selling_score INT DEFAULT NULL,
    strengths JSON DEFAULT NULL,
    improvements JSON DEFAULT NULL,
    objection_handling JSON DEFAULT NULL,
    closing_recommendations TEXT DEFAULT NULL,
    raw_ai_response JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_admin_lead_recordings_lead_id (lead_id),
    INDEX idx_admin_lead_recordings_created_at (created_at)
);

-- @down
DROP TABLE IF EXISTS admin_lead_recordings;
