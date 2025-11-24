import express from "express";
import {
    registerUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from "../controllers/userController.js";

import { protect } from "../middleware/auth.js";
import { admin } from "../middleware/admin.js";

const router = express.Router();

// Public Registration
router.post("/register", registerUser);

// Admin-only user management
router.get("/", protect, admin, getUsers);
router.get("/:id", protect, admin, getUserById);
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);

export default router;
