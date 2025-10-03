import express from "express";
import {
  getAlerts,
  createAlert,
  resolveAlert,
} from "../controllers/alertController.js";

const router = express.Router();

router.get("/", getAlerts);
router.post("/", createAlert);
router.put("/:id/resolve", resolveAlert);

export default router;
