/*
    Database Schema
    ===============
    CREATE TABLE clients (
        id INT NOT NULL AUTO_INCREMENT,
        unique_id CHAR(36) NOT NULL UNIQUE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        mobile VARCHAR(15) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        cafe_name VARCHAR(100) NOT NULL,
        logo_url TEXT,
        address_line1 VARCHAR(150),
        postal_code VARCHAR(20),
        country_id INT,
        state_id INT,
        city_id INT,
        latitude DECIMAL(9,6) DEFAULT NULL,
        longitude DECIMAL(9,6) DEFAULT NULL,
        cafe_description TEXT,
        cafe_phone VARCHAR(20),
        cafe_email VARCHAR(255) DEFAULT NULL,
        cafe_website VARCHAR(255) DEFAULT NULL,
        social_instagram VARCHAR(255) DEFAULT NULL,
        social_facebook VARCHAR(255) DEFAULT NULL,
        social_twitter VARCHAR(255) DEFAULT NULL,
        currency_code CHAR(3) NOT NULL DEFAULT 'USD',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    );

    CREATE TABLE client_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id VARCHAR(255) NOT NULL,
        razorpay_subscription_id VARCHAR(255) NOT NULL,
        plan_name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(unique_id)
    );

    CREATE TABLE currencies (
        code CHAR(3) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        symbol VARCHAR(10) NOT NULL
    );
*/

import query from "../../utils/query.utils.js";

export const findClientByEmail = async (email, connection = null) => {
    const sql = `SELECT * FROM clients WHERE email = ?`;
    return await query(sql, [email], connection);
};

export const findClientByEmailExcludeId = async (email, clientId, connection = null) => {
    const sql = `SELECT * FROM clients WHERE email = ? AND unique_id != ?`;
    return await query(sql, [email, clientId], connection);
};

export const findClientById = async (clientId, connection = null) => {
    const sql = `SELECT * FROM clients WHERE unique_id = ?`;
    return await query(sql, [clientId], connection);
};

export const createClient = async (data, connection = null) => {
    const {
        clientId, firstName, lastName, phoneNumber, email, hashedPassword,
        cafeName, cafeDescription, fullPath, cafeAddress, cafeCity, cafeState,
        cafeCountry, cafeZip, cafeCurrency, cafePhone, cafeEmail, cafeWebsite,
        socialInstagram, socialFacebook, socialTwitter
    } = data;

    const sql = `INSERT INTO clients (unique_id, first_name, last_name, mobile, email, password, cafe_name, cafe_description, logo_url, address_line1, city_id, state_id, country_id, postal_code, currency_code, cafe_phone, cafe_email, cafe_website, social_instagram, social_facebook, social_twitter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [clientId, firstName, lastName, phoneNumber, email, hashedPassword, cafeName, cafeDescription, fullPath, cafeAddress, cafeCity, cafeState, cafeCountry, cafeZip, cafeCurrency, cafePhone, cafeEmail, cafeWebsite, socialInstagram, socialFacebook, socialTwitter];
    return await query(sql, params, connection);
};

export const createClientSubscription = async (data, connection = null) => {
    const { clientId, subscriptionId, planName, amount, currency, startDate, endDate, status } = data;
    const sql = `INSERT INTO client_subscriptions (client_id, razorpay_subscription_id, plan_name, amount, currency, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [clientId, subscriptionId, planName, amount, currency, startDate, endDate, status];
    return await query(sql, params, connection);
};

export const updateClientById = async (clientId, data, connection = null) => {
    const {
        firstName, lastName, email, phoneNumber, cafeName, cafeDescription,
        cafeAddress, cafeCity, cafeState, cafeCountry, cafeZip, cafeCurrency,
        cafePhone, cafeEmail, cafeWebsite, socialInstagram, socialFacebook,
        socialTwitter, fullPath
    } = data;

    const sql = `UPDATE clients SET first_name = ?, last_name = ?, email = ?, mobile = ?, cafe_name = ?, cafe_description = ?, address_line1 = ?, city_id = ?, state_id = ?, country_id = ?, postal_code = ?, currency_code = ?, cafe_phone = ?, cafe_email = ?, cafe_website = ?, social_instagram = ?, social_facebook = ?, social_twitter = ?, logo_url = ? WHERE unique_id = ?`;
    const params = [firstName, lastName, email, phoneNumber, cafeName, cafeDescription, cafeAddress, cafeCity, cafeState, cafeCountry, cafeZip, cafeCurrency, cafePhone, cafeEmail, cafeWebsite, socialInstagram, socialFacebook, socialTwitter, fullPath, clientId];
    return await query(sql, params, connection);
};

export const findClientDataById = async (clientId, connection = null) => {
    const sql = `
        SELECT 
            cli.*, 
            cur.name AS currency_name, 
            cur.symbol AS currency_symbol,
            sub.plan_name,
            sub.amount,
            sub.currency AS subscription_currency,
            sub.start_date,
            sub.end_date,
            sub.status AS subscription_status
        FROM clients AS cli
        LEFT JOIN currencies AS cur ON cli.currency_code = cur.code
        LEFT JOIN client_subscriptions AS sub ON cli.unique_id = sub.client_id
        WHERE cli.unique_id = ?
    `;
    return await query(sql, [clientId], connection);
};
