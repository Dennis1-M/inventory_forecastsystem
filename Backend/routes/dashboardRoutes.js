// routes/dashboardRoutes.js
import express from "express";
import { getAdminDashboard } from "../controllers/dashboardController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/dashboard
router.get("/", protect, allowRoles("SUPERADMIN", "ADMIN", "MANAGER"), getAdminDashboard);

export default router;
