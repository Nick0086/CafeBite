import * as categoryService from "./category.service.js";
import { handleError } from "../../utils/errorHelper.js";

export const fetchAllCategories = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const response = await categoryService.fetchAllCategories(userId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('category.controller.js', 'fetchAllCategories', res, error, 'An unexpected error occurred while fetching categories.');
    }
};

export const createCategory = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { name } = req.body;
        const response = await categoryService.createCategory(userId, name);
        return res.status(201).json(response);
    } catch (error) {
        handleError('category.controller.js', 'createCategory', res, error, 'An unexpected error occurred while adding the category');
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { name, status } = req.body;
        const { categoryId } = req.params;
        const response = await categoryService.updateCategory(userId, categoryId, name, status);
        return res.status(200).json(response);
    } catch (error) {
        handleError('category.controller.js', 'updateCategory', res, error, 'An unexpected error occurred while updating the category');
    }
};
