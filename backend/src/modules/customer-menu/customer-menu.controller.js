import * as customerMenuService from "./customer-menu.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const fetchMenuByTableId = asyncHandler(async (req, res) => {
    const { tableId, userId } = req.params;
    const response = await customerMenuService.fetchMenuByTableId(userId, tableId);
    return res.status(200).json(response);
});

export const fetchMenuCategories = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const response = await customerMenuService.fetchMenuCategories(userId);
    return res.status(200).json(response);
});

export const fetchMenuItems = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const response = await customerMenuService.fetchMenuItems(userId);
    return res.status(200).json(response);
});
