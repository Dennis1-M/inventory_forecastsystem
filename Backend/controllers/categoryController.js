import colors from 'colors';
import { prisma } from '../index.js';

// --- Helper for Prisma errors ---
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

// --- Create ---
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

// --- Get All ---
export const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        res.status(200).json(categories);
    } catch (error) {
        handlePrismaError(res, error, 'fetching categories');
    }
};

// --- FIX: Get By ID ---
export const getCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) }
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found.' });
        }

        res.status(200).json(category);
    } catch (error) {
        handlePrismaError(res, error, 'fetching category by ID');
    }
};

// --- Update ---
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name && !description) {
        return res.status(400).json({
            message: 'Provide at least one field (name or description) to update.',
        });
    }

    try {
        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: { name, description },
        });
        res.status(200).json(updatedCategory);
    } catch (error) {
        handlePrismaError(res, error, 'updating category');
    }
};

// --- Delete ---
export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.category.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: 'Cannot delete category. Products are associated with it.',
            });
        }
        handlePrismaError(res, error, 'deleting category');
    }
};
