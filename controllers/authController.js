import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

// Helper: remove password
const formatUserResponse = (user) => {
  const { password, ...rest } = user;
  return rest;
};

// ------------------- SUPERADMIN CHECK & REGISTRATION -------------------
export const checkSuperAdminExists = async (req, res) => {
  try {
    const superAdmin = await prisma.user.findFirst({
      where: { role: "SUPERADMIN" },
      select: { id: true, name: true, email: true }
    });
    res.status(200).json({ exists: !!superAdmin, superAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const existingSuperAdmin = await prisma.user.findFirst({ where: { role: "SUPERADMIN" } });
    if (existingSuperAdmin) return res.status(400).json({ message: "SuperAdmin exists" });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "SUPERADMIN", isActive: true }
    });

    const token = jwt.sign({ id: superAdmin.id, role: superAdmin.role }, process.env.JWT_SECRET || "supersecretkey123", { expiresIn: "30d" });

    res.status(201).json({ message: "SuperAdmin created", token, user: formatUserResponse(superAdmin) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- LOGIN / LOGOUT / VERIFY -------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing fields" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return res.status(401).json({ message: "Invalid credentials or inactive" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "supersecretkey123", { expiresIn: "30d" });

    res.json({ message: "Login successful", token, user: formatUserResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = (req, res) => {
  res.json({ message: "Logged out" });
};

export const verifyToken = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ valid: false });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey123");
    res.json({ valid: true, userId: decoded.id, role: decoded.role });
  } catch {
    res.status(401).json({ valid: false });
  }
};

// ------------------- CURRENT USER -------------------
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true }
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- USER MANAGEMENT -------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdBy: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ message: "Missing fields" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, isActive: true, createdBy: req.user.id }
    });

    res.status(201).json({ message: "User created", user: formatUserResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") return res.status(400).json({ message: "Invalid status" });

    if (parseInt(id) === req.user.id) return res.status(403).json({ message: "Cannot change own status" });

    const user = await prisma.user.update({ where: { id: parseInt(id) }, data: { isActive } });
    res.json({ message: "Status updated", user: formatUserResponse(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "SUPERADMIN") return res.status(403).json({ message: "Only SuperAdmin can delete" });

    if (parseInt(id) === req.user.id) return res.status(403).json({ message: "Cannot delete self" });

    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
