// controllers/userController.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../index.js";

// ================== HELPERS ==================

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "supersecretkey123",
    { expiresIn: "7d" }
  );
};

// ================== ROLE MIDDLEWARE ==================

// Flexible role-based access control
export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access forbidden." });
    }

    next();
  };
};

// ================== AUTH CONTROLLERS ==================

// Register SuperAdmin (run once)
export const registerSuperAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "SUPERADMIN",
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "SuperAdmin registered successfully.",
      token,
      user,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email already exists." });
    }

    res.status(500).json({ message: "Registration failed." });
  }
};

// Register other users (ADMIN / SUPERADMIN only)
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields required." });
  }

  const creatorRole = req.user.role;

  // Role creation rules
  if (creatorRole === "SUPERADMIN") {
    if (!["ADMIN", "MANAGER", "STAFF"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
  } else if (creatorRole === "ADMIN") {
    if (!["MANAGER", "STAFF"].includes(role)) {
      return res.status(403).json({
        message: "Admin can only create MANAGER or STAFF.",
      });
    }
  } else {
    return res.status(403).json({ message: "Not allowed." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        createdBy: req.user.id,
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE_USER",
        performedById: req.user.id,
        targetUserId: user.id,
      },
    });

    res.status(201).json({
      message: "User registered successfully.",
      user,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email already exists." });
    }

    res.status(500).json({ message: "Registration failed." });
  }
};

// Logout user (JWT handled client-side)
export const logoutUser = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully." });
};

// ================== USER CONTROLLERS ==================

// Get all active users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id, isActive: true },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Failed to fetch user." });
  }
};

// Get current logged-in user
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user || user.isActive === false) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Failed to fetch user." });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  const { name, email, password, role } = req.body;
  const data = {};

  // Prevent role downgrade unless SUPERADMIN
  if (role && req.user.role !== "SUPERADMIN") {
    return res
      .status(403)
      .json({ message: "Only SUPERADMIN can change roles." });
  }

  if (name) data.name = name;
  if (email) data.email = email;
  if (role) data.role = role;
  if (password) data.password = await bcrypt.hash(password, 10);

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: "No fields to update." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_USER",
        performedById: req.user.id,
        targetUserId: id,
      },
    });

    res.status(200).json({
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email already exists." });
    }

    res.status(500).json({ message: "Failed to update user." });
  }
};

// Soft delete user
export const deleteUser = async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  // Prevent self-deletion
  if (req.user.id === id) {
    return res
      .status(403)
      .json({ message: "You cannot delete your own account." });
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "DELETE_USER",
        performedById: req.user.id,
        targetUserId: id,
      },
    });

    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Failed to delete user." });
  }
};
