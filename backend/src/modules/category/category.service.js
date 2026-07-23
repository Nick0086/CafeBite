import * as categoryRepository from "./category.repository.js";
import { createUniqueId } from "../../utils/utils.js";
import { HttpError } from "../../utils/errorHelper.js";

export const fetchAllCategories = async (userId) => {
    const categories = await categoryRepository.findAllCategories(userId);
    return {
        success: true,
        message: categories?.length > 0 ? "Categories fetched successfully" : "No categories found.",
        categories: categories || [],
        status: "success"
    };
};

export const createCategory = async (userId, name) => {
    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        throw new HttpError("Category name must be a non-empty string and less than 255 characters", 400);
    }

    const [categoryExists] = await categoryRepository.findCategoryByName(userId, name);
    if (categoryExists?.total > 0) {
        throw new HttpError(`Category ${name} already exists`, 400);
    }

    const [categoryCountResult] = await categoryRepository.countCategories(userId);
    const position = (parseInt(categoryCountResult?.total || 0) || 0) + 1;
    const categoryId = createUniqueId('CAT');

    const result = await categoryRepository.createCategory(categoryId, userId, name, 1, position);
    if (result?.affectedRows > 0) {
        return { status: "success", message: `Category ${name} added successfully`, data: { categoryId } };
    }
    throw new HttpError(`Failed to add category ${name}`, 500);
};

export const updateCategory = async (userId, categoryId, name, status) => {
    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        throw new HttpError("Category name must be a non-empty string and less than 255 characters", 400);
    }
    if (typeof status !== 'number' || ![0, 1].includes(status)) {
        throw new HttpError("Status must be 0 or 1", 400);
    }

    const [category] = await categoryRepository.findCategoryById(userId, categoryId);
    if (!category) {
        throw new HttpError("Category not found", 404);
    }

    const [categoryCheck] = await categoryRepository.findCategoryByName(userId, name, categoryId);
    if (categoryCheck?.total > 0) {
        throw new HttpError(`Another category with name ${name} already exists`, 400);
    }

    const result = await categoryRepository.updateCategory(userId, categoryId, name, status);
    if (result?.affectedRows === 0) {
        throw new HttpError("Failed to update category", 500);
    }
    return { status: "success", message: "Category updated successfully" };
};
