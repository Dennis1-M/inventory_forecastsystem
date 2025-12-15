// routes/authRoutes.js
import express from "express";
import {
  loginUser,
  registerSuperAdmin,
  registerUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js"; // Import the middleware

const router = express.Router();

// Auth routes
router.post("/login", loginUser);
router.post("/register", protect, registerUser); // Add protect middleware here!
router.post("/register-superuser", registerSuperAdmin);

export default router;