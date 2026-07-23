import * as categoryService from "./category.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const fetchAllCategories = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const response = await categoryService.fetchAllCategories(userId);
    return res.status(200).json(response);
});

export const createCategory = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const { name } = req.body;
    const response = await categoryService.createCategory(userId, name);
    return res.status(201).json(response);
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { unique_id: userId } = req.user;
    const { name, status } = req.body;
    const { categoryId } = req.params;
    const response = await categoryService.updateCategory(userId, categoryId, name, status);
    return res.status(200).json(response);
});
