// routes/userRoutes.js
import express from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin and SuperAdmin can manage users
router.post("/", protect, allowRoles("ADMIN", "SUPERADMIN"), createUser);
router.get("/", protect, allowRoles("ADMIN", "SUPERADMIN"), getUsers);
router.get("/:id", protect, allowRoles("ADMIN", "SUPERADMIN"), getUserById);
router.put("/:id", protect, allowRoles("ADMIN", "SUPERADMIN"), updateUser);
router.delete("/:id", protect, allowRoles("ADMIN", "SUPERADMIN"), deleteUser);

export default router;
