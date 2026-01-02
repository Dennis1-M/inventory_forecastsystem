// routes/forecastTriggerRoutes.js
// ----------------------------------------------------
// Endpoint called after forecast generation
// ----------------------------------------------------

import express from "express";
import { triggerAlertsAfterForecast } from "../controllers/forecastTriggerController.js";

const router = express.Router();

// POST /api/forecast/trigger-alerts
router.post("/trigger-alerts", triggerAlertsAfterForecast);

export default router;
// routes/forecastTriggerRoutes.js