import { asyncHandler } from "../../utils/asyncHandler.js";
import * as menuItemService from "./menu-item.service.js";

export const fetchAllMenuItems = asyncHandler(async (req, res) => {
    const { unique_id: clientId } = req.user;
    const response = await menuItemService.fetchAllMenuItems(clientId);
    return res.status(200).json(response);
});

export const generateUploadUrl = asyncHandler(async (req, res) => {
    const { unique_id: clientId } = req.user;
    const response = await menuItemService.generateUploadUrl(clientId);
    return res.status(200).json(response);
});

export const createMenuItem = asyncHandler(async (req, res) => {
    const { unique_id: clientId } = req.user;
    const { category_id, name, description, price, availability, veg_status, image_details } = req.body;
    const response = await menuItemService.createMenuItem(clientId, category_id, name, description, price, availability, veg_status, image_details);
    return res.status(201).json(response);
});

export const updateMenuItem = asyncHandler(async (req, res) => {
    const { unique_id: clientId } = req.user;
    const { category_id, name, description, price, availability, status, veg_status, image_details } = req.body;
    const { menuItemId } = req.params;
    const response = await menuItemService.updateMenuItem(clientId, menuItemId, category_id, name, description, price, availability, status, veg_status, image_details);
    return res.status(200).json(response);
});

export const getMenuItemImageUrl = asyncHandler(async (req, res) => {
    const { unique_id: clientId } = req.user;
    const { menuItemId } = req.params;
    const response = await menuItemService.getMenuItemImageUrl(clientId, menuItemId);
    return res.status(200).json(response);
});
