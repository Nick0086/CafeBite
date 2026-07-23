import * as tableService from "./table.service.js";
import { handleError } from "../../utils/errorHelper.js";

export const fetchAllTables = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const response = await tableService.fetchAllTables(userId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('table.controller.js', 'fetchAllTables', res, error, 'An unexpected error occurred while retrieving tables.');
    }
};

export const fetchTableById = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { tableId } = req.params;
        const response = await tableService.fetchTableById(userId, tableId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('table.controller.js', 'fetchTableById', res, error, 'An unexpected error occurred while retrieving the table.');
    }
};

export const createTable = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { tableNumbers, templateId } = req.body;
        const response = await tableService.createTable(userId, tableNumbers, templateId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('table.controller.js', 'createTable', res, error, 'An unexpected error occurred while creating tables.');
    }
};

export const updateTable = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { tableId } = req.params;
        const { tableNumbers: tableNumber, templateId } = req.body;
        const response = await tableService.updateTable(userId, tableId, tableNumber, templateId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('table.controller.js', 'updateTable', res, error, 'An unexpected error occurred while updating the table.');
    }
};
