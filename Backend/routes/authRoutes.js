import express from "express";
import { checkSuperAdminExists, getMe, loginUser, registerSuperAdmin, registerUser } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Login (public)
router.post("/login", loginUser);

// Check if SuperAdmin exists (public - for first-time setup)
router.get("/check-superadmin", checkSuperAdminExists);

// Register SuperAdmin (first user - no auth required)
router.post("/register-superadmin", registerSuperAdmin);

// Register users: SuperAdmin→Admin, Admin→Manager/Staff (auth required)
router.post("/register", protect, allowRoles("SUPERADMIN", "ADMIN"), registerUser);

// Get current logged-in user
router.get("/me", protect, getMe);

export default router;
