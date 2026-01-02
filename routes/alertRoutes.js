// routes/alertRoutes.js
import express from "express";
import {
  getActiveAlerts,
  resolveAlert
} from "../controllers/alertController.js";

const router = express.Router();

router.get("/", getActiveAlerts);
router.put("/:id/resolve", resolveAlert);

export default router;
