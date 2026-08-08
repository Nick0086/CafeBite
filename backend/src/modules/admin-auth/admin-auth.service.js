import jwt from 'jsonwebtoken';
import { HttpError } from '../../utils/errorHelper.js';
import { verifyTotpPin } from '../../utils/totp.utils.js';
import * as adminAuthRepository from './admin-auth.repository.js';

const DEFAULT_TOTP_SECRET = 'JBSWY3DPEHPK3PXP';

/**
 * Verifies 6-digit TOTP code against ADMIN_TOTP_SECRET and issues adminAccessToken JWT.
 * @param {string} totpPin 
 * @returns {Promise<{ status: string, message: string, adminAccessToken: string, admin: object }>}
 */
export const verifyAdminTotp = async (totpPin) => {
    const secret = process.env.ADMIN_TOTP_SECRET || DEFAULT_TOTP_SECRET;

    const isValid = verifyTotpPin(totpPin, secret, 1);

    if (!isValid) {
        throw new HttpError('Invalid 6-digit verification code. Please check Google Authenticator.', 401, 'INVALID_TOTP');
    }

    const adminProfile = await adminAuthRepository.findAdminProfile('SUPER_ADMIN');

    const adminAccessToken = jwt.sign(
        {
            adminId: adminProfile.adminId,
            username: adminProfile.username,
            role: 'admin',
            type: 'admin_access',
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ADMIN_TOKEN_EXPIRY || '24h' }
    );

    return {
        status: 'success',
        message: 'Admin TOTP authentication successful',
        adminAccessToken,
        admin: {
            adminId: adminProfile.adminId,
            username: adminProfile.username,
            role: 'admin',
        },
    };
};

/**
 * Validates active admin session.
 * @param {object} adminUser - Decoded admin token from req.adminUser
 * @returns {Promise<{ status: string, success: boolean, admin: object }>}
 */
export const fetchAdminSession = async (adminUser) => {
    if (!adminUser || adminUser.role !== 'admin') {
        throw new HttpError('Invalid admin session', 401, 'UNAUTHORIZED');
    }

    return {
        status: 'success',
        success: true,
        admin: {
            adminId: adminUser.adminId || 'SUPER_ADMIN',
            username: adminUser.username || 'admin',
            role: 'admin',
        },
    };
};
