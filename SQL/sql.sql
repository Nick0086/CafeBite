use `cafebite`;

CREATE TABLE `ucmt_tbl_country_master` (
    `id` INT          NOT NULL PRIMARY KEY,
    `countrycode`    VARCHAR(10)   NOT NULL,     -- e.g. 'US'
    `country`        VARCHAR(100)  NOT NULL,     -- e.g. 'United States'
    `phonecode`      VARCHAR(10),                -- e.g. '+1'
    `currency_code`   CHAR(3)       NOT NULL,    -- ISO 4217 code, e.g. 'USD'
    `currency_name`   VARCHAR(100)  NOT NULL,    -- e.g. 'US Dollar'
    `currency_symbol` VARCHAR(10)                  -- e.g. '$'
);

CREATE TABLE `ucmt_tbl_state_master` (
    `id`        INT NOT NULL AUTO_INCREMENT,
    `state`     VARCHAR(100)  NOT NULL,
    `countryid` INT           NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_state_countryid` (`countryid`),
    CONSTRAINT `fk_state_country`
        FOREIGN KEY (`countryid`)
        REFERENCES `ucmt_tbl_country_master` (`id`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE `ucmt_tbl_city_master` (
    `id`      INT NOT NULL AUTO_INCREMENT,
    `city`    VARCHAR(100) NOT NULL,
    `stateid` INT          NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_city_stateid` (`stateid`),
    CONSTRAINT `fk_city_state`
        FOREIGN KEY (`stateid`)
        REFERENCES `ucmt_tbl_state_master` (`id`)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE `currencies` (
    `code` CHAR(3) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `symbol` VARCHAR(5) NOT NULL,
    `decimal_places` INT NOT NULL
);

CREATE TABLE `clients` (
    `id`            INT            NOT NULL AUTO_INCREMENT,
    `unique_id`     CHAR(36)       NOT NULL UNIQUE,  
    `first_name`    VARCHAR(255)   NOT NULL,
    `last_name`     VARCHAR(255)   NOT NULL,
    `mobile`        VARCHAR(15)    NOT NULL UNIQUE,
    `email`         VARCHAR(255)   NOT NULL UNIQUE,
    `password`      VARCHAR(255)   NOT NULL,

    `cafe_name`     VARCHAR(100)   NOT NULL,
    `logo_url`      TEXT,

    `address_line1` VARCHAR(150),
    `postal_code`   VARCHAR(20),

    `country_id`    INT,
    `state_id`      INT,
    `city_id`       INT,

    `latitude`      DECIMAL(9,6) DEFAULT NULL,
    `longitude`     DECIMAL(9,6) DEFAULT NULL,

    `cafe_description` TEXT,
    `cafe_phone` VARCHAR(20),
    `cafe_email` VARCHAR(255) DEFAULT NULL,
    `cafe_website` VARCHAR(255) DEFAULT NULL,

    `social_instagram` VARCHAR(255) DEFAULT NULL,
    `social_facebook` VARCHAR(255) DEFAULT NULL,
    `social_twitter` VARCHAR(255) DEFAULT NULL;

    `currency_code` CHAR(3)        NOT NULL DEFAULT 'USD',

    `created_at`    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX `idx_clients_country` (`country_id`),
    INDEX `idx_clients_state`   (`state_id`),
    INDEX `idx_clients_city`    (`city_id`),

    CONSTRAINT `fk_clients_country`
        FOREIGN KEY (`country_id`)
        REFERENCES `ucmt_tbl_country_master` (`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT `fk_clients_state`
        FOREIGN KEY (`state_id`)
        REFERENCES `ucmt_tbl_state_master` (`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT `fk_clients_city`
        FOREIGN KEY (`city_id`)
        REFERENCES `ucmt_tbl_city_master` (`id`)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    PRIMARY KEY (`id`)
);

CREATE TABLE client_sessions (
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

CREATE TABLE otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id CHAR(36) NOT NULL,  -- Reference to client_sessions.session_id
    otp VARCHAR(6) NOT NULL,
    login_type VARCHAR(45) NOT NULL,
    login_id VARCHAR(45) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (session_id) REFERENCES client_sessions(session_id)
); 

CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id CHAR(36) NOT NULL, 
    token CHAR(36) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id)
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    client_id CHAR(36) NOT NULL,  -- Should match the type of users.unique_id
    name VARCHAR(255) NOT NULL,
    status INT DEFAULT 1,
    position INT DEFAULT 0,  -- Drag-and-drop sorting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);

CREATE TABLE menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID as a unique identifier
    client_id CHAR(36) NOT NULL,  -- Each item belongs to a user (café)
    category_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_details JSON,
    veg_status ENUM('veg', 'non_veg') NOT NULL DEFAULT 'veg',
    availability ENUM('in_stock', 'out_of_stock') DEFAULT 'in_stock',
    status INT DEFAULT 1,
    position INT DEFAULT 0,  -- Drag-and-drop sorting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(unique_id) ON DELETE CASCADE
);

CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status INT DEFAULT 1,
    config JSON NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);

CREATE TABLE template_global_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id CHAR(36) NOT NULL,
    background_color VARCHAR(7) DEFAULT '#f4f5f7',
    section_background_color VARCHAR(7) DEFAULT '#ffffff',
    title_color VARCHAR(7) DEFAULT '#1e2939',
    card_title_color VARCHAR(7) DEFAULT '#1e2939',
    card_background_color VARCHAR(7) DEFAULT '#ffffff',
    description_color VARCHAR(7) DEFAULT '#4a5565',
    button_label_color VARCHAR(7) DEFAULT '#ffffff',
    button_background_color VARCHAR(7) DEFAULT '#615FFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(unique_id) ON DELETE CASCADE
);

CREATE TABLE template_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    template_id CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    position INT DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(unique_id) ON DELETE CASCADE
);

CREATE TABLE template_category_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_category_id CHAR(36) NOT NULL,
    section_background_color VARCHAR(7),
    title_color VARCHAR(7),
    card_title_color VARCHAR(7),
    card_background_color VARCHAR(7),
    description_color VARCHAR(7),
    button_label_color VARCHAR(7),
    button_background_color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_category_id) REFERENCES template_categories(unique_id) ON DELETE CASCADE
);

CREATE TABLE template_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    template_category_id CHAR(36) NOT NULL,
    menu_item_id CHAR(36) NOT NULL,
    position INT DEFAULT 0,
    visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_category_id) REFERENCES template_categories(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(unique_id) ON DELETE CASCADE
);

CREATE TABLE template_styling (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id CHAR(36) NOT NULL,
    border_radius VARCHAR(10) DEFAULT '8px',
    shadow VARCHAR(50) DEFAULT '0 2px 4px rgba(0,0,0,0.1)',
    font_family VARCHAR(100) DEFAULT 'system-ui',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(unique_id) ON DELETE CASCADE
);

CREATE TABLE tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    template_id CHAR(36) NOT NULL,
    table_number VARCHAR(50) NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
    FOREIGN KEY (template_id) REFERENCES templates(unique_id) ON DELETE CASCADE
);

CREATE TABLE client_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID for global tracking
    client_id CHAR(36) NOT NULL,         -- FK to clients
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

CREATE TABLE feedback_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID for global tracking
    feedback_id CHAR(36) NOT NULL,       -- FK to client_feedback
    commented_by ENUM('client', 'admin') NOT NULL,
    admin_id INT DEFAULT NULL,           -- Track which admin commented
    comment TEXT NOT NULL,
    parent_comment_id INT DEFAULT NULL,  -- Reference to parent comment ID
    is_internal BOOLEAN DEFAULT FALSE,   -- Internal admin notes
    
    commented_by_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_feedback_comments_feedback_id (feedback_id),
    INDEX idx_feedback_comments_parent (parent_comment_id),
    INDEX idx_feedback_comments_created_at (created_at),
    
    FOREIGN KEY (commented_by_id) REFERENCES clients(unique_id) ON DELETE CASCADE
    FOREIGN KEY (feedback_id) REFERENCES client_feedback(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES feedback_comments(id) ON DELETE CASCADE
);

CREATE TABLE client_feedback_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID for global tracking
    feedback_id CHAR(36) NOT NULL,       -- FK to client_feedback(unique_id)
    image_url TEXT NOT NULL,             -- Cloudflare R2, S3, etc.
    original_filename VARCHAR(255),
    file_size_bytes INT DEFAULT NULL,
    file_type VARCHAR(50) DEFAULT NULL,
    uploaded_by ENUM('client', 'admin') DEFAULT 'client',
    
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_feedback_images_feedback_id (feedback_id),
    INDEX idx_feedback_images_uploaded_at (uploaded_at),
    
    FOREIGN KEY (feedback_id) REFERENCES client_feedback(unique_id) ON DELETE CASCADE
);


CREATE TABLE client_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id CHAR(36) NOT NULL, -- FK to clients.unique_id
    razorpay_subscription_id VARCHAR(100) NOT NULL UNIQUE, -- Razorpay subscription ID
    plan_name VARCHAR(100) DEFAULT 'Standard Monthly',
    amount DECIMAL(10,2) NOT NULL DEFAULT 10.00, -- in USD or INR
    currency CHAR(3) NOT NULL DEFAULT 'USD',

    start_date DATE NOT NULL,
    end_date DATE NOT NULL, -- next billing date / expiry
    status ENUM('active', 'cancelled', 'expired', 'trial', 'payment_failed') DEFAULT 'trial',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_client_sub (client_id),
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);

CREATE TABLE client_subscription_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id CHAR(36) NOT NULL, -- FK to clients.unique_id
    razorpay_payment_id VARCHAR(100), -- Razorpay payment ID
    razorpay_invoice_id VARCHAR(100), -- Razorpay invoice ID
    amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    status ENUM('paid', 'failed', 'refunded', 'cancelled') DEFAULT 'paid',
    
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    INDEX idx_subscription_history_client (client_id),
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
);
