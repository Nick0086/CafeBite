import 'dotenv/config';
import test, { describe, it, after } from 'node:test';
import assert from 'node:assert';
import promisePool from '../../config/db.js';
import * as adminLeadService from './admin-lead.service.js';
import * as adminLeadRepository from './admin-lead.repository.js';

describe('Admin Lead CRM Logic Tests', () => {
    after(async () => {
        await promisePool.end();
    });

    it('should fetch all leads when no filter is provided', async () => {
        const leads = await adminLeadRepository.findLeads({ search: '', status: 'all' });
        assert.strictEqual(Array.isArray(leads), true);
        assert.strictEqual(leads.length, 6);
    });

    it('should filter leads by status', async () => {
        const leads = await adminLeadRepository.findLeads({ search: '', status: 'closed_won' });
        assert.strictEqual(Array.isArray(leads), true);
        assert.strictEqual(leads.length, 1);
        assert.strictEqual(leads[0].status, 'closed_won');
    });

    it('should filter leads by search query matching restaurant name or city', async () => {
        const leads = await adminLeadRepository.findLeads({ search: 'Ahmedabad', status: 'all' });
        assert.strictEqual(Array.isArray(leads), true);
        assert.strictEqual(leads.length, 2);
    });

    it('should return correct aggregate statistics', async () => {
        const stats = await adminLeadRepository.getLeadStats();
        assert.strictEqual(typeof stats.totalLeads, 'number');
        assert.strictEqual(stats.totalLeads, 6);
        assert.strictEqual(stats.closedWon, 1);
    });

    it('should return standard success response from service', async () => {
        const result = await adminLeadService.fetchLeads({ search: '', status: 'all' });
        assert.strictEqual(result.success, true);
        assert.strictEqual(result.message, 'Admin leads retrieved successfully');
        assert.strictEqual(Array.isArray(result.data.leads), true);
    });

    it('should create, update, and delete a lead profile', async () => {
        // Create lead
        const createRes = await adminLeadService.createLead({
            restaurant_name: 'Test Gourmet Cafe',
            contact_person: 'John Doe',
            phone: '+919876543210',
            email: 'john@testgourmet.com',
            address: '123 Main Street',
            city: 'Vadodara',
            state: 'Gujarat',
            google_maps_url: 'https://maps.google.com/?q=test',
            status: 'call_needed',
            notes: 'Initial outreach test lead',
        });

        assert.strictEqual(createRes.status, 'success');
        assert.ok(createRes.data.leadId);

        const newLeadId = createRes.data.leadId;

        // Verify inserted record
        const lead = await adminLeadRepository.findLeadById(newLeadId);
        assert.ok(lead);
        assert.strictEqual(lead.restaurant_name, 'Test Gourmet Cafe');
        assert.strictEqual(lead.city, 'Vadodara');

        // Update lead
        const updateRes = await adminLeadService.updateLead(newLeadId, {
            status: 'visit_scheduled',
            notes: 'Visit scheduled for next Monday',
        });
        assert.strictEqual(updateRes.status, 'success');

        const updatedLead = await adminLeadRepository.findLeadById(newLeadId);
        assert.strictEqual(updatedLead.status, 'visit_scheduled');
        assert.strictEqual(updatedLead.notes, 'Visit scheduled for next Monday');

        // Delete lead
        const deleteRes = await adminLeadService.deleteLead(newLeadId);
        assert.strictEqual(deleteRes.status, 'success');

        const deletedLead = await adminLeadRepository.findLeadById(newLeadId);
        assert.strictEqual(deletedLead, null);
    });

    it('should create and fetch audio recordings for a lead', async () => {
        const leadId = 'LEAD_1001';
        const dummyFile = {
            originalname: 'test_sales_call.mp3',
            mimetype: 'audio/mp3',
            size: 1024500,
            buffer: Buffer.from('dummy audio buffer for test'),
        };

        const uploadRes = await adminLeadService.uploadAndAnalyzeRecording(leadId, dummyFile);
        assert.strictEqual(uploadRes.status, 'success');
        assert.ok(uploadRes.data.recording);
        assert.strictEqual(uploadRes.data.recording.lead_id, leadId);
        assert.ok(typeof uploadRes.data.recording.selling_score === 'number');
        assert.ok(Array.isArray(uploadRes.data.recording.strengths));

        const listRes = await adminLeadService.fetchLeadRecordings(leadId);
        assert.strictEqual(listRes.success, true);
        assert.strictEqual(Array.isArray(listRes.data.recordings), true);
        assert.ok(listRes.data.recordings.length > 0);

        // Cleanup test recording
        await adminLeadRepository.deleteRecording(uploadRes.data.recording.unique_id);
    });
});


