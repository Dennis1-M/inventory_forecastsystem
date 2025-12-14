import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../index.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Generate JWT token
const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

// ---------------- Check if SuperAdmin exists ----------------
export const checkSuperAdminExists = async (req, res) => {
  try {
    const superAdmin = await prisma.user.findFirst({
      where: { role: "SUPERADMIN" },
    });
    res.status(200).json({ exists: !!superAdmin });
  } catch (err) {
    res.status(500).json({ message: "Error checking SuperAdmin.", error: err.message });
  }
};

// ---------------- Register SuperAdmin ----------------
export const registerSuperAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email, password required." });

  try {
    const existing = await prisma.user.findFirst({ where: { role: "SUPERADMIN" } });
    if (existing)
      return res.status(403).json({ message: "SuperAdmin already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "SUPERADMIN" },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = generateToken(user);
    res.status(201).json({ message: "SuperAdmin registered.", token, user });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ message: "Email already exists." });
    res.status(500).json({ message: "Registration failed.", error: err.message });
  }
};

// ---------------- Register Other Users ----------------
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "All fields required." });

  const registrant = req.user;

  if (registrant.role === "SUPERADMIN") {
    if (!["ADMIN", "MANAGER", "STAFF"].includes(role))
      return res.status(400).json({ message: "Invalid role." });
  } else if (registrant.role === "ADMIN") {
    if (!["MANAGER", "STAFF"].includes(role))
      return res.status(403).json({ message: "Admin can only register MANAGER or STAFF." });
  } else {
    return res.status(403).json({ message: "Only SuperAdmin/Admin can register users." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, createdBy: registrant.id },
      select: { id: true, name: true, email: true, role: true, createdBy: true },
    });

    const token = generateToken(user);
    res.status(201).json({
      message: `${role} registered successfully by ${registrant.role}.`,
      token,
      user,
    });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ message: "Email already exists." });
    res.status(500).json({ message: "Registration failed.", error: err.message });
  }
};

// ---------------- Login User ----------------
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required." });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    const token = generateToken(user);
    res.status(200).json({ message: "Login successful.", token, user });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
};

// ---------------- Get Current Logged-in User ----------------
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch user.", error: err.message });
  }
};

// ---------------- Delete User ----------------
export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  if (parseInt(req.user.id) === id)
    return res.status(400).json({ message: "Users cannot delete themselves." });

  if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID." });

  try {
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user.", error: err.message });
  }
};
// ---------------- Update User ----------------
export const updateUser = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id))
    return res.status(400).json({ message: "Invalid user ID." });

  const { name, email, password, role } = req.body;
  const data = {};

  if (role && req.user.role !== "SUPERADMIN") {
    return res
      .status(403)
      .json({ message: "Only SUPERADMIN can change roles." });
  }

  if (name) data.name = name;
  if (email) data.email = email;
  if (role) data.role = role;
  if (password) data.password = await bcrypt.hash(password, 10);

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    res
      .status(200)
      .json({ message: "User updated successfully.", user: updatedUser });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(409).json({ message: "Email already exists." });

    res
      .status(500)
      .json({ message: "Failed to update user.", error: err.message });
  }
};


// ---------------- Get User by ID ----------------
export const getUserById = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID." });

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    res.status(200).json(user);
  } catch {
    res.status(500).json({ message: "Failed to fetch user." });
  }
};  