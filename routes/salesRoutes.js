import express from "express";
import { 
    getSales, 
    createSale, 
    getSaleById, 
    updateSale, 
    deleteSale,
    getSalesForForecast
} from "../controllers/saleController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Forecast route
router.get("/forecast", verifyToken, getSalesForForecast);

// Standard CRUD routes
router.get("/", verifyToken, getSales);
router.post("/", verifyToken, createSale);
router.get("/:id", verifyToken, getSaleById);
router.put("/:id", verifyToken, updateSale);
router.delete("/:id", verifyToken, deleteSale);

export default router;
