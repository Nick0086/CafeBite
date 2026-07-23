-- Seed: Country, State, City master data (sample)
INSERT INTO `ucmt_tbl_country_master` (`id`, `countrycode`, `country`, `phonecode`, `currency_code`, `currency_name`, `currency_symbol`)
VALUES (1, 'IN', 'India', '+91', 'INR', 'Indian Rupee', '₹');

INSERT INTO `ucmt_tbl_state_master` (`id`, `state`, `countryid`)
VALUES (1, 'Gujarat', 1);

INSERT INTO `ucmt_tbl_city_master` (`id`, `city`, `stateid`)
VALUES (1, 'Ahmedabad', 1),
       (2, 'Surat', 1),
       (3, 'Vadodara', 1);

-- Seed: Currencies
INSERT INTO `currencies` (`code`, `name`, `symbol`, `decimal_places`)
VALUES ('USD', 'US Dollar', '$', 2),
       ('INR', 'Indian Rupee', '₹', 2),
       ('EUR', 'Euro', '€', 2),
       ('GBP', 'British Pound', '£', 2);
