import { adminApi, handleApiError } from '@/utils/api';

export const fetchAdminLeads = async ({ search = '', status = 'all' } = {}) => {
    try {
        const response = await adminApi.get('/admin/leads', {
            params: {
                search: search || undefined,
                status: status || undefined,
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createAdminLead = async (leadData) => {
    try {
        const response = await adminApi.post('/admin/leads', leadData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateAdminLead = async ({ leadId, ...leadData }) => {
    try {
        const response = await adminApi.put(`/admin/leads/${leadId}`, leadData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteAdminLead = async (leadId) => {
    try {
        const response = await adminApi.delete(`/admin/leads/${leadId}`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const uploadAdminLeadRecording = async (leadId, audioFile) => {
    try {
        const formData = new FormData();
        formData.append('audio', audioFile);

        const response = await adminApi.post(`/admin/leads/${leadId}/recordings`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const fetchAdminLeadRecordings = async (leadId) => {
    try {
        const response = await adminApi.get(`/admin/leads/${leadId}/recordings`);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const discoverAdminLeads = async ({ locationQuery, lat, lng, radiusMeters }) => {
    try {
        const response = await adminApi.post('/admin/leads/discover', {
            locationQuery,
            lat,
            lng,
            radiusMeters,
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const bulkImportAdminLeads = async (leads) => {
    try {
        const response = await adminApi.post('/admin/leads/bulk-import', { leads });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};


