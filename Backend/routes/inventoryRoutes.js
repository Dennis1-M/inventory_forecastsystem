import express from "express";
import {
  receiveStock,
  adjustStock,
  getInventoryMovements,
  getLowStockAlerts,
} from "../controllers/inventoryController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ADMIN-only inventory routes
router.use(protect);
router.use(allowRoles("ADMIN"));

// Receive new stock
router.post("/receive", receiveStock);

// Adjust stock
router.post("/adjust", adjustStock);

// Movement audit log
router.get("/movements", getInventoryMovements);

// Low stock alerts
router.get("/low-stock", getLowStockAlerts);

export default router;
