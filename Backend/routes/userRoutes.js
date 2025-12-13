import express from "express";
import { deleteUser, getUserById, getUsers, updateUser } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get all users (SuperAdmin only)
router.get("/", protect, allowRoles("SUPERADMIN"), getUsers);

// Get user by ID (SuperAdmin only)
router.get("/:id", protect, allowRoles("SUPERADMIN"), getUserById);

// Update user (SuperAdmin only)
router.put("/:id", protect, allowRoles("SUPERADMIN"), updateUser);

// Delete user (SuperAdmin only)
router.delete("/:id", protect, allowRoles("SUPERADMIN"), deleteUser);

export default router;

    if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID." });
    try {
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user.", error: err.message });
  } 