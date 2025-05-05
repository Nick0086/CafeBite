import { handleError } from "../utils/utils.js";
import templatesService from "../services/templates.service.js";

const getAllTemplatesList = async (req, res) => {
    try {
        const { unique_id: clientId } = req.user;
        const response = await templatesService.fetchAllTemplates(clientId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('templates.controller.js', 'getAllTemplatesList', res, error, 'An unexpected error occurred while fetching Template.');
    }
};

const getTemplateDataById = async (req, res) => {
    try {
        const { unique_id: clientId } = req.user;
        const { templateId } = req.params;
        const response = await templatesService.fetchTemplateById(clientId, templateId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('templates.controller.js', 'getTemplateDataById', res, error, 'An unexpected error occurred while fetching template.');
    }
};

const createTemplate = async (req, res) => {
    try {
        const { unique_id: clientId } = req.user;
        const { name, config } = req.body;
        const response = await templatesService.addNewTemplate(clientId, name, config);
        return res.status(201).json(response);
    } catch (error) {
        handleError('templates.controller.js', 'createTemplate', res, error, 'An unexpected error occurred while creating the Template.');
    }
};

const updateTemplate = async (req, res) => {
    try {
        const { unique_id: clientId } = req.user;
        const { templateId } = req.params;
        const { name, config } = req.body;
        const response = await templatesService.modifyTemplate(clientId, templateId, name, config);
        return res.status(200).json(response);
    } catch (error) {
        handleError('templates.controller.js', 'updateTemplate', res, error, 'An unexpected error occurred while updating the template.');
    }
};

export default {
    getAllTemplatesList,
    getTemplateDataById,
    createTemplate,
    updateTemplate
};