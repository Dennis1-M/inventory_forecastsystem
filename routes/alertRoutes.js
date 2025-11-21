import express from "express";
import {
  getAlerts,
  createAlert,
  resolveAlert,
  pushAlerts,
} from "../controllers/alertController.js";

const router = express.Router();

router.get("/", getAlerts);
router.post("/", createAlert); // Can be used by backend or cron
router.patch("/:id/resolve", resolveAlert);

// Push alerts to UI or mobile devices
router.post("/push", pushAlerts);

export default router;
