// routes/authRoutes.js
import express from "express";
import {
  checkSuperAdminExists, // Make sure this is imported
  getMe // If you have this function
  ,

  loginUser,
  logoutUser,
  registerSuperAdmin,
  registerUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/register-superuser", registerSuperAdmin);
router.get("/check-superadmin", checkSuperAdminExists); // This should work now

// Protected routes (require authentication)
router.get("/me", protect, getMe); // If you have this
router.post("/register", protect, registerUser);
router.post("/logout", protect, logoutUser); 


export default router;