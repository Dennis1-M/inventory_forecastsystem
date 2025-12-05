import express from "express";
import {
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes protected and ADMIN only
router.use(protect, allowRoles("ADMIN"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
