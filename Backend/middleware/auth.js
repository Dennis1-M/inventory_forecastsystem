// middleware/auth.js
import colors from "colors";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

/**
 * Protect middleware — verifies token
 */
export const protect = (req, res, next) => {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader) {
        // Accept both "Bearer token" and "token"
        const parts = authHeader.split(" ");
        token = parts.length === 2 ? parts[1] : parts[0];
    }

    if (!token) {
        return res.status(401).json({
            message: "No token provided. Please login again.",
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach decoded payload: { id, role }
        req.user = decoded;

        next();
    } catch (error) {
        console.error(colors.red("JWT verification failed:"), error.message);

        return res.status(401).json({
            message: "Token is not valid or has expired. Please re-authenticate.",
        });
    }
};

/**
 * Admin-only access
 */
export const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
    }

    if (req.user.role === "ADMIN") {
        return next();
    }

    console.warn(
        colors.yellow(
            `Authorization denied. User ID ${req.user.id}, role ${req.user.role}`
        )
    );

    return res.status(403).json({
        message:
            "Access denied. You require administrative privileges to perform this action.",
    });
};
