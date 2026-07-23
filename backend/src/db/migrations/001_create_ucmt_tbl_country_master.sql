-- @up
CREATE TABLE IF NOT EXISTS `ucmt_tbl_country_master` (
    `id` INT          NOT NULL PRIMARY KEY,
    `countrycode`    VARCHAR(10)   NOT NULL,
    `country`        VARCHAR(100)  NOT NULL,
    `phonecode`      VARCHAR(10),
    `currency_code`   CHAR(3)       NOT NULL,
    `currency_name`   VARCHAR(100)  NOT NULL,
    `currency_symbol` VARCHAR(10)
);

-- @down
DROP TABLE IF EXISTS `ucmt_tbl_country_master`;
