-- @up
CREATE TABLE client_subscription_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    razorpay_payment_id VARCHAR(100),
    razorpay_invoice_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    status ENUM('paid', 'failed', 'refunded', 'cancelled') DEFAULT 'paid',
    
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    INDEX idx_subscription_history_client (client_id),
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS client_subscription_history;
