// Middleware to check if the user has admin privileges

export const admin = (req, res, next) => {
    if (req.user && req.user.role === "ADMIN") {
        return next();
    }

    return res.status(403).json({
        message: "Access denied. Admins only."
    });
};
