import query from "../utils/query.utils.js";
/*CREATE TABLE client_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID for global tracking
    client_id CHAR(36) NOT NULL,         -- FK to clients
    type ENUM('complaint', 'bug', 'suggestion') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);*/

/*CREATE TABLE feedback_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_id CHAR(36) NOT NULL,         -- FK to client_feedback
    commented_by ENUM('client', 'admin') NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES client_feedback(unique_id) ON DELETE CASCADE
);*/

/*CREATE TABLE client_feedback_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_id CHAR(36) NOT NULL,         -- FK to client_feedback(unique_id)
    image_url TEXT NOT NULL,               -- Cloudflare R2, S3, etc.
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feedback_id) REFERENCES client_feedback(unique_id) ON DELETE CASCADE
);*/

const getAllFeedback = async (userId) => {
    const sql = `SELECT * FROM  client_feedback WHERE client_id = ?`;
    return await query(sql, [userId]);
};

export default { getAllFeedback };