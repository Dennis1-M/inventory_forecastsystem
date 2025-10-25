import express from "express";
import { getAlerts, createAlert, resolveAlert, pushAlerts } from "../controllers/alertController.js";
const router = express.Router();
router.get("/", getAlerts);
router.post("/", createAlert);
router.patch("/:id/resolve", resolveAlert);
router.post("/push", pushAlerts);
export default router;
