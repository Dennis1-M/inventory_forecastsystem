import express from "express";
import { 
    getSales, 
    createSale, 
    getSaleById, 
    updateSale, 
    deleteSale,
    getSalesForForecast
} from "../controllers/saleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Forecast route
router.get("/forecast", protect, getSalesForForecast);

// Standard CRUD routes
router.get("/", protect, getSales);
router.post("/", protect, createSale);
router.get("/:id", protect, getSaleById);
router.put("/:id", protect, updateSale);
router.delete("/:id", protect, deleteSale);

export default router;
