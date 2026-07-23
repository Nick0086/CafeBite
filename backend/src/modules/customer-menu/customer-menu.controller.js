import * as customerMenuService from "./customer-menu.service.js";
import { handleError } from "../../utils/errorHelper.js";

export const fetchMenuByTableId = async (req, res) => {
    try {
        const { tableId, userId } = req.params;
        const response = await customerMenuService.fetchMenuByTableId(userId, tableId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('customer-menu.controller.js', 'fetchMenuByTableId', res, error, 'An unexpected error occurred while retrieving the menu.');
    }
};

export const fetchMenuCategories = async (req, res) => {
    try {
        const { userId } = req.params;
        const response = await customerMenuService.fetchMenuCategories(userId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('customer-menu.controller.js', 'fetchMenuCategories', res, error, 'An unexpected error occurred while retrieving the menu Category.');
    }
};

export const fetchMenuItems = async (req, res) => {
    try {
        const { userId } = req.params;
        const response = await customerMenuService.fetchMenuItems(userId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('customer-menu.controller.js', 'fetchMenuItems', res, error, 'An unexpected error occurred while retrieving the menu items.');
    }
};
