import express from "express";
import {
    checkSuperAdminExists,
    deleteUser,
    getAllUsers,
    getMe,
    getProfile,
    loginUser,
    logoutUser,
    registerPublic,
    registerSuperAdmin,
    registerUser,
    updateProfile,
    updateUserStatus,
    verifyToken
} from "../controllers/authController.js";
import { allowRoles, protect, superAdminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/login", loginUser);
router.post("/register", registerPublic);
router.post("/register-superuser", registerSuperAdmin);
router.get("/check-superadmin", checkSuperAdminExists);

// Protected
router.get("/verify", protect, verifyToken);
router.get("/me", protect, getMe);
router.post("/logout", protect, logoutUser);

// Profile management (any authenticated user)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// User management
router.get("/users", protect, allowRoles("SUPERADMIN", "ADMIN"), getAllUsers);
router.post("/users/create", protect, allowRoles("SUPERADMIN", "ADMIN"), registerUser);
router.put("/users/:id/status", protect, allowRoles("SUPERADMIN", "ADMIN"), updateUserStatus);
router.delete("/users/:id", protect, superAdminOnly, deleteUser);

export default router;
