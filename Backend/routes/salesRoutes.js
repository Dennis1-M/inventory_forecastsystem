import express from "express";
import { getSales, createSale, getSaleById, updateSale, deleteSale , getSalesForForecast  } from "../controllers/salesController.js";
const router = express.Router();

router.get("/forecast", getSalesForForecast);
router.get("/", getSales);
router.post("/", createSale);
router.get("/:id", getSaleById);
router.put("/:id", updateSale);
router.delete("/:id", deleteSale);




export default router;
