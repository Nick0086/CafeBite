import tablesQrcodeRepositories from '../repositories/tables-qrcode.repositories.js';
import templatesRepository from '../repositories/templates.repository.js';

let counter = 0;

export const createUniqueId = (prefix) => {
    counter++;
    if (counter > 999) counter = 1;

    return prefix + '_' + Date.now() + Math.floor(Math.random() * 1000) + counter;
}

const fetchAllTables = async (userId) => {
    const tables = await tablesQrcodeRepositories.getAllTables(userId);
    return {
        status: "success",
        message: "Tables retrieved successfully.",
        qrCodes: tables
    };
};

const fetchTableById = async (userId, tableId) => {
    const [table] = await tablesQrcodeRepositories.getTableById(userId, tableId);
    if (!table) {
        throw { status: 404, code: "TABLE_NOT_FOUND", message: "Table not found." };
    }
    return {
        status: "success",
        message: "Table retrieved successfully.",
        data: table
    };
};

const addTables = async (userId, tableNumbers, templateId) => {
    // Validate template_id
    const template = await templatesRepository.getTemplateById(userId, templateId);
    if (!template?.length) {
        throw { status: 400, code: "INVALID_TEMPLATE", message: "Template does not exist." };
    }

    // Validate table numbers
    if (!tableNumbers) {
        throw { status: 400, code: "INVALID_TABLE_NUMBERS", message: "Table Name must Be Rquired." };
    }

    const trimmedTableNumber = tableNumbers.trim();
    const existing = await tablesQrcodeRepositories.checkTableByNumber(userId, trimmedTableNumber);

    if (existing?.total > 0) {
        throw { status: 400, code: "TABLE_ALREADY_EXISTS", message: `Table ${trimmedTableNumber} already exists With Template.` };
    }

    const tableId = createUniqueId('TWQR');
    const result = await tablesQrcodeRepositories.createTable(tableId, userId, templateId, trimmedTableNumber, 1);

    if (result?.affectedRows > 0) {
        return {
            status: "success",
            message: `Table ${trimmedTableNumber} created successfully.`
        };
    } else {
        throw { status: 400, code: "TABLE_CREATION_FAILED", message: "Failed to create Table." };
    }
};

const modifyTable = async (userId, tableId, tableNumber, templateId) => {
    // Validate inputs
    if (!tableNumber || typeof tableNumber !== 'string' || tableNumber.trim() === '' || tableNumber.length > 50) {
        throw { status: 400, code: "INVALID_TABLE_NUMBER", message: "Table number must be a non-empty string and less than 50 characters." };
    }

    const trimmedTableNumber = tableNumber.trim();

    const table = await tablesQrcodeRepositories.getTableById(userId, tableId);
    if (!table?.length) {
        throw { status: 400, code: "TABLE_NOT_FOUND", message: "Table does not exist." };
    }

    const template = await templatesRepository.getTemplateById(userId, templateId);
    if (!template?.length) {
        throw { status: 400, code: "INVALID_TEMPLATE", message: "Template does not exist." };
    }

    const existing = await tablesQrcodeRepositories.checkTableByNumber(userId, trimmedTableNumber, tableId);

    if (existing?.total > 0) {
        throw { status: 400, code: "TABLE_ALREADY_EXISTS", message: `Table ${trimmedTableNumber} already exists With Template.` };
    }

    const result = await tablesQrcodeRepositories.updateTable(userId, tableId, trimmedTableNumber, templateId);
    
    if (result?.affectedRows > 0) {
        return { status: "success", message: `Table "${trimmedTableNumber}" updated successfully.` };
    }
    throw { status: 500, code: "TABLE_UPDATE_FAILED", message: `Failed to update table "${trimmedTableNumber}".` };
};

export default {
    fetchAllTables,
    fetchTableById,
    addTables,
    modifyTable
};