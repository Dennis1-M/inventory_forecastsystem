import express from "express";
import {
  checkSuperAdminExists,
  deleteUser,
  getAllUsers,
  getMe,
  loginUser,
  logoutUser,
  registerSuperAdmin,
  registerUser,
  updateUserStatus,
  verifyToken  // Changed from protect to verifyToken
} from "../controllers/authController.js";
import { allowRoles, protect, superAdminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/register-superuser", registerSuperAdmin);
router.get("/check-superadmin", checkSuperAdminExists);

// Protected routes (require authentication)
router.get("/verify", protect);  // This uses middleware protect

router.get("/me", protect, getMe);
router.post("/logout", protect, logoutUser);

// User management routes (Admin/SuperAdmin only)
router.get("/users", protect, allowRoles("SUPERADMIN", "ADMIN"), getAllUsers);
router.post("/register", protect, allowRoles("SUPERADMIN", "ADMIN"), registerUser);
router.put("/users/:id/status", protect, allowRoles("SUPERADMIN", "ADMIN"), updateUserStatus);
router.delete("/users/:id", protect, superAdminOnly, deleteUser);

export default router;
