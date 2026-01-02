import express from "express";
import {
  adjustStock,
  getInventoryMovements,
  getInventorySummary,
  getLowStockAlerts,
  receiveStock,
} from "../controllers/inventoryController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Only ADMIN and SUPERADMIN can access inventory management
router.use(allowRoles("ADMIN", "SUPERADMIN"));

// Receive new stock
router.post("/receive", receiveStock);

// Adjust stock
router.post("/adjust", adjustStock);

// Movement audit log
router.get("/movements", getInventoryMovements);

// Low stock alerts
router.get("/low-stock", getLowStockAlerts);

// NEW: Inventory summary
router.get("/summary", getInventorySummary);

export default router;
