import express from "express";
import {
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { errorHandler, notFound } from "../middleware/errorMiddleware.js";



const router = express.Router();

// SuperAdmin only
router.get("/", protect, allowRoles("SUPERADMIN"), getUsers);
router.get("/:id", protect, allowRoles("SUPERADMIN"), getUserById);
router.put("/:id", protect, allowRoles("SUPERADMIN"), updateUser);
router.delete("/:id", protect, allowRoles("SUPERADMIN"), deleteUser);

export default router;
