import templatesRepository from '../repositories/templates.repository.js';

let counter = 0;

export const createUniqueId = (prefix) => {
    counter++;
    if (counter > 999) counter = 1;

    return prefix + '_' + Date.now() + Math.floor(Math.random() * 1000) + counter;
}

const fetchAllTemplates = async (clientId) => {
    const templates = await templatesRepository.getAllTemplates(clientId);
    return {
        success: true,
        message: templates?.length > 0 ? "Templates fetched successfully" : "No Template found.",
        templates: templates || [],
        status: "success"
    };
};

const fetchTemplateById = async (clientId, templateId) => {
    const [template] = await templatesRepository.getTemplateById(clientId, templateId);
    return {
        success: true,
        message: template ? "Template fetched successfully" : "No template found.",
        template: template || null,
        status: "success"
    };
};

const addNewTemplate = async (clientId, name, config) => {
    // Validate client_id
    const [client] = await templatesRepository.checkClientExists(clientId);
    if (!client) {
        throw { status: 400, code: "INVALID_CLIENT", message: "Client does not exist" };
    }

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        throw { status: 400, code: "INVALID_NAME", message: "Template name must be a non-empty string and less than 255 characters" };
    }

    const trimmedName = name.trim();
    const [existingTemplate] = await templatesRepository.checkTemplateByName(clientId, trimmedName);
    if (existingTemplate?.total > 0) {
        throw { status: 400, code: "TEMPLATE_NAME_ALREADY_EXISTS", message: `Template name ${trimmedName} already exists` };
    }

    const templateId = createUniqueId('TEMP');
    const result = await templatesRepository.createTemplate(templateId, clientId, trimmedName, config);
    if (result?.affectedRows > 0) {
        return {
            status: "success",
            message: `Template ${trimmedName} created successfully`,
            template: result.insertId
        };
    }
    throw { status: 400, code: "TEMPLATE_CREATION_FAILED", message: "Failed to create Template" };
};

const modifyTemplate = async (clientId, templateId, name, config) => {
    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        throw { status: 400, code: "INVALID_NAME", message: "Template name must be a non-empty string and less than 255 characters" };
    }

    const trimmedName = name.trim();
    const [existingTemplate] = await templatesRepository.getTemplateById(clientId, templateId);
    if (!existingTemplate) {
        throw { status: 404, code: "TEMPLATE_NOT_FOUND", message: "Template not found." };
    }

    if (trimmedName !== existingTemplate.name) {
        const [duplicateName] = await templatesRepository.checkTemplateByName(clientId, trimmedName, templateId);
        if (duplicateName?.total > 0) {
            throw { status: 400, code: "TEMPLATE_NAME_ALREADY_EXISTS", message: `Template name "${trimmedName}" already exists.` };
        }
    }

    const result = await templatesRepository.updateTemplate(clientId, templateId, trimmedName, config);
    if (result?.affectedRows > 0) {
        return { status: "success", message: `Template ${trimmedName} updated successfully` };
    }
    throw { status: 400, code: "TEMPLATE_UPDATE_FAILED", message: "Failed to update template." };
};

export default {
    fetchAllTemplates,
    fetchTemplateById,
    addNewTemplate,
    modifyTemplate
};