import categoriesService from "../services/categories.service.js";
import { handleError } from "../utils/utils.js"; // Adjust path to your error handler

const getAllCategory = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const response = await categoriesService.fetchAllCategories(userId);
        return res.status(200).json(response);
    } catch (error) {
        handleError('categories.controller.js', 'getAllCategory', res, error, 'An unexpected error occurred while fetching categories.');
    }
};

const addCategory = async (req, res) => {
    try {
        console.log(req.user)
        const { unique_id: userId } = req.user;
        const { name } = req.body;
        const response = await categoriesService.addNewCategory(userId, name);
        return res.status(201).json(response);
    } catch (error) {
        handleError('categories.controller.js', 'addCategory', res, error, 'An unexpected error occurred while adding the category');
    }
};

const updateCategory = async (req, res) => {
    try {
        const { unique_id: userId } = req.user;
        const { name, status } = req.body;
        const { categoryId } = req.params;
        const response = await categoriesService.modifyCategory(userId, categoryId, name, status);
        return res.status(200).json(response);
    } catch (error) {
        handleError('categories.controller.js', 'updateCategory', res, error, 'An unexpected error occurred while updating the category');
    }
};

export { getAllCategory, addCategory, updateCategory };