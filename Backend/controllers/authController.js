import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../index.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// Generate JWT token
const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

// ---------------- Register User (Admin only) ----------------
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "Name, email, password required." });

  try {
    // Only ADMIN can create new users
    if (role && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can assign roles." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STAFF",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = generateToken(user);

    res.status(201).json({ message: "User registered.", token, user });
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
