import colors from 'colors';
import { prisma } from '../index.js'; // Assuming prisma client is initialized and exported from index.js

// --- Helper function for error handling ---
const handlePrismaError = (res, error, operation) => {
    console.error(colors.red(`Prisma Error during ${operation}:`), error);
    if (error.code === 'P2002') {
        return res.status(409).json({ message: 'A category with that name already exists.' });
    }
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Category not found.' });
    }
    return res.status(500).json({ message: `Failed to ${operation} due to a server error.` });
};

/**
 * @route POST /api/categories
 * @desc Create a new category
 */
export const createCategory = async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Category name is required.' });
    }

    try {
        const newCategory = await prisma.category.create({
            data: {
                name,
                description: description || 'No description provided.',
            },
        });
        res.status(201).json(newCategory);
    } catch (error) {
        handlePrismaError(res, error, 'creating category');
    }
};

/**
 * @route GET /api/categories
 * @desc Get all categories
 */
export const getCategories = async (req, res) => {
    try {
        // Find all categories, ordered alphabetically
        const categories = await prisma.category.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        res.status(200).json(categories);
    } catch (error) {
        handlePrismaError(res, error, 'fetching categories');
    }
};

/**
 * @route PUT /api/categories/:id
 * @desc Update an existing category
 */
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name && !description) {
        return res.status(400).json({ message: 'Provide at least one field (name or description) to update.' });
    }

    try {
        const updatedCategory = await prisma.category.update({
            where: {
                id: parseInt(id), // ID must be an integer
            },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
            },
        });
        res.status(200).json(updatedCategory);
    } catch (error) {
        handlePrismaError(res, error, 'updating category');
    }
};

/**
 * @route DELETE /api/categories/:id
 * @desc Delete a category
 */
export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        // Deleting a category might fail if products are linked. Prisma handles this based on your schema.
        await prisma.category.delete({
            where: {
                id: parseInt(id), // ID must be an integer
            },
        });
        // 204 No Content is standard for successful deletions
        res.status(204).send();
    } catch (error) {
        // P2003 is common if there is a foreign key constraint violation (e.g., product still linked to this category)
        if (error.code === 'P2003') {
            return res.status(400).json({ 
                message: 'Cannot delete category. Products are currently associated with it. Please reassign the products first.' 
            });
        }
        handlePrismaError(res, error, 'deleting category');
    }
};