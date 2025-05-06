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
    unique_id CHAR(36) NOT NULL UNIQUE,  -- UUID for the template
    client_id CHAR(36) NOT NULL,           -- Owner of the template (café admin)
    name VARCHAR(255) NOT NULL,          -- Template name (e.g., "Modern Coffee Shop")
    config JSON NOT NULL,                -- Template settings (colors, fonts, layout)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE
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