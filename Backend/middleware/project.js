import jwt from "jsonwebtoken";
import colors from "colors";

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
