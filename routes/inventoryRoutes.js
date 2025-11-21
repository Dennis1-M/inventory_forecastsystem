import express from "express";
import {
  getInventories,
  createInventory,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/inventoryController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ADMIN-only inventory management
router.use(verifyToken);
router.use(allowRoles("ADMIN"));

router.get("/", getInventories);
router.post("/", createInventory);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
