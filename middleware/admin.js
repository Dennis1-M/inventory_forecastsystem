import colors from 'colors';

/**
 * Middleware to restrict access to ADMIN users only.
 * Requires the 'protect' middleware to run first (req.user must exist).
 */
export const admin = (req, res, next) => {
    // Check if req.user exists (protection must have passed) and if the role is ADMIN
    if (req.user && req.user.role === 'ADMIN') {
        next(); // User is an admin, proceed
    } else {
        console.warn(colors.yellow(`Authorization denied for user ID ${req.user.id}: Role is ${req.user.role}`));
        res.status(403).json({ 
            message: 'Access denied. You require administrative privileges to perform this action.' 
        });
    }
};