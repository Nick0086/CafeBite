/**
 * CREATE TABLE IF NOT EXISTS admin_leads (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     unique_id CHAR(36) NOT NULL UNIQUE,
 *     restaurant_name VARCHAR(255) NOT NULL,
 *     contact_person VARCHAR(255),
 *     phone VARCHAR(30) NOT NULL,
 *     email VARCHAR(255),
 *     address TEXT,
 *     city VARCHAR(100) NOT NULL,
 *     state VARCHAR(100),
 *     google_maps_url TEXT,
 *     status ENUM('call_needed', 'follow_up', 'visit_scheduled', 'visited', 'closed_won', 'closed_lost') NOT NULL DEFAULT 'call_needed',
 *     notes TEXT,
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 */

import query from '../../utils/query.utils.js';

export const findLeads = async ({ search = '', status = 'all' }, connection = null) => {
    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
        conditions.push('status = ?');
        params.push(status);
    }

    if (search && search.trim() !== '') {
        const searchPattern = `%${search.trim().toLowerCase()}%`;
        conditions.push('(LOWER(restaurant_name) LIKE ? OR LOWER(city) LIKE ? OR LOWER(contact_person) LIKE ?)');
        params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
        SELECT 
            id,
            unique_id,
            restaurant_name,
            contact_person,
            phone,
            email,
            address,
            city,
            state,
            google_maps_url,
            latitude,
            longitude,
            place_source,
            osm_id,
            status,
            notes,
            created_at,
            updated_at
        FROM admin_leads
        ${whereClause}
        ORDER BY created_at DESC
    `;

    return await query(sql, params, connection);
};

export const getLeadStats = async (connection = null) => {
    const sql = `
        SELECT
            COUNT(*) AS total_leads,
            SUM(CASE WHEN status = 'follow_up' THEN 1 ELSE 0 END) AS follow_ups_pending,
            SUM(CASE WHEN status = 'visit_scheduled' THEN 1 ELSE 0 END) AS visits_scheduled,
            SUM(CASE WHEN status = 'closed_won' THEN 1 ELSE 0 END) AS closed_won
        FROM admin_leads
    `;
    const [rows] = await query(sql, [], connection);
    return {
        totalLeads: Number(rows?.total_leads || 0),
        followUpsPending: Number(rows?.follow_ups_pending || 0),
        visitsScheduled: Number(rows?.visits_scheduled || 0),
        closedWon: Number(rows?.closed_won || 0),
    };
};

export const findLeadById = async (leadId, connection = null) => {
    const sql = `
        SELECT 
            id, unique_id, restaurant_name, contact_person, phone, email,
            address, city, state, google_maps_url, latitude, longitude, place_source, osm_id,
            status, notes, created_at, updated_at
        FROM admin_leads
        WHERE unique_id = ?
        LIMIT 1
    `;
    const rows = await query(sql, [leadId], connection);
    return rows[0] || null;
};

export const createLead = async (
    {
        unique_id,
        restaurant_name,
        contact_person = null,
        phone,
        email = null,
        address = null,
        city,
        state = null,
        google_maps_url = null,
        latitude = null,
        longitude = null,
        place_source = 'manual',
        osm_id = null,
        status = 'call_needed',
        notes = null,
    },
    connection = null
) => {
    const sql = `
        INSERT INTO admin_leads (
            unique_id, restaurant_name, contact_person, phone, email,
            address, city, state, google_maps_url, latitude, longitude, place_source, osm_id, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return await query(
        sql,
        [
            unique_id,
            restaurant_name,
            contact_person,
            phone,
            email,
            address,
            city,
            state,
            google_maps_url,
            latitude,
            longitude,
            place_source,
            osm_id,
            status,
            notes,
        ],
        connection
    );
};

export const updateLead = async (leadId, updateData, connection = null) => {
    const fields = [];
    const params = [];

    const allowedFields = [
        'restaurant_name',
        'contact_person',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'google_maps_url',
        'latitude',
        'longitude',
        'place_source',
        'osm_id',
        'status',
        'notes',
    ];

    for (const key of allowedFields) {
        if (updateData[key] !== undefined) {
            fields.push(`${key} = ?`);
            params.push(updateData[key]);
        }
    }

    if (fields.length === 0) return { affectedRows: 0 };

    params.push(leadId);
    const sql = `UPDATE admin_leads SET ${fields.join(', ')} WHERE unique_id = ?`;
    return await query(sql, params, connection);
};

export const deleteLead = async (leadId, connection = null) => {
    const sql = `DELETE FROM admin_leads WHERE unique_id = ?`;
    return await query(sql, [leadId], connection);
};

export const createRecording = async (
    {
        unique_id,
        lead_id,
        file_name,
        file_key,
        file_url,
        file_size,
        mime_type,
        duration = null,
        transcript = null,
        selling_score = null,
        strengths = null,
        improvements = null,
        objection_handling = null,
        closing_recommendations = null,
        raw_ai_response = null,
    },
    connection = null
) => {
    const sql = `
        INSERT INTO admin_lead_recordings (
            unique_id, lead_id, file_name, file_key, file_url, file_size, mime_type,
            duration, transcript, selling_score, strengths, improvements,
            objection_handling, closing_recommendations, raw_ai_response
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return await query(
        sql,
        [
            unique_id,
            lead_id,
            file_name,
            file_key,
            file_url,
            file_size,
            mime_type,
            duration,
            transcript,
            selling_score,
            strengths ? JSON.stringify(strengths) : null,
            improvements ? JSON.stringify(improvements) : null,
            objection_handling ? JSON.stringify(objection_handling) : null,
            closing_recommendations,
            raw_ai_response ? JSON.stringify(raw_ai_response) : null,
        ],
        connection
    );
};

export const findRecordingsByLeadId = async (leadId, connection = null) => {
    const sql = `
        SELECT 
            id, unique_id, lead_id, file_name, file_key, file_url, file_size, mime_type,
            duration, transcript, selling_score, strengths, improvements,
            objection_handling, closing_recommendations, raw_ai_response, created_at, updated_at
        FROM admin_lead_recordings
        WHERE lead_id = ?
        ORDER BY created_at DESC
    `;
    const rows = await query(sql, [leadId], connection);
    return rows.map((row) => ({
        ...row,
        strengths: typeof row.strengths === 'string' ? JSON.parse(row.strengths) : row.strengths,
        improvements: typeof row.improvements === 'string' ? JSON.parse(row.improvements) : row.improvements,
        objection_handling: typeof row.objection_handling === 'string' ? JSON.parse(row.objection_handling) : row.objection_handling,
        raw_ai_response: typeof row.raw_ai_response === 'string' ? JSON.parse(row.raw_ai_response) : row.raw_ai_response,
    }));
};

export const findRecordingById = async (recordingId, connection = null) => {
    const sql = `
        SELECT 
            id, unique_id, lead_id, file_name, file_key, file_url, file_size, mime_type,
            duration, transcript, selling_score, strengths, improvements,
            objection_handling, closing_recommendations, raw_ai_response, created_at, updated_at
        FROM admin_lead_recordings
        WHERE unique_id = ?
        LIMIT 1
    `;
    const rows = await query(sql, [recordingId], connection);
    if (!rows[0]) return null;
    const row = rows[0];
    return {
        ...row,
        strengths: typeof row.strengths === 'string' ? JSON.parse(row.strengths) : row.strengths,
        improvements: typeof row.improvements === 'string' ? JSON.parse(row.improvements) : row.improvements,
        objection_handling: typeof row.objection_handling === 'string' ? JSON.parse(row.objection_handling) : row.objection_handling,
        raw_ai_response: typeof row.raw_ai_response === 'string' ? JSON.parse(row.raw_ai_response) : row.raw_ai_response,
    };
};

export const deleteRecording = async (recordingId, connection = null) => {
    const sql = `DELETE FROM admin_lead_recordings WHERE unique_id = ?`;
    return await query(sql, [recordingId], connection);
};


