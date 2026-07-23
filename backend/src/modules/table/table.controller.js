import * as tableService from "./table.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const fetchAllTables = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const response = await tableService.fetchAllTables(userId);
    return res.status(200).json(response);
});

export const fetchTableById = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const { tableId } = req.params;
    const response = await tableService.fetchTableById(userId, tableId);
    return res.status(200).json(response);
});

export const createTable = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const { tableNumbers, templateId } = req.body;
    const response = await tableService.createTable(userId, tableNumbers, templateId);
    return res.status(200).json(response);
});

export const updateTable = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const { tableId } = req.params;
    const { tableNumbers: tableNumber, templateId } = req.body;
    const response = await tableService.updateTable(userId, tableId, tableNumber, templateId);
    return res.status(200).json(response);
});
