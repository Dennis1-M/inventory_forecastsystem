// controllers/userController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await prisma.user.findUnique({ where: { email }});
    if (exists) return res.status(400).json({ error: "Email already in use" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role: role || "USER" }});
    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err) {
    console.error("registerUser:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true }});
    res.json(users);
  } catch (err) {
    console.error("getUsers:", err);
    res.status(500).json({ error: err.message });
  }
};
