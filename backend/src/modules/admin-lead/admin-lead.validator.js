import { query, body, param } from 'express-validator';

export const fetchLeadsValidator = [
    query('search')
        .optional()
        .isString()
        .trim(),
    query('status')
        .optional()
        .isIn(['all', 'call_needed', 'follow_up', 'visit_scheduled', 'visited', 'closed_won', 'closed_lost'])
        .withMessage('Invalid status filter value'),
];

export const createLeadValidator = [
    body('restaurant_name')
        .notEmpty().withMessage('Restaurant name is required')
        .isString().withMessage('Restaurant name must be text')
        .trim(),
    body('contact_person')
        .optional({ checkFalsy: true })
        .isString().withMessage('Contact person must be text')
        .trim(),
    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .isString().withMessage('Phone number must be text')
        .trim(),
    body('email')
        .optional({ checkFalsy: true })
        .isEmail().withMessage('Invalid email format')
        .trim(),
    body('address')
        .optional({ checkFalsy: true })
        .isString().withMessage('Address must be text')
        .trim(),
    body('city')
        .notEmpty().withMessage('City is required')
        .isString().withMessage('City must be text')
        .trim(),
    body('state')
        .optional({ checkFalsy: true })
        .isString().withMessage('State must be text')
        .trim(),
    body('google_maps_url')
        .optional({ checkFalsy: true })
        .isURL().withMessage('Invalid Google Maps URL format')
        .trim(),
    body('status')
        .optional()
        .isIn(['call_needed', 'follow_up', 'visit_scheduled', 'visited', 'closed_won', 'closed_lost'])
        .withMessage('Invalid lead status'),
    body('notes')
        .optional({ checkFalsy: true })
        .isString().withMessage('Notes must be text')
        .trim(),
];

export const updateLeadValidator = [
    param('leadId')
        .notEmpty().withMessage('Lead ID is required')
        .isString().trim(),
    body('restaurant_name')
        .optional()
        .notEmpty().withMessage('Restaurant name cannot be empty')
        .isString().trim(),
    body('contact_person')
        .optional({ checkFalsy: true })
        .isString().trim(),
    body('phone')
        .optional()
        .notEmpty().withMessage('Phone number cannot be empty')
        .isString().trim(),
    body('email')
        .optional({ checkFalsy: true })
        .isEmail().withMessage('Invalid email format')
        .trim(),
    body('address')
        .optional({ checkFalsy: true })
        .isString().trim(),
    body('city')
        .optional()
        .notEmpty().withMessage('City cannot be empty')
        .isString().trim(),
    body('state')
        .optional({ checkFalsy: true })
        .isString().trim(),
    body('google_maps_url')
        .optional({ checkFalsy: true })
        .isURL().withMessage('Invalid Google Maps URL format')
        .trim(),
    body('status')
        .optional()
        .isIn(['call_needed', 'follow_up', 'visit_scheduled', 'visited', 'closed_won', 'closed_lost'])
        .withMessage('Invalid lead status'),
    body('notes')
        .optional({ checkFalsy: true })
        .isString().trim(),
];

export const deleteLeadValidator = [
    param('leadId')
        .notEmpty().withMessage('Lead ID is required')
        .isString().trim(),
];

export const leadRecordingValidator = [
    param('leadId')
        .notEmpty().withMessage('Lead ID is required')
        .isString().trim(),
];


