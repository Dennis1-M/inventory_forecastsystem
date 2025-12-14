// middleware/auth.js
// JWT authentication middleware with role validation

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../index.js";

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

// ---------------- Protect Middleware ----------------
// Verifies JWT and attaches the user to req.user
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided. Please login." });

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive)
      return res.status(401).json({ message: "User not found or inactive." });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is invalid or expired." });
  }
};

// ---------------- Role Middleware ----------------
// Allows access only for specified roles
export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role)
      return res.status(401).json({ message: "Unauthorized." });
    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ message: "Access forbidden." });
    next();
  };
};

// ---------------- Specific Role Middleware ----------------
export const adminOnly = (req, res, next) => {
  if (req.user?.role === "ADMIN") return next();
  return res.status(403).json({ message: "Access denied. Admins only." });
};

export const superAdminOnly = (req, res, next) => {
  if (req.user?.role === "SUPERADMIN") return next();
  return res.status(403).json({ message: "Access denied. SuperAdmins only." });
};

export const managerOnly = (req, res, next) => {
  if (req.user?.role === "MANAGER") return next();
  return res.status(403).json({ message: "Access denied. Managers only." });
};

export const staffOnly = (req, res, next) => {
  if (req.user?.role === "STAFF") return next();
  return res.status(403).json({ message: "Access denied. Staff only." });
};

// ---------------- Admin or SuperAdmin Middleware ----------------
export const adminOrSuperAdmin = (req, res, next) => {
  if (["ADMIN", "SUPERADMIN"].includes(req.user?.role)) return next();
  return res.status(403).json({ message: "Access denied. Admins or SuperAdmins only." });
};

// ---------------- Manager or Higher Middleware ----------------
export const managerOrHigher = (req, res, next) => {
  if (["MANAGER", "ADMIN", "SUPERADMIN"].includes(req.user?.role)) return next();
  return res.status(403).json({ message: "Access denied. Managers or higher only." });
};

// ---------------- Staff or Higher Middleware ----------------
export const staffOrHigher = (req, res, next) => {
  if (["STAFF", "MANAGER", "ADMIN", "SUPERADMIN"].includes(req.user?.role)) return next();
  return res.status(403).json({ message: "Access denied. Staff or higher only." });
};

// ================== AUTH CONTROLLERS ==================

// ---------------- Register SuperAdmin ----------------
export const registerSuperAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "SUPERADMIN" },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = generateToken(user);
    res.status(201).json({ message: "SuperAdmin registered.", token, user });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "Email already exists." });
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
    if (!["ADMIN", "MANAGER", "STAFF"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
  } else if (registrant.role === "ADMIN") {
    if (!["MANAGER", "STAFF"].includes(role)) {
      return res.status(403).json({ message: "Admin can only register MANAGER or STAFF." });
    }
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
    if (err.code === "P2002") return res.status(409).json({ message: "Email already exists." });
    res.status(500).json({ message: "Registration failed.", error: err.message });
  }
};

// ================== HELPERS ==================

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
};

// ---------------- Receive Stock ----------------
export const receiveStock = async (req, res) => {
  const { productId, quantity, supplier, notes } = req.body;

  if (!productId || quantity === undefined || Number(quantity) <= 0) {
    return res.status(400).json({ message: "productId and positive quantity required." });
  }

  const pId = Number(productId);
  const qty = Number(quantity);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: pId },
        data: { currentStock: { increment: qty } },
      });

      const movement = await tx.inventoryMovement.create({
        data: {
          productId: pId,
          type: "STOCK_IN",
          quantity: qty,
          description: notes || `Received stock from ${supplier || "unknown supplier"}`,
          userId: req.user?.id || 1,
        },
      });

      // Resolve out-of-stock alerts if stock increased
      if (updatedProduct.currentStock > 0) {
        await tx.alert.updateMany({
          where: {
            productId: pId,
            type: "OUT_OF_STOCK",
            isResolved: false,
          },
          data: { isResolved: true },
        });
      }

      // Auto generate updated alerts
      await checkAndGenerateAlertsForProduct(updatedProduct);

      return { updatedProduct, movement };
    });

    res.status(201).json({ message: "Stock received.", ...result });
  } catch (error) {
    if (error.message === "ProductNotFound") {
      return res.status(404).json({ message: "Product not found." });
    }
    res.status(500).json({ message: "Failed to receive stock.", error: error.message });
  }
};

