import bcrypt from 'bcryptjs';
import colors from 'colors';
import { prisma } from '../index.js';

// --- Error Handler ---
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

// --- Register User ---
export const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STAFF'
            },
            select: { id: true, name: true, email: true, role: true }
        });

        res.status(201).json(user);

    } catch (error) {
        handlePrismaError(res, error, 'registering user');
    }
};

// --- Get All Users ---
export const getUsers = async (req, res) => {
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

// --- Get User by ID ---
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

// --- Update User ---
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    if (!name && !email && !password && !role) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    try {
        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters.' });
            }
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updated = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData,
            select: { id: true, name: true, email: true, role: true }
        });

        res.status(200).json(updated);
    } catch (error) {
        handlePrismaError(res, error, 'updating user');
    }
};

// --- Delete User ---
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (req.user.id === parseInt(id)) {
        return res.status(403).json({ message: 'You cannot delete your own account.' });
    }

    try {
        await prisma.user.delete({
            where: { id: parseInt(id) },
        });

        res.status(204).send();
    } catch (error) {
        handlePrismaError(res, error, 'deleting user');
    }
};
