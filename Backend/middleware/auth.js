import colors from "colors";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

// Protect middleware — verifies token
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res
      .status(401)
      .json({ message: "No token provided. Please login again." });

  const token = authHeader.split(" ")[1] || authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    console.error(colors.red("JWT verification failed:"), error.message);
    return res
      .status(401)
      .json({ message: "Token is invalid or expired. Please re-authenticate." });
  }
};

// Admin-only middleware
export const admin = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ message: "Not authorized." });

  if (req.user.role !== "ADMIN")
    return res.status(403).json({ message: "Access denied. Admins only." });

  next();
};
