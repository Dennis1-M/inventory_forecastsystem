import jwt from "jsonwebtoken";
import { prisma } from "../index.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

 // Middleware to protect routes
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided. Please login." });

  const token = authHeader.split(" ")[1] || authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // { id, role }

    // Fetch user from DB for up-to-date info
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "User not found." });

    req.user = user; // Attach full user object
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({
      message: "Token is invalid or expired. Please re-authenticate.",
    });
  }
};