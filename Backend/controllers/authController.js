import bcrypt from 'bcryptjs';
import colors from 'colors';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js'; // Assuming prisma client is initialized and exported from index.js

// Ensure you set this securely in your environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; 

// --- Helper function for error handling ---
const handleAuthError = (res, error, operation) => {
    console.error(colors.red(`Auth Error during ${operation}:`), error);
    if (error.code === 'P2002') {
        return res.status(409).json({ message: 'User with this email already exists.' });
    }
    return res.status(500).json({ message: `Failed to ${operation} due to a server error.` });
};

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public (or restricted to admin creation in a real app)
 */
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all required fields: name, email, and password.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    try {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                // Default role to 'STAFF' if not provided, or validate against enum
                role: role || 'STAFF', 
            },
            select: { id: true, name: true, email: true, role: true } // Exclude password from response
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.status(201).json({ 
            token, 
            user: newUser,
            message: 'User registered successfully.'
        });
    } catch (error) {
        handleAuthError(res, error, 'user registration');
    }
};

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter both email and password.' });
    }

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid Credentials.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Credentials.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Return token and user data (excluding password)
        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            message: 'Login successful.'
        });
    } catch (error) {
        handleAuthError(res, error, 'user login');
    }
};

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user details
 * @access Protected
 */
export const getMe = async (req, res) => {
    try {
        // req.user is set by the authentication middleware
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        handleAuthError(res, error, 'fetching user details');
    }
};