/*
    Database Schema
    ===============
    CREATE TABLE client_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id CHAR(36) NOT NULL,
        razorpay_subscription_id VARCHAR(255),
        amount DECIMAL(10,2),
        currency VARCHAR(10) DEFAULT 'INR',
        start_date DATE,
        end_date DATE,
        status ENUM('active', 'expired', 'payment_failed') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE client_subscription_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id CHAR(36) NOT NULL,
        razorpay_payment_id VARCHAR(255),
        razorpay_invoice_id VARCHAR(255),
        amount DECIMAL(10,2),
        currency VARCHAR(10) DEFAULT 'INR',
        status ENUM('paid', 'failed') DEFAULT 'paid',
        notes TEXT,
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
*/

import query from "../../utils/query.utils.js";

export const findSubscriptionByClientId = async (clientId, connection = null) => {
    const sql = `SELECT * FROM client_subscriptions WHERE client_id = ?`;
    return await query(sql, [clientId], connection);
};

export const createSubscription = async (clientId, razorpayPaymentId, amount, currency, startDate, endDate, connection = null) => {
    const sql = `INSERT INTO client_subscriptions (client_id, razorpay_subscription_id, amount, currency, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`;
    return await query(sql, [clientId, razorpayPaymentId, amount, currency, startDate, endDate], connection);
};

export const updateSubscription = async (clientId, razorpayPaymentId, amount, currency, startDate, endDate, connection = null) => {
    const sql = `UPDATE client_subscriptions SET razorpay_subscription_id = ?, amount = ?, currency = ?, start_date = ?, end_date = ?, status = 'active' WHERE client_id = ?`;
    return await query(sql, [razorpayPaymentId, amount, currency, startDate, endDate, clientId], connection);
};

export const updateSubscriptionStatus = async (clientId, status, connection = null) => {
    const sql = `UPDATE client_subscriptions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE client_id = ? AND status = 'active'`;
    return await query(sql, [status, clientId], connection);
};

export const createSubscriptionHistory = async (clientId, paymentId, invoiceId, amount, currency, status, notes, connection = null) => {
    const sql = `INSERT INTO client_subscription_history (client_id, razorpay_payment_id, razorpay_invoice_id, amount, currency, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    return await query(sql, [clientId, paymentId, invoiceId, amount, currency, status, notes], connection);
};

export const findSubscriptionHistory = async (clientId, limit, offset, connection = null) => {
    const sql = `SELECT * FROM client_subscription_history WHERE client_id = ? ORDER BY paid_at DESC LIMIT ? OFFSET ?`;
    return await query(sql, [clientId, limit, offset], connection);
};

export const countSubscriptionHistory = async (clientId, connection = null) => {
    const sql = `SELECT COUNT(*) as total FROM client_subscription_history WHERE client_id = ?`;
    return await query(sql, [clientId], connection);
};
