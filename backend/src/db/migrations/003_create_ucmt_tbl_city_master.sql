-- @up
CREATE TABLE IF NOT EXISTS `ucmt_tbl_city_master` (
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

-- @down
DROP TABLE IF EXISTS `ucmt_tbl_city_master`;
