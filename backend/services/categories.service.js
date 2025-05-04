import categoriesRepository from "../repositories/categories.repository.js";

let counter = 0;

export const createUniqueId = (prefix) => {
    counter++;
    if (counter > 999) counter = 1;

    return prefix + '_' + Date.now() + Math.floor(Math.random() * 1000) + counter;
}

const fetchAllCategories = async (userId) => {
    const categories = await categoriesRepository.getAllCategories(userId);
    return {
        success: true,
        message: categories?.length > 0 ? "Categories fetched successfully" : "No categories found.",
        categories: categories || [],
        status: "success"
    };
};

const addNewCategory = async (userId, name) => {
    // Validate category name
    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        throw { status: 400, code: "INVALID_NAME", message: "Category name must be a non-empty string and less than 255 characters" };
    }

    // Check for duplicate category name
    const [categoryExists] = await categoriesRepository.getCategoryByName(userId, name);
    if (categoryExists?.total > 0) {
        throw { status: 400, code: "CATEGORY_EXISTS", message: `Category ${name} already exists` };
    }

    // Calculate the next position
    const [categoryCountResult] = await categoriesRepository.getCategoryCount(userId);
    const position = (parseInt(categoryCountResult?.total || 0) || 0) + 1;
    const categoryId = createUniqueId('CAT');

    // Insert new category
    const result = await categoriesRepository.createCategory(categoryId, userId, name, 1, position);
    if (result?.affectedRows > 0) {
        return { status: "success", message: `Category ${name} added successfully`, data: { categoryId } };
    }
    throw { status: 500, code: "CATEGORY_ADD_FAILED", message: `Failed to add category ${name}` };
};

const modifyCategory = async (userId, categoryId, name, status) => {
    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim() === '' || name.length > 255) {
        throw { status: 400, code: "INVALID_NAME", message: "Category name must be a non-empty string and less than 255 characters" };
    }
    if (typeof status !== 'number' || ![0, 1].includes(status)) {
        throw { status: 400, code: "INVALID_STATUS", message: "Status must be 0 or 1" };
    }

    // Check if the category exists
    const [category] = await categoriesRepository.getCategoryById(userId, categoryId);
    if (!category) {
        throw { status: 404, code: "CATEGORY_NOT_FOUND", message: "Category not found" };
    }

    // Check for duplicate category name (excluding current category)
    const [categoryCheck] = await categoriesRepository.getCategoryByName(userId, name,categoryId);
    if (categoryCheck?.total > 0) {
        throw { status: 400, code: "CATEGORY_EXISTS", message: `Another category with name ${name} already exists` };
    }

    // Update the category
    await categoriesRepository.updateCategory(userId, categoryId, name, status);
    return { status: "success", message: "Category updated successfully" };
};

export default {
    fetchAllCategories,
    addNewCategory,
    modifyCategory
};