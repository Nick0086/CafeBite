import { Router } from 'express';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';
import validate from '../../middleware/validate.middleware.js';
import {
    fetchLeadsValidator,
    createLeadValidator,
    updateLeadValidator,
    deleteLeadValidator,
    leadRecordingValidator,
} from './admin-lead.validator.js';
import * as adminLeadController from './admin-lead.controller.js';

const router = Router();

router.get(
    '/',
    adminAuthMiddleware,
    fetchLeadsValidator,
    validate,
    adminLeadController.fetchLeads
);

router.post(
    '/',
    adminAuthMiddleware,
    createLeadValidator,
    validate,
    adminLeadController.createLead
);

router.put(
    '/:leadId',
    adminAuthMiddleware,
    updateLeadValidator,
    validate,
    adminLeadController.updateLead
);

router.delete(
    '/:leadId',
    adminAuthMiddleware,
    deleteLeadValidator,
    validate,
    adminLeadController.deleteLead
);

router.post(
    '/:leadId/recordings',
    adminAuthMiddleware,
    leadRecordingValidator,
    validate,
    adminLeadController.uploadRecording
);

router.get(
    '/:leadId/recordings',
    adminAuthMiddleware,
    leadRecordingValidator,
    validate,
    adminLeadController.fetchLeadRecordings
);

export default router;


