import multer from 'multer';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { HttpError } from '../../utils/errorHelper.js';
import * as adminLeadService from './admin-lead.service.js';

export const fetchLeads = asyncHandler(async (req, res) => {
    const { search, status } = req.query;
    const response = await adminLeadService.fetchLeads({ search, status });
    return res.status(200).json(response);
});

export const createLead = asyncHandler(async (req, res) => {
    const response = await adminLeadService.createLead(req.body);
    return res.status(201).json(response);
});

export const updateLead = asyncHandler(async (req, res) => {
    const { leadId } = req.params;
    const response = await adminLeadService.updateLead(leadId, req.body);
    return res.status(200).json(response);
});

export const deleteLead = asyncHandler(async (req, res) => {
    const { leadId } = req.params;
    const response = await adminLeadService.deleteLead(leadId);
    return res.status(200).json(response);
});

const upload = multer({
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'audio/mpeg',
            'audio/mp3',
            'audio/m4a',
            'audio/x-m4a',
            'audio/wav',
            'audio/x-wav',
            'audio/webm',
            'audio/ogg',
            'audio/aac',
        ];
        const allowedExts = /\.(mp3|m4a|wav|webm|ogg)$/i;

        if (allowedTypes.includes(file.mimetype) || allowedExts.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(new HttpError('Only audio files (.mp3, .m4a, .wav, .webm, .ogg) up to 25MB are allowed', 400));
        }
    },
});

const handleAudioUpload = (req) => {
    return new Promise((resolve, reject) => {
        upload.single('audio')(req, req.res, (err) => {
            if (err) {
                return reject(new HttpError(err.message || 'Error uploading audio file', 400, 'AUDIO_UPLOAD_ERROR'));
            }
            resolve();
        });
    });
};

export const uploadRecording = asyncHandler(async (req, res) => {
    await handleAudioUpload(req);
    const { leadId } = req.params;
    const response = await adminLeadService.uploadAndAnalyzeRecording(leadId, req.file);
    return res.status(201).json(response);
});

export const fetchLeadRecordings = asyncHandler(async (req, res) => {
    const { leadId } = req.params;
    const response = await adminLeadService.fetchLeadRecordings(leadId);
    return res.status(200).json(response);
});


