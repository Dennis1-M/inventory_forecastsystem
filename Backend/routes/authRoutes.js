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
  verifyToken
} from "../controllers/authController.js";
import { allowRoles, protect, superAdminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/login", loginUser);
router.post("/register-superuser", registerSuperAdmin);
router.get("/check-superadmin", checkSuperAdminExists);

// Protected
router.get("/verify", protect, verifyToken);
router.get("/me", protect, getMe);
router.post("/logout", protect, logoutUser);

// User management
router.get("/users", protect, allowRoles("SUPERADMIN", "ADMIN"), getAllUsers);
router.post("/register", protect, allowRoles("SUPERADMIN", "ADMIN"), registerUser);
router.put("/users/:id/status", protect, allowRoles("SUPERADMIN", "ADMIN"), updateUserStatus);
router.delete("/users/:id", protect, superAdminOnly, deleteUser);

export default router;
