import express from "express";
import {
    adjustStock,
    getInventory,
    getInventoryMovements,
    getInventorySummary,
    getLowStockAlerts,
    receiveStock,
} from "../controllers/inventoryController.js";

import { createCycleCount, getCycleCount, listCycleCounts } from "../controllers/cycleCountController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Allow Managers to perform cycle counts as well as Admins/Superadmins
// Inserted before the global allowRoles middleware so MANAGER can access these endpoints
router.post('/cycle-counts', allowRoles('MANAGER', 'ADMIN', 'SUPERADMIN'), createCycleCount);
router.get('/cycle-counts', allowRoles('MANAGER', 'ADMIN', 'SUPERADMIN'), listCycleCounts);
router.get('/cycle-counts/:id', allowRoles('MANAGER', 'ADMIN', 'SUPERADMIN'), getCycleCount);

// Get inventory list (main endpoint for GET /api/inventory)
router.get('/', getInventory);

// MANAGER, ADMIN and SUPERADMIN can manage inventory (restock, adjust)
router.use(allowRoles("MANAGER", "ADMIN", "SUPERADMIN"));

// Receive new stock (restocking)
router.post("/receive", receiveStock);

// Adjust stock
router.post("/adjust", adjustStock);

// Movement audit log
router.get("/movements", getInventoryMovements);

// Low stock alerts
router.get("/low-stock", getLowStockAlerts);

// Inventory summary
router.get("/summary", getInventorySummary);

export default router;
