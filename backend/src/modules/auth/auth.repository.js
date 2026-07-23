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
        session_id CHAR(36) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        login_type VARCHAR(45) NOT NULL,
        login_id VARCHAR(45) NOT NULL,
        expires_at TIMESTAMP NOT NULL
    );

    CREATE TABLE password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id CHAR(36) NOT NULL,
        token CHAR(36) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(unique_id)
    );
*/

import query from "../../utils/query.utils.js";

export const findUserByEmailOrMobile = async (loginId, connection = null) => {
    const sql = `SELECT unique_id, first_name, last_name, mobile, email FROM clients WHERE email = ? OR mobile = ?`;
    const params = [loginId, loginId];
    return await query(sql, params, connection);
};

export const findUserCredentialsByLoginId = async (loginId, connection = null) => {
    const sql = `SELECT password, unique_id, first_name, last_name, mobile, email, logo_url FROM clients WHERE email = ? OR mobile = ?`;
    const params = [loginId, loginId];
    return await query(sql, params, connection);
};

export const createOtp = async (otpSessionId, otp, expiresAt, loginType, loginId, connection = null) => {
    const sql = `INSERT INTO otps (session_id, otp, expires_at, login_type, login_id) VALUES (?, ?, ?, ?, ?)`;
    const params = [otpSessionId, otp, expiresAt, loginType, loginId];
    return await query(sql, params, connection);
};

export const findValidOtp = async (otpSessionId, otp, connection = null) => {
    const sql = `SELECT * FROM otps WHERE session_id = ? AND otp = ? AND expires_at > NOW()`;
    const params = [otpSessionId, otp];
    return await query(sql, params, connection);
};

export const createSession = async (info, connection = null) => {
    const { sessionId, userId, userAgent, loginId, loginType, ipAddress, expiresAt, refreshToken } = info;
    const sql = `INSERT INTO client_sessions (session_id, client_id, user_agent, login_id, login_type, ip_address, expires_at, refresh_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [sessionId, userId, userAgent, loginId, loginType, ipAddress, expiresAt, refreshToken];
    return await query(sql, params, connection);
};

export const updateSessionsRevoked = async (userId, userAgent, connection = null) => {
    const sql = `UPDATE client_sessions SET is_revoke = ? WHERE client_id = ? AND user_agent = ?`;
    const params = [1, userId, userAgent];
    return await query(sql, params, connection);
};

export const findUserByEmail = async (email, connection = null) => {
    const sql = `SELECT unique_id, email FROM clients WHERE email = ?`;
    const params = [email];
    return await query(sql, params, connection);
};

export const createPasswordResetToken = async (userId, token, expiresAt, connection = null) => {
    const sql = `INSERT INTO password_reset_tokens (client_id, token, expires_at) VALUES (?, ?, ?)`;
    const params = [userId, token, expiresAt];
    return await query(sql, params, connection);
};

export const findValidPasswordResetToken = async (token, connection = null) => {
    const sql = `SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()`;
    const params = [token];
    return await query(sql, params, connection);
};

export const updateUserPassword = async (userId, hashedPassword, connection = null) => {
    const sql = `UPDATE clients SET password = ? WHERE unique_id = ?`;
    const params = [hashedPassword, userId];
    return await query(sql, params, connection);
};

export const deletePasswordResetToken = async (token, connection = null) => {
    const sql = `DELETE FROM password_reset_tokens WHERE token = ?`;
    const params = [token];
    return await query(sql, params, connection);
};

export const findActiveSession = async (userId, userAgent, refreshToken, connection = null) => {
    const sql = `SELECT * FROM client_sessions WHERE is_revoke = 0 AND client_id = ? AND user_agent = ? AND refresh_token = ?`;
    const params = [userId, userAgent, refreshToken];
    return await query(sql, params, connection);
};
