import jwt from 'jsonwebtoken';

/**
 * Express middleware to protect /v1/admin/* API endpoints.
 * Validates adminAccessToken JWT issued during TOTP login.
 */
export const adminAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'No admin access token provided',
            });
        }

        // Support both "Bearer <token>" and raw token format
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7).trim()
            : authHeader.trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Admin access token is missing',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded?.role !== 'admin' || decoded?.type !== 'admin_access') {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Invalid admin token claims',
            });
        }

        req.adminUser = decoded;
        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Admin access token has expired',
            });
        }

        return res.status(401).json({
            success: false,
            code: 'UNAUTHORIZED',
            message: 'Invalid admin access token',
        });
    }
};
