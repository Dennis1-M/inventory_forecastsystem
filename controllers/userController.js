import bcrypt from 'bcryptjs';
import colors from 'colors';
import { prisma } from '../index.js'; // Assuming prisma client is initialized and exported from index.js

// --- Helper function for error handling ---
const handlePrismaError = (res, error, operation) => {
    console.error(colors.red(`Prisma Error during ${operation}:`), error);
    if (error.code === 'P2002') {
        return res.status(409).json({ message: 'User with this email already exists.' });
    }
    if (error.code === 'P2025') {
        return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(500).json({ message: `Failed to ${operation} due to a server error.` });
};


/**
 * @route GET /api/users
 * @desc Get all users (Admin only)
 * @access Protected (Requires ADMIN role check in middleware)
 */
export const getUsers = async (req, res) => {
    // In a real application, a middleware would enforce req.user.role === 'ADMIN'
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
            orderBy: { name: 'asc' },
        });
        res.status(200).json(users);
    } catch (error) {
        handlePrismaError(res, error, 'fetching users');
    }
};

/**
 * @route GET /api/users/:id
 * @desc Get user by ID (Admin only)
 * @access Protected (Requires ADMIN role check in middleware)
 */
export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (error) {
        handlePrismaError(res, error, 'fetching user by ID');
    }
};

/**
 * @route PUT /api/users/:id
 * @desc Update user details (Admin only, or self-update)
 * @access Protected (Requires ADMIN/Self-update check in middleware)
 */
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Validate if any fields are present for update
    if (!name && !email && !password && !role) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    try {
        let updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role; // Should be validated against enum in a real app

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
            }
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: { id: true, name: true, email: true, role: true } // Exclude password
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        handlePrismaError(res, error, 'updating user');
    }
};

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user (Admin only)
 * @access Protected (Requires ADMIN role check in middleware)
 */
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    
    // Prevent self-deletion if role check allows it
    if (req.user.id === parseInt(id)) {
        return res.status(403).json({ message: 'You cannot delete your own active account through this endpoint.' });
    }

    try {
        await prisma.user.delete({
            where: { id: parseInt(id) },
        });
        // Note: Prisma cascade delete rules should handle related records (like sales, inventory movements created by this user).
        res.status(204).send();
    } catch (error) {
        handlePrismaError(res, error, 'deleting user');
    }
};