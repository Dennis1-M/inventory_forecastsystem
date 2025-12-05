import express from "express";
import { getMe, loginUser, registerUser } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Login (public)
router.post("/login", loginUser);

// Register (ADMIN only)
router.post("/register", protect, allowRoles("ADMIN"), registerUser);

// Get current logged-in user
router.get("/me", protect, getMe);

export default router;
