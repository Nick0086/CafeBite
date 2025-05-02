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
