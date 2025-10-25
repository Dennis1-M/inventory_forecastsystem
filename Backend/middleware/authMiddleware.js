// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) return res.status(401).json({ error: "Access denied. Token missing." });
  const parts = authHeader.split(" ");
  const token = parts.length === 2 ? parts[1] : parts[0];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
