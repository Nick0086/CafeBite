-- @up
CREATE TABLE client_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id CHAR(36) NOT NULL,
    razorpay_subscription_id VARCHAR(100) NOT NULL UNIQUE,
    plan_name VARCHAR(100) DEFAULT 'Standard Monthly',
    amount DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    currency CHAR(3) NOT NULL DEFAULT 'USD',

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'cancelled', 'expired', 'trial', 'payment_failed') DEFAULT 'trial',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_client_sub (client_id),
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS client_subscriptions;
