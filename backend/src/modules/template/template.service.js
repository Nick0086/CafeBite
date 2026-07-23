import * as templateRepository from "./template.repository.js";
import { createUniqueId } from "../../utils/utils.js";
import { HttpError } from "../../utils/errorHelper.js";

export const fetchAllTemplates = async (clientId) => {
    const templates = await templateRepository.findAllTemplates(clientId);
    return {
        success: true,
        message: templates?.length > 0 ? "Templates fetched successfully" : "No Template found.",
        templates: templates || [],
        status: "success"
    };
};

export const fetchTemplateById = async (clientId, templateId) => {
    const [template] = await templateRepository.findTemplateById(clientId, templateId);
    return {
        success: true,
        message: template ? "Template fetched successfully" : "No template found.",
        template: template || null,
        status: "success"
    };
};

export const createTemplate = async (clientId, name, config) => {
    const [client] = await templateRepository.checkClientExists(clientId);
    if (!client) {
        throw new HttpError("Client does not exist", 400, "INVALID_CLIENT");
    }

    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        throw new HttpError("Template name must be a non-empty string and less than 255 characters", 400, "INVALID_NAME");
    }

    const trimmedName = name.trim();
    const [existingTemplate] = await templateRepository.checkTemplateByName(clientId, trimmedName);
    if (existingTemplate?.total > 0) {
        throw new HttpError(`Template name ${trimmedName} already exists`, 400, "TEMPLATE_NAME_ALREADY_EXISTS");
    }

    const templateId = createUniqueId('TEMP');
    const result = await templateRepository.createTemplate(templateId, clientId, trimmedName, config);
    if (result?.affectedRows > 0) {
        return {
            status: "success",
            message: `Template ${trimmedName} created successfully`,
            template: result.insertId
        };
    }
    throw new HttpError("Failed to create Template", 400, "TEMPLATE_CREATION_FAILED");
};

export const updateTemplate = async (clientId, templateId, name, config) => {
    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        throw new HttpError("Template name must be a non-empty string and less than 255 characters", 400, "INVALID_NAME");
    }

    const trimmedName = name.trim();
    const [existingTemplate] = await templateRepository.findTemplateById(clientId, templateId);
    if (!existingTemplate) {
        throw new HttpError("Template not found.", 404, "TEMPLATE_NOT_FOUND");
    }

    if (trimmedName !== existingTemplate.name) {
        const [duplicateName] = await templateRepository.checkTemplateByName(clientId, trimmedName, templateId);
        if (duplicateName?.total > 0) {
            throw new HttpError(`Template name "${trimmedName}" already exists.`, 400, "TEMPLATE_NAME_ALREADY_EXISTS");
        }
    }

    const result = await templateRepository.updateTemplate(clientId, templateId, trimmedName, config);
    if (result?.affectedRows > 0) {
        return { status: "success", message: `Template ${trimmedName} updated successfully` };
    }
    throw new HttpError("Failed to update template.", 400, "TEMPLATE_UPDATE_FAILED");
};
