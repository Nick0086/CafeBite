-- @up
CREATE TABLE IF NOT EXISTS `ucmt_tbl_state_master` (
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

-- @down
DROP TABLE IF EXISTS `ucmt_tbl_state_master`;
