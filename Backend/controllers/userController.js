import bcrypt from "bcryptjs";
import { prisma } from "../index.js";

// ---------------- Get All Users ----------------
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
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
  const id = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: { id },
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
  const id = parseInt(req.params.id);
  const { name, email, password, role } = req.body;

  const data = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (role) data.role = role;
  if (password) data.password = await bcrypt.hash(password, 10);

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user.", error: err.message });
  }
};

// ---------------- Delete User ----------------
export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);

  if (req.user.id === id)
    return res.status(403).json({ message: "Cannot delete your own account." });

  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user.", error: err.message });
  }
};
