-- @up
CREATE TABLE IF NOT EXISTS admin_leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id CHAR(36) NOT NULL UNIQUE,
    restaurant_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    google_maps_url TEXT,
    status ENUM('call_needed', 'follow_up', 'visit_scheduled', 'visited', 'closed_won', 'closed_lost') NOT NULL DEFAULT 'call_needed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_admin_leads_status (status),
    INDEX idx_admin_leads_city (city),
    INDEX idx_admin_leads_restaurant_name (restaurant_name)
);

INSERT INTO admin_leads (unique_id, restaurant_name, contact_person, phone, email, address, city, state, google_maps_url, status, notes)
VALUES
('LEAD_1001', 'The Spice Villa', 'Rajesh Sharma', '+91 98765 43210', 'rajesh@spicevilla.com', '102 CG Road, Navrangpura', 'Ahmedabad', 'Gujarat', 'https://maps.google.com/?q=23.0333,72.5647', 'call_needed', 'Interested in digital QR menus for 20 tables.'),
('LEAD_1002', 'Urban Bites Cafe', 'Priya Patel', '+91 98250 12345', 'priya@urbanbites.in', '45 SG Highway, Thaltej', 'Ahmedabad', 'Gujarat', 'https://maps.google.com/?q=23.0500,72.5000', 'follow_up', 'Sent proposal, awaiting manager callback.'),
('LEAD_1003', 'Royal Punjab Dhaba', 'Gurpreet Singh', '+91 99099 87654', 'info@royalpunjabdhabha.com', 'Near Ring Road Toll Plaza', 'Surat', 'Gujarat', 'https://maps.google.com/?q=21.1702,72.8311', 'visit_scheduled', 'On-site demo scheduled for Friday 3 PM.'),
('LEAD_1004', 'Cafe Mocha & Co', 'Ananya Roy', '+91 97123 45678', 'ananya@cafemocha.co', 'Alkapuri Main Road', 'Vadodara', 'Gujarat', 'https://maps.google.com/?q=22.3072,73.1812', 'visited', 'Visited owner. Demo liked, finalizing tier option.'),
('LEAD_1005', 'Flavors of South', 'Ramesh Iyer', '+91 98980 11223', 'ramesh@flavorsofsouth.com', 'FC Road, Shivaji Nagar', 'Pune', 'Maharashtra', 'https://maps.google.com/?q=18.5204,73.8567', 'closed_won', 'Subscribed to Pro Tier plan for 1 year.'),
('LEAD_1006', 'Ocean Grill Restaurant', 'Vikram Desai', '+91 97234 56789', 'vikram@oceangrill.com', 'Marine Drive', 'Mumbai', 'Maharashtra', 'https://maps.google.com/?q=18.9438,72.8232', 'closed_lost', 'Decided to continue using physical printed menus.');

-- @down
DROP TABLE IF EXISTS admin_leads;
