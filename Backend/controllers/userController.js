// controllers/userController.js
import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

// ---------------- Get All Users ----------------
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: "asc" },
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users.", error: err.message });
  }
};

// ---------------- Get User by ID ----------------
export const getUserById = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID." });

  try {
    const user = await prisma.user.findFirst({
      where: { id, isActive: true },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user.", error: err.message });
  }
};

// ---------------- Update User ----------------
export const updateUser = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID." });

  const { name, email, password, role } = req.body;
  const data = {};

  if (role && req.user.role !== "SUPERADMIN") {
    return res.status(403).json({ message: "Only SUPERADMIN can change roles." });
  }

  if (name) data.name = name;
  if (email) data.email = email;
  if (role) data.role = role;
  if (password) data.password = await bcrypt.hash(password, 10);

  if (Object.keys(data).length === 0)
    return res.status(400).json({ message: "No fields provided to update." });

  try {
    const updated = await prisma.user.update({
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

    res.status(200).json({ message: "User updated successfully.", user: updated });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "Email already exists." });
    res.status(500).json({ message: "Failed to update user.", error: err.message });
  }
};

// ---------------- Soft Delete User ----------------
export const deleteUser = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID." });

  if (req.user.id === id)
    return res.status(403).json({ message: "Cannot delete your own account." });

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
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user.", error: err.message });
  }
};

// ---------------- Create New User ----------------
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password, and role are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.status(201).json({ message: "User created successfully.", user });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "Email already exists." });
    res.status(500).json({ message: "Failed to create user.", error: err.message });
  }
};
