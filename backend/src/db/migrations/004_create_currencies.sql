-- @up
CREATE TABLE IF NOT EXISTS `currencies` (
    `code` CHAR(3) PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `symbol` VARCHAR(5) NOT NULL,
    `decimal_places` INT NOT NULL
);

-- @down
DROP TABLE IF EXISTS `currencies`;
