// middleware/project.js
// Middleware for authentication and role-based access control


import colors from "colors";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            message: "No token provided. Please login."
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        console.error(colors.red("JWT Verification Error:"), err.message);
        return res.status(401).json({
            message: "Token is invalid or expired. Please log in again."
        });
    }
};

  // Flexible role-based access control
export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role)
      return res.status(401).json({ message: "Unauthorized." });    
    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ message: "Access forbidden." });

    next(); 
  };
}


