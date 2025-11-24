import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../index.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// --------------------------------------------
// REGISTER USER
// --------------------------------------------
export const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required." });
    }

    try {
        const hashed = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                role: role || "STAFF"
            },
            select: { id: true, name: true, email: true, role: true }
        });

        const token = generateToken(newUser);

        res.status(201).json({
            message: "User registered successfully.",
            token,
            user: newUser
        });

    } catch (err) {
        return res.status(500).json({ message: "Registration failed.", error: err.message });
    }
};

// --------------------------------------------
// LOGIN USER
// --------------------------------------------
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: "Invalid credentials." });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "Invalid credentials." });

        const token = generateToken(user);

        res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        return res.status(500).json({ message: "Login failed.", error: err.message });
    }
};

// --------------------------------------------
// GET CURRENT LOGGED-IN USER
// --------------------------------------------
export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true }
        });

        if (!user) return res.status(404).json({ message: "User not found." });

        res.status(200).json(user);

    } catch (err) {
        return res.status(500).json({ message: "Could not fetch user.", error: err.message });
    }
};
