import * as adminLeadRepository from './admin-lead.repository.js';
import { HttpError } from '../../utils/errorHelper.js';
import { createUniqueId } from '../../utils/utils.js';
import { uploadObject, getSignedUrl } from '../../providers/minio/minio.provider.js';
import { analyzeSalesAudio } from '../../providers/gemini/gemini.provider.js';
export { discoverLeads, bulkImportLeads } from './admin-lead-discovery.service.js';

export const fetchLeads = async ({ search, status }) => {
    const leads = await adminLeadRepository.findLeads({ search, status });
    const stats = await adminLeadRepository.getLeadStats();

    return {
        success: true,
        message: 'Admin leads retrieved successfully',
        data: {
            leads,
            stats,
        },
    };
};

export const createLead = async (leadData) => {
    const unique_id = createUniqueId('LEAD');
    const result = await adminLeadRepository.createLead({
        unique_id,
        ...leadData,
    });

    if (!result || result.affectedRows === 0) {
        throw new HttpError('Failed to create lead', 500);
    }

    return {
        status: 'success',
        message: 'Lead created successfully',
        data: {
            leadId: unique_id,
        },
    };
};

export const updateLead = async (leadId, updateData) => {
    const existing = await adminLeadRepository.findLeadById(leadId);
    if (!existing) {
        throw new HttpError('Lead not found', 404);
    }

    await adminLeadRepository.updateLead(leadId, updateData);

    return {
        status: 'success',
        message: 'Lead updated successfully',
    };
};

export const deleteLead = async (leadId) => {
    const existing = await adminLeadRepository.findLeadById(leadId);
    if (!existing) {
        throw new HttpError('Lead not found', 404);
    }

    await adminLeadRepository.deleteLead(leadId);

    return {
        status: 'success',
        message: 'Lead deleted successfully',
    };
};

export const uploadAndAnalyzeRecording = async (leadId, file) => {
    if (!file) {
        throw new HttpError('Audio file is required', 400);
    }

    const lead = await adminLeadRepository.findLeadById(leadId);
    if (!lead) {
        throw new HttpError('Lead not found', 404);
    }

    const recordingId = createUniqueId('REC');
    const fileExtension = file.originalname ? file.originalname.split('.').pop() : 'mp3';
    const fileKey = `lead-recordings/${leadId}/${recordingId}.${fileExtension}`;

    let fileUrl = '';
    try {
        await uploadObject(file.buffer, fileKey, file.mimetype);
        fileUrl = await getSignedUrl(fileKey);
    } catch (uploadError) {
        console.warn('MinIO upload fallback triggered:', uploadError.message);
        fileUrl = `/uploads/${fileKey}`;
    }

    const aiAnalysis = await analyzeSalesAudio(file.buffer, file.mimetype);

    const recordingData = {
        unique_id: recordingId,
        lead_id: leadId,
        file_name: file.originalname || `recording_${recordingId}.${fileExtension}`,
        file_key: fileKey,
        file_url: fileUrl,
        file_size: file.size,
        mime_type: file.mimetype,
        duration: aiAnalysis.duration || null,
        transcript: aiAnalysis.transcript || null,
        selling_score: aiAnalysis.selling_score || 7,
        strengths: aiAnalysis.strengths || [],
        improvements: aiAnalysis.improvements || [],
        objection_handling: aiAnalysis.objection_handling || [],
        closing_recommendations: aiAnalysis.closing_recommendations || null,
        raw_ai_response: aiAnalysis.raw_ai_response || null,
    };

    await adminLeadRepository.createRecording(recordingData);

    const recording = await adminLeadRepository.findRecordingById(recordingId);

    return {
        status: 'success',
        message: 'Audio recording analyzed successfully',
        data: {
            recording,
        },
    };
};

export const fetchLeadRecordings = async (leadId) => {
    const lead = await adminLeadRepository.findLeadById(leadId);
    if (!lead) {
        throw new HttpError('Lead not found', 404);
    }

    const recordings = await adminLeadRepository.findRecordingsByLeadId(leadId);

    return {
        success: true,
        message: 'Lead recordings fetched successfully',
        data: {
            recordings,
        },
    };
};


