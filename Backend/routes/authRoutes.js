import { Router } from "express";
import {
    checkSuperAdminExists,
    deleteUser,
    getMe,
    loginUser,
    registerSuperAdmin,
    registerUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();

// Public login
router.post("/login", loginUser);

// First-time setup: check SuperAdmin
router.get("/check-superadmin", checkSuperAdminExists);

// Register initial SuperAdmin
router.post("/register-superadmin", registerSuperAdmin);

// Register other users (requires login + role permission)
router.post("/register", protect, allowRoles("SUPERADMIN", "ADMIN"), registerUser);

// Get logged-in user
router.get("/me", protect, getMe);

// Optional: delete user (requires login + role)
router.delete("/:id", protect, allowRoles("SUPERADMIN", "ADMIN"), deleteUser);

export default router;
