-- @up
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    client_id CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_details JSON,
    veg_status ENUM('veg', 'non_veg') NOT NULL DEFAULT 'veg',
    availability ENUM('in_stock', 'out_of_stock') DEFAULT 'in_stock',
    status INT DEFAULT 1,
    position INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(unique_id) ON DELETE CASCADE
);

-- @down
DROP TABLE IF EXISTS menu_items;
