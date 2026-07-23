import * as tableRepository from "./table.repository.js";
import * as templateRepository from "../template/template.repository.js";
import { createUniqueId } from "../../utils/utils.js";
import { HttpError } from "../../utils/errorHelper.js";

export const fetchAllTables = async (userId) => {
    const tables = await tableRepository.findAllTables(userId);
    return {
        status: "success",
        message: "Tables retrieved successfully.",
        qrCodes: tables
    };
};

export const fetchTableById = async (userId, tableId) => {
    const [table] = await tableRepository.findTableById(userId, tableId);
    if (!table) {
        throw new HttpError("Table not found.", 404);
    }
    return {
        status: "success",
        message: "Table retrieved successfully.",
        data: table
    };
};

export const createTable = async (userId, tableNumbers, templateId) => {
    const template = await templateRepository.findTemplateById(userId, templateId);
    if (!template?.length) {
        throw new HttpError("Template does not exist.", 400);
    }

    if (!tableNumbers) {
        throw new HttpError("Table Name must Be Required.", 400);
    }

    const trimmedTableNumber = tableNumbers.trim();
    const existing = await tableRepository.checkTableByNumber(userId, trimmedTableNumber);

    if (existing?.total > 0) {
        throw new HttpError(`Table ${trimmedTableNumber} already exists With Template.`, 400);
    }

    const tableId = createUniqueId('TWQR');
    const result = await tableRepository.createTable(tableId, userId, templateId, trimmedTableNumber, 1);

    if (result?.affectedRows > 0) {
        return {
            status: "success",
            message: `Table ${trimmedTableNumber} created successfully.`
        };
    }
    throw new HttpError("Failed to create Table.", 500);
};

export const updateTable = async (userId, tableId, tableNumber, templateId) => {
    if (!tableNumber || typeof tableNumber !== 'string' || tableNumber.trim() === '' || tableNumber.length > 50) {
        throw new HttpError("Table number must be a non-empty string and less than 50 characters.", 400);
    }

    const trimmedTableNumber = tableNumber.trim();

    const table = await tableRepository.findTableById(userId, tableId);
    if (!table?.length) {
        throw new HttpError("Table does not exist.", 400);
    }

    const template = await templateRepository.findTemplateById(userId, templateId);
    if (!template?.length) {
        throw new HttpError("Template does not exist.", 400);
    }

    const existing = await tableRepository.checkTableByNumber(userId, trimmedTableNumber, tableId);

    if (existing?.total > 0) {
        throw new HttpError(`Table ${trimmedTableNumber} already exists With Template.`, 400);
    }

    const result = await tableRepository.updateTable(userId, tableId, trimmedTableNumber, templateId);
    
    if (result?.affectedRows > 0) {
        return { status: "success", message: `Table "${trimmedTableNumber}" updated successfully.` };
    }
    throw new HttpError(`Failed to update table "${trimmedTableNumber}".`, 500);
};
