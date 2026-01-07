import express from "express";
import {
    createSale,
    deleteSale,
    getSaleById,
    getSales,
    getSalesForForecast,
    updateSale
} from "../controllers/saleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Forecast route
router.get("/forecast", protect, getSalesForForecast);

// Standard CRUD routes
router.get("/", protect, getSales);
// Allow STAFF to create sales (POS functionality)
router.post("/", protect, createSale);
router.get("/:id", protect, getSaleById);
router.put("/:id", protect, updateSale);
router.delete("/:id", protect, deleteSale);

export default router;
