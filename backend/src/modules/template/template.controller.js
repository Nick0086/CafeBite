import * as templateService from "./template.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const getCurrentUser = (user) => ({
    clientId: user.unique_id,
});

export const fetchAllTemplates = asyncHandler(async (req, res) => {
    const { clientId } = getCurrentUser(req.user);
    const response = await templateService.fetchAllTemplates(clientId);
    return res.status(200).json(response);
});

export const fetchTemplateById = asyncHandler(async (req, res) => {
    const { clientId } = getCurrentUser(req.user);
    const { templateId } = req.params;
    const response = await templateService.fetchTemplateById(clientId, templateId);
    return res.status(200).json(response);
});

export const createTemplate = asyncHandler(async (req, res) => {
    const { clientId } = getCurrentUser(req.user);
    const { name, config } = req.body;
    const response = await templateService.createTemplate(clientId, name, config);
    return res.status(201).json(response);
});

export const updateTemplate = asyncHandler(async (req, res) => {
    const { clientId } = getCurrentUser(req.user);
    const { templateId } = req.params;
    const { name, config } = req.body;
    const response = await templateService.updateTemplate(clientId, templateId, name, config);
    return res.status(200).json(response);
});
