import * as templateService from "./template.service.js";
import { handleError } from "../../utils/errorHelper.js";

const getCurrentUser = (user) => ({
    clientId: user.unique_id,
});

export const fetchAllTemplates = async (req, res) => {
    try {
        const { clientId } = getCurrentUser(req.user);
        const response = await templateService.fetchAllTemplates(clientId);
        return res.status(200).json(response);
    } catch (error) {
        return handleError('template.controller.js', 'fetchAllTemplates', res, error);
    }
};

export const fetchTemplateById = async (req, res) => {
    try {
        const { clientId } = getCurrentUser(req.user);
        const { templateId } = req.params;
        const response = await templateService.fetchTemplateById(clientId, templateId);
        return res.status(200).json(response);
    } catch (error) {
        return handleError('template.controller.js', 'fetchTemplateById', res, error);
    }
};

export const createTemplate = async (req, res) => {
    try {
        const { clientId } = getCurrentUser(req.user);
        const { name, config } = req.body;
        const response = await templateService.createTemplate(clientId, name, config);
        return res.status(201).json(response);
    } catch (error) {
        return handleError('template.controller.js', 'createTemplate', res, error);
    }
};

export const updateTemplate = async (req, res) => {
    try {
        const { clientId } = getCurrentUser(req.user);
        const { templateId } = req.params;
        const { name, config } = req.body;
        const response = await templateService.updateTemplate(clientId, templateId, name, config);
        return res.status(200).json(response);
    } catch (error) {
        return handleError('template.controller.js', 'updateTemplate', res, error);
    }
};
