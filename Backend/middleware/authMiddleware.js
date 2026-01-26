// middleware/authMiddleware.js
// Middleware for authentication and role-based access control

import jwt from 'jsonwebtoken';
import prisma from "../config/prisma.js";


const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided." });

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) return res.status(401).json({ message: "User not found or inactive." });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Token is invalid or expired." });
  }
};

export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ message: "Unauthorized." });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: "Access forbidden." });
    next();
  };
};

export const adminOnly = (req, res, next) => req.user?.role === "ADMIN" ? next() : res.status(403).json({ message: "Admins only." });
export const superAdminOnly = (req, res, next) => req.user?.role === "SUPERADMIN" ? next() : res.status(403).json({ message: "SuperAdmins only." });
export const managerOnly = (req, res, next) => req.user?.role === "MANAGER" ? next() : res.status(403).json({ message: "Managers only." });
export const staffOnly = (req, res, next) => req.user?.role === "STAFF" ? next() : res.status(403).json({ message: "Staff only." });
export const adminOrSuperAdmin = (req, res, next) => ["ADMIN","SUPERADMIN"].includes(req.user?.role) ? next() : res.status(403).json({ message: "Admins or SuperAdmins only." });
export const managerOrHigher = (req, res, next) => ["MANAGER","ADMIN","SUPERADMIN"].includes(req.user?.role) ? next() : res.status(403).json({ message: "Managers or higher only." });
export const staffOrHigher = (req, res, next) => ["STAFF","MANAGER","ADMIN","SUPERADMIN"].includes(req.user?.role) ? next() : res.status(403).json({ message: "Staff or higher only." });
