// controllers/authController.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }});
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ userId: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || "secret", { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role }});
  } catch (err) {
    console.error("loginUser:", err);
    res.status(500).json({ error: err.message });
  }
};
