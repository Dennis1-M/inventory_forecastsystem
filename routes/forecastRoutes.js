import express from "express";
import { runForecastForProduct } from "../controllers/forecastController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = express.Router();

router.post("/run", verifyToken, async (req, res) => {
  // call internal controller logic
  return runForecastForProduct(req, res);
});

router.get("/runs", verifyToken, async (req, res) => {
  try {
    const runs = await prisma.forecastRun.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/runs/:id/points", verifyToken, async (req, res) => {
  try {
    const points = await prisma.forecastPoint.findMany({ where: { runId: Number(req.params.id) }, orderBy: { period: "asc" }});
    res.json(points);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
