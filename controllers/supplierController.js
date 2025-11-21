import colors from 'colors';
import { prisma } from '../index.js'; // Assuming prisma client is initialized and exported from index.js

// --- Helper function for error handling ---
const handlePrismaError = (res, error, operation) => {
    console.error(colors.red(`Prisma Error during ${operation}:`), error);
    if (error.code === 'P2002') {
        return res.status(409).json({ message: 'A supplier with that email or name already exists.' });
    }
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Supplier not found.' });
    }
    return res.status(500).json({ message: `Failed to ${operation} due to a server error.` });
};

/**
 * @route POST /api/suppliers
 * @desc Create a new supplier
 */
export const createSupplier = async (req, res) => {
    const { name, contactName, phone, email } = req.body;

    if (!name || !contactName) {
        return res.status(400).json({ message: 'Supplier name and contact name are required.' });
    }

    try {
        const newSupplier = await prisma.supplier.create({
            data: {
                name,
                contactName,
                phone: phone || null,
                email: email || null,
            },
        });
        res.status(201).json(newSupplier);
    } catch (error) {
        handlePrismaError(res, error, 'creating supplier');
    }
};

/**
 * @route GET /api/suppliers
 * @desc Get all suppliers
 */
export const getSuppliers = async (req, res) => {
    try {
        // Find all suppliers, ordered by name
        const suppliers = await prisma.supplier.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        res.status(200).json(suppliers);
    } catch (error) {
        handlePrismaError(res, error, 'fetching suppliers');
    }
};

/**
 * @route PUT /api/suppliers/:id
 * @desc Update an existing supplier
 */
export const updateSupplier = async (req, res) => {
    const { id } = req.params;
    const { name, contactName, phone, email } = req.body;

    try {
        const updatedSupplier = await prisma.supplier.update({
            where: {
                id: parseInt(id),
            },
            data: {
                ...(name && { name }),
                ...(contactName && { contactName }),
                ...(phone !== undefined && { phone: phone || null }), // Allow setting to null
                ...(email !== undefined && { email: email || null }), // Allow setting to null
            },
        });
        res.status(200).json(updatedSupplier);
    } catch (error) {
        handlePrismaError(res, error, 'updating supplier');
    }
};

/**
 * @route DELETE /api/suppliers/:id
 * @desc Delete a supplier
 */
export const deleteSupplier = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.supplier.delete({
            where: {
                id: parseInt(id),
            },
        });
        res.status(204).send(); // 204 No Content
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ 
                message: 'Cannot delete supplier. Products or inventory movements are currently linked to this supplier.' 
            });
        }
        handlePrismaError(res, error, 'deleting supplier');
    }
};