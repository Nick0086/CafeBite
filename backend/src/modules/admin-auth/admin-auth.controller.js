import { asyncHandler } from '../../utils/asyncHandler.js';
import * as adminAuthService from './admin-auth.service.js';

export const verifyTotp = asyncHandler(async (req, res) => {
    const { totpPin } = req.body;
    const response = await adminAuthService.verifyAdminTotp(totpPin);
    return res.status(200).json(response);
});

export const getSession = asyncHandler(async (req, res) => {
    const response = await adminAuthService.fetchAdminSession(req.adminUser);
    return res.status(200).json(response);
});

export const logout = asyncHandler(async (req, res) => {
    return res.status(200).json({
        status: 'success',
        message: 'Admin logged out successfully',
    });
});
