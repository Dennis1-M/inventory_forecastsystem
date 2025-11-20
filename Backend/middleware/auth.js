import colors from 'colors';
import jwt from 'jsonwebtoken';

// Ensure this matches the secret used in authController.js
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key'; 

/**
 * Middleware to protect routes: verifies the JWT token.
 * Attaches decoded user info (id, role) to req.user.
 */
export const protect = (req, res, next) => {
    // 1. Check for token in the header
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        // Example: "Bearer TOKEN_STRING"
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ 
            message: 'No token, authorization denied. Please login.' 
        });
    }

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Attach user payload to the request object
        // The payload contains { id: user.id, role: user.role }
        req.user = decoded; 
        
        // 4. Proceed to the next middleware/controller
        next();
    } catch (error) {
        console.error(colors.red('JWT verification failed:'), error.message);
        return res.status(401).json({ 
            message: 'Token is not valid or has expired. Please re-authenticate.' 
        });
    }
};