import express from "express";
import {
    getAlerts,
    createAlert,
    resolveAlert,
    pushAlerts,
    getLowStockAlerts,
} from "../controllers/alertController.js";

const router = express.Router();

// Dynamic low stock alerts
router.get("/low-stock", getLowStockAlerts);

// Stored alerts
router.get("/", getAlerts);

// Create alert
router.post("/", createAlert);

// Resolve alert
router.patch("/:id/resolve", resolveAlert);

// Push alerts externally (mobile or UI)
router.post("/push", pushAlerts);

export default router;
