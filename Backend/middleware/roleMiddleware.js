// Middleware to allow only specific roles
export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: "Unauthorized." });

    if (!allowedRoles.includes(role))
      return res.status(403).json({ message: "Access forbidden." });

    next();
  };
};

// Example specific role middleware (optional)
export const adminOnly = (req, res, next) => {
  if (req.user?.role === "ADMIN") return next();
  return res.status(403).json({ message: "Access denied. Admins only." });
};
export const superAdminOnly = (req, res, next) => {
  if (req.user?.role === "SUPERADMIN") return next();
  return res.status(403).json({ message: "Access denied. SuperAdmins only." });
};