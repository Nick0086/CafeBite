import { body } from 'express-validator';

export const verifyTotpValidator = [
    body('totpPin')
        .notEmpty().withMessage('6-digit TOTP code is required')
        .isString().withMessage('TOTP code must be a string')
        .trim()
        .matches(/^\d{6}$/).withMessage('TOTP code must be exactly 6 digits'),
];
