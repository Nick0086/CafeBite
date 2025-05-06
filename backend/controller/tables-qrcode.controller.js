import { handleError } from "../utils/utils.js";
import tablesQrcodeService from '../services/tables-qrcode.service.js';

const getAllTables = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const response = await tablesQrcodeService.fetchAllTables(userId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('tables.controller.js', 'getAllTables', res, error, 'An unexpected error occurred while retrieving tables.');
    }
};

const getTableById = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { tableId } = req.params;
        const response = await tablesQrcodeService.fetchTableById(userId, tableId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('tables.controller.js', 'getTableById', res, error, 'An unexpected error occurred while retrieving the table.');
    }
};

const createTables = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { tableNumbers, templateId } = req.body;
        const response = await tablesQrcodeService.addTables(userId, tableNumbers, templateId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('tables.controller.js', 'createTables', res, error, 'An unexpected error occurred while creating tables.');
    }
};

const updateTable = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { tableId } = req.params;
        const { tableNumbers: tableNumber, templateId } = req.body;
        const response = await tablesQrcodeService.modifyTable(userId, tableId, tableNumber, templateId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('tables.controller.js', 'updateTable', res, error, 'An unexpected error occurred while updating the table.');
    }
};

export default {
    getAllTables,
    getTableById,
    createTables,
    updateTable
};